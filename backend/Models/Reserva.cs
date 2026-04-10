using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("reservas")]
public class Reserva
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("solicitante_id")]
    public int? SolicitanteId { get; set; }

    [Column("local_id")]
    public int? LocalId { get; set; }

    [Column("motivo")]
    public string? Motivo { get; set; }

    [Column("inicio_per")]
    public DateTime InicioPer { get; set; }

    [Column("fim_per")]
    public DateTime FimPer { get; set; }

    [Column("status")]
    [MaxLength(40)]
    public required string Status { get; set; }

    public User? Solicitante { get; set; }
    public Local? Local { get; set; }
    public ICollection<RecursoReserva> RecursosReservas { get; set; } = new List<RecursoReserva>();
}
