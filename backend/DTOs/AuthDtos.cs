namespace Backend.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Nome, string Email, string Password, string ConfirmPassword, string Role);

public record AuthResponse(string Token, int UserId, string Nome, string Email, string Role);
