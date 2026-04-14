using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "colaborador")]
[Route("api/colaborador")]
public class ColaboradorController(AppDbContext db) : ControllerBase
{
    private int? GetAuthenticatedUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.Name);

        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard()
    {
        var colaboradorId = GetAuthenticatedUserId();
        if (colaboradorId is null)
        {
            return Unauthorized();
        }

        var reservas = await db.Reservas
            .Where(r => r.SolicitanteId == colaboradorId)
            .Include(r => r.Local)
            .OrderByDescending(r => r.InicioPer)
            .Select(r => new
            {
                r.Id,
                r.Motivo,
                r.InicioPer,
                r.FimPer,
                r.Status,
                LocalNome = r.Local != null ? r.Local.Nome : null
            })
            .ToListAsync();

        var locais = await db.Locais
            .OrderBy(l => l.Nome)
            .Select(l => new { l.Id, l.Nome, l.Bloco, l.Numero })
            .ToListAsync();

        var recursos = await db.Recursos
            .OrderBy(r => r.Nome)
            .Select(r => new { r.Id, r.Nome })
            .ToListAsync();

        var locaisRecursos = await db.LocaisRecursos
            .Select(lr => new { lr.Id, lr.LocalId, lr.RecursoId, lr.Quantidade })
            .ToListAsync();

        return Ok(new { reservas, locais, recursos, locaisRecursos });
    }

    [HttpPost("reservas")]
    public async Task<ActionResult> Reservar([FromBody] ReservaCreateRequest request)
    {
        var colaboradorId = GetAuthenticatedUserId();
        if (colaboradorId is null)
        {
            return Unauthorized();
        }

        if (request.LocalId <= 0 || string.IsNullOrWhiteSpace(request.Motivo))
        {
            return BadRequest(new { message = "Informe local e motivo da reserva." });
        }

        if (request.InicioPer >= request.FimPer)
        {
            return BadRequest(new { message = "O início deve ser anterior ao fim." });
        }

        var localExists = await db.Locais.AnyAsync(l => l.Id == request.LocalId);
        if (!localExists)
        {
            return NotFound(new { message = "Local selecionado não existe." });
        }

        var conflito = await db.Reservas.AnyAsync(r =>
            r.LocalId == request.LocalId &&
            r.InicioPer < request.FimPer &&
            r.FimPer > request.InicioPer &&
            (r.Status == "pendente" || r.Status == "aprovado"));

        if (conflito)
        {
            return Conflict(new { message = "O local já está reservado no período selecionado." });
        }

        var equipamentos = request.Equipamentos?
            .Where(e => e.Quantidade > 0)
            .ToList() ?? [];

        foreach (var item in equipamentos)
        {
            var lr = await db.LocaisRecursos
                .FirstOrDefaultAsync(x => x.Id == item.LocaisRecursosId);

            if (lr is null || lr.LocalId != request.LocalId)
            {
                return BadRequest(new { message = $"Equipamento inválido para local (id {item.LocaisRecursosId})." });
            }

            var reservado = await db.RecursosReservas
                .Where(rr => rr.LocaisRecursosId == item.LocaisRecursosId)
                .Join(db.Reservas,
                    rr => rr.ReservaId,
                    r => r.Id,
                    (rr, r) => new { rr, r })
                .Where(x => x.r.InicioPer < request.FimPer
                            && x.r.FimPer > request.InicioPer
                            && (x.r.Status == "pendente" || x.r.Status == "aprovado"))
                .SumAsync(x => (int?)x.rr.Quantidade) ?? 0;

            var disponivel = lr.Quantidade - reservado;
            if (item.Quantidade > disponivel)
            {
                return BadRequest(new
                {
                    message = $"Quantidade solicitada para equipamento {item.LocaisRecursosId} excede a disponibilidade ({disponivel})."
                });
            }
        }

        var reserva = new Reserva
        {
            LocalId = request.LocalId,
            SolicitanteId = colaboradorId.Value,
            Motivo = request.Motivo,
            InicioPer = request.InicioPer,
            FimPer = request.FimPer,
            Status = "pendente"
        };

        db.Reservas.Add(reserva);
        await db.SaveChangesAsync();

        foreach (var item in equipamentos)
        {
            db.RecursosReservas.Add(new RecursoReserva
            {
                ReservaId = reserva.Id,
                LocaisRecursosId = item.LocaisRecursosId,
                Quantidade = item.Quantidade
            });
        }

        await db.SaveChangesAsync();
        return StatusCode(StatusCodes.Status201Created, new { message = "Reserva criada com sucesso." });
    }
}
