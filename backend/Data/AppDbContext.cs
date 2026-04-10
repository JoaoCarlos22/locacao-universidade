using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Local> Locais => Set<Local>();
    public DbSet<Recurso> Recursos => Set<Recurso>();
    public DbSet<LocalRecurso> LocaisRecursos => Set<LocalRecurso>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<RecursoReserva> RecursosReservas => Set<RecursoReserva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LocalRecurso>()
            .HasIndex(lr => new { lr.LocalId, lr.RecursoId })
            .IsUnique();

        modelBuilder.Entity<Reserva>()
            .HasOne(r => r.Local)
            .WithMany(l => l.Reservas)
            .HasForeignKey(r => r.LocalId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Reserva>()
            .HasOne(r => r.Solicitante)
            .WithMany(u => u.Reservas)
            .HasForeignKey(r => r.SolicitanteId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RecursoReserva>()
            .HasOne(rr => rr.Reserva)
            .WithMany(r => r.RecursosReservas)
            .HasForeignKey(rr => rr.ReservaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RecursoReserva>()
            .HasOne(rr => rr.LocalRecurso)
            .WithMany(lr => lr.RecursosReservas)
            .HasForeignKey(rr => rr.LocaisRecursosId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
