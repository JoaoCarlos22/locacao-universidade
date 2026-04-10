using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("recursos")]
public class Recurso
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    [MaxLength(255)]
    public required string Nome { get; set; }

    [Column("quantidade")]
    public int Quantidade { get; set; }

    public ICollection<LocalRecurso> LocaisRecursos { get; set; } = new List<LocalRecurso>();
}
