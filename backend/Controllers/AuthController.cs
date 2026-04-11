using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email e senha são obrigatórios." });
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null)
        {
            return Unauthorized(new { message = "Credenciais inválidas." });
        }

        var passwordMatches = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordMatches)
        {
            return Unauthorized(new { message = "Credenciais inválidas." });
        }

        var token = jwtTokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.Nome, user.Email, user.Role));
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new { message = "Preencha todos os campos obrigatórios." });
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "As senhas não coincidem." });
        }

        var role = request.Role.Trim().ToLowerInvariant();
        if (role is not ("colaborador" or "admin" or "diretor"))
        {
            return BadRequest(new { message = "Role inválida." });
        }

        var alreadyExists = await db.Users.AnyAsync(u => u.Email == request.Email);
        if (alreadyExists)
        {
            return Conflict(new { message = "Este email já está cadastrado." });
        }

        var user = new User
        {
            Nome = request.Nome,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = role
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, new { message = "Registro realizado com sucesso." });
    }
}
