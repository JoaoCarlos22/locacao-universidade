using Backend.Data;

namespace Backend.Services;

public class DatabaseHealthService(AppDbContext db)
{
    public async Task<(bool IsConnected, string? ErrorMessage)> CheckConnectionAsync()
    {
        try
        {
            var canConnect = await db.Database.CanConnectAsync();
            if (!canConnect)
            {
                return (false, "Nao foi possivel conectar ao banco de dados.");
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
}