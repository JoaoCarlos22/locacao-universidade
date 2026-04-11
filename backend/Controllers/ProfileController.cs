using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ProfileController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> Get()
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name), out var userId))
        {
            if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId))
            {
                var sub = User.FindFirstValue("sub");
                if (!int.TryParse(sub, out userId))
                {
                    return Unauthorized();
                }
            }
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        return Ok(new
        {
            user.Id,
            user.Nome,
            user.Email,
            user.Role
        });
    }

    [HttpPut]
    public async Task<ActionResult> Update([FromBody] ProfileUpdateRequest request)
    {
        var sub = User.FindFirstValue("sub");
        if (!int.TryParse(sub, out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Nome e email são obrigatórios." });
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound(new { message = "Usuário não encontrado." });
        }

        user.Nome = request.Nome;
        user.Email = request.Email;

        if (!string.IsNullOrWhiteSpace(request.Senha))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Perfil atualizado com sucesso." });
    }
}
