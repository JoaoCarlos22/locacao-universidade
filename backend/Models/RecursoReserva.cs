using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

[Table("recursos_reservas")]
public class RecursoReserva
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("reserva_id")]
    public int ReservaId { get; set; }

    [Column("locais_recursos_id")]
    public int LocaisRecursosId { get; set; }

    [Column("quantidade")]
    public int Quantidade { get; set; }

    public Reserva? Reserva { get; set; }
    public LocalRecurso? LocalRecurso { get; set; }
}
