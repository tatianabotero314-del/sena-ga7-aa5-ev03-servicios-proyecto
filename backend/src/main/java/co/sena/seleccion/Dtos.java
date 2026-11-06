package co.sena.seleccion;

import jakarta.validation.constraints.*;
public final class Dtos {
    private Dtos() { }
    public record CandidatoInput(
        @NotBlank @Size(max=10) String tipoDocumento,
        @NotBlank @Size(max=30) String numeroDocumento,
        @NotBlank @Size(max=80) String nombres,
        @NotBlank @Size(max=80) String apellidos,
        @NotBlank @Email @Size(max=150) String correo,
        @NotBlank @Size(max=25) String telefono) { }
    public record PostulacionInput(@NotNull @Positive Long idCandidato, @NotNull @Positive Long idVacante) { }
    public record EstadoInput(@NotBlank @Pattern(regexp="En proceso|Seleccionado|Rechazado") String estado,
        @NotBlank @Size(max=500) String observacion) { }
}
