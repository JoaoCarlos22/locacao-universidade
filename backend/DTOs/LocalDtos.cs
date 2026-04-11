namespace Backend.DTOs;

public record LocalEquipamentoRequest(int RecursoId, int Quantidade);

public record LocalCreateRequest(
    string Nome,
    string Tipo,
    string Bloco,
    string Numero,
    string? Observacoes,
    List<LocalEquipamentoRequest>? Equipamentos
);
