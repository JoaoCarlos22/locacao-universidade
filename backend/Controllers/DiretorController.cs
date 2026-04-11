using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "diretor")]
[Route("api/diretor")]
public class DiretorController(AppDbContext db) : ControllerBase
{
    [HttpGet("reservas")]
    public async Task<ActionResult> Reservas([FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? q)
    {
        var query = db.Reservas
            .Include(r => r.Solicitante)
            .Include(r => r.Local)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(r => r.Status == status);
        }

        if (from.HasValue)
        {
            query = query.Where(r => r.InicioPer >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(r => r.FimPer <= to.Value);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            if (int.TryParse(q, out var id))
            {
                query = query.Where(r => r.Id == id);
            }
            else
            {
                query = query.Where(r =>
                    (r.Local != null && EF.Functions.Like(r.Local.Nome, $"%{q}%")) ||
                    (r.Solicitante != null && EF.Functions.Like(r.Solicitante.Nome, $"%{q}%"))
                );
            }
        }

        var reservas = await query
            .OrderByDescending(r => r.InicioPer)
            .Select(r => new
            {
                r.Id,
                r.Motivo,
                r.InicioPer,
                r.FimPer,
                r.Status,
                SolicitanteNome = r.Solicitante != null ? r.Solicitante.Nome : null,
                LocalNome = r.Local != null ? r.Local.Nome : null
            })
            .ToListAsync();

        return Ok(reservas);
    }

    [HttpPost("reservas/{id:int}/aprovar")]
    public async Task<ActionResult> AprovarReserva(int id)
    {
        var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.Id == id);
        if (reserva is null)
        {
            return NotFound(new { message = "Reserva não encontrada." });
        }

        reserva.Status = "aprovado";
        await db.SaveChangesAsync();
        return Ok(new { message = "Reserva aprovada com sucesso." });
    }

    [HttpPost("reservas/{id:int}/reprovar")]
    public async Task<ActionResult> ReprovarReserva(int id)
    {
        var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.Id == id);
        if (reserva is null)
        {
            return NotFound(new { message = "Reserva não encontrada." });
        }

        reserva.Status = "rejeitado";
        await db.SaveChangesAsync();
        return Ok(new { message = "Reserva reprovada com sucesso." });
    }

    [HttpGet("locais")]
    public async Task<ActionResult> Locais()
    {
        var locais = await db.Locais
            .Include(l => l.LocaisRecursos)
            .ThenInclude(lr => lr.Recurso)
            .OrderBy(l => l.Nome)
            .Select(l => new
            {
                l.Id,
                l.Nome,
                l.Tipo,
                l.Bloco,
                l.Numero,
                l.Observacoes,
                Equipamentos = l.LocaisRecursos.Select(lr => new
                {
                    lr.Id,
                    lr.RecursoId,
                    RecursoNome = lr.Recurso != null ? lr.Recurso.Nome : null,
                    lr.Quantidade
                })
            })
            .ToListAsync();

        var recursos = await db.Recursos
            .OrderBy(r => r.Nome)
            .Select(r => new { r.Id, r.Nome })
            .ToListAsync();

        return Ok(new { locais, recursos });
    }

    [HttpPost("locais")]
    public async Task<ActionResult> CadastrarLocal([FromBody] LocalCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Tipo) ||
            string.IsNullOrWhiteSpace(request.Bloco) ||
            string.IsNullOrWhiteSpace(request.Numero))
        {
            return BadRequest(new { message = "Preencha todos os campos obrigatórios." });
        }

        var local = new Local
        {
            Nome = request.Nome,
            Tipo = request.Tipo,
            Bloco = request.Bloco,
            Numero = request.Numero,
            Observacoes = request.Observacoes
        };

        db.Locais.Add(local);
        await db.SaveChangesAsync();

        var equipamentos = request.Equipamentos?.Where(e => e.Quantidade > 0).ToList() ?? [];
        foreach (var equipamento in equipamentos)
        {
            var recursoExiste = await db.Recursos.AnyAsync(r => r.Id == equipamento.RecursoId);
            if (!recursoExiste)
            {
                continue;
            }

            db.LocaisRecursos.Add(new LocalRecurso
            {
                LocalId = local.Id,
                RecursoId = equipamento.RecursoId,
                Quantidade = equipamento.Quantidade
            });
        }

        await db.SaveChangesAsync();
        return StatusCode(StatusCodes.Status201Created, new { message = "Local cadastrado com sucesso." });
    }

    [HttpPut("locais/{id:int}")]
    public async Task<ActionResult> AtualizarLocal(int id, [FromBody] LocalCreateRequest request)
    {
        var local = await db.Locais.FirstOrDefaultAsync(l => l.Id == id);
        if (local is null)
        {
            return NotFound(new { message = "Local não encontrado." });
        }

        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Tipo) ||
            string.IsNullOrWhiteSpace(request.Bloco) ||
            string.IsNullOrWhiteSpace(request.Numero))
        {
            return BadRequest(new { message = "Preencha todos os campos obrigatórios." });
        }

        local.Nome = request.Nome;
        local.Tipo = request.Tipo;
        local.Bloco = request.Bloco;
        local.Numero = request.Numero;
        local.Observacoes = request.Observacoes;

        await db.SaveChangesAsync();
        return Ok(new { message = "Local atualizado com sucesso." });
    }

    [HttpDelete("locais/{id:int}")]
    public async Task<ActionResult> DeletarLocal(int id)
    {
        var local = await db.Locais.FirstOrDefaultAsync(l => l.Id == id);
        if (local is null)
        {
            return NotFound(new { message = "Local não encontrado." });
        }

        db.Locais.Remove(local);
        await db.SaveChangesAsync();
        return Ok(new { message = "Local deletado com sucesso." });
    }
}
