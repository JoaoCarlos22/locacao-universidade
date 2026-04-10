using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("locais_recursos")]
public class LocalRecurso
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("local_id")]
    public int LocalId { get; set; }

    [Column("recurso_id")]
    public int RecursoId { get; set; }

    [Column("quantidade")]
    public int Quantidade { get; set; }

    public Local? Local { get; set; }
    public Recurso? Recurso { get; set; }
    public ICollection<RecursoReserva> RecursosReservas { get; set; } = new List<RecursoReserva>();
}
