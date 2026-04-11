namespace Backend.DTOs;

public record EquipamentoReservaRequest(int LocaisRecursosId, int Quantidade);

public record ReservaCreateRequest(
    int LocalId,
    string Motivo,
    DateTime InicioPer,
    DateTime FimPer,
    List<EquipamentoReservaRequest>? Equipamentos
);
