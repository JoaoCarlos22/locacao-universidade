using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("locais")]
public class Local
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    [MaxLength(255)]
    public required string Nome { get; set; }

    [Column("tipo")]
    [MaxLength(40)]
    public required string Tipo { get; set; }

    [Column("bloco")]
    [MaxLength(255)]
    public string? Bloco { get; set; }

    [Column("numero")]
    [MaxLength(255)]
    public string? Numero { get; set; }

    [Column("observacoes")]
    public string? Observacoes { get; set; }

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    public ICollection<LocalRecurso> LocaisRecursos { get; set; } = new List<LocalRecurso>();
}
