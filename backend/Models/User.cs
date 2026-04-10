using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    [MaxLength(255)]
    public required string Nome { get; set; }

    [Column("email")]
    [MaxLength(255)]
    public required string Email { get; set; }

    [Column("password_hash")]
    [MaxLength(255)]
    public required string PasswordHash { get; set; }

    [Column("role")]
    [MaxLength(40)]
    public required string Role { get; set; }

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
