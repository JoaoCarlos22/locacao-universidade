using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[AllowAnonymous]
[Route("health")]
public class HealthController(DatabaseHealthService databaseHealthService) : ControllerBase
{
    [HttpGet("db")]
    public async Task<ActionResult> GetDatabaseStatus()
    {
        var (isConnected, errorMessage) = await databaseHealthService.CheckConnectionAsync();

        if (!isConnected)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                title = "Database unavailable",
                detail = errorMessage ?? "Nao foi possivel conectar ao banco de dados."
            });
        }

        return Ok(new { status = "ok", database = "connected" });
    }
}