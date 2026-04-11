namespace Backend.DTOs;

public record ProfileUpdateRequest(string Nome, string Email, string? Senha);
