using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize(Roles = "admin")]
[Route("api/admin")]
public class AdminController(AppDbContext db) : ControllerBase
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

    [HttpPost("reservas/{id:int}/enviar-diretoria")]
    public async Task<ActionResult> EnviarReserva(int id)
    {
        var reserva = await db.Reservas.FirstOrDefaultAsync(r => r.Id == id);
        if (reserva is null)
        {
            return NotFound(new { message = "Reserva não encontrada." });
        }

        // O schema atual não possui status intermediário no enum, então mantém pendente.
        reserva.Status = "pendente";
        await db.SaveChangesAsync();
        return Ok(new { message = "Reserva encaminhada para diretoria." });
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
}
