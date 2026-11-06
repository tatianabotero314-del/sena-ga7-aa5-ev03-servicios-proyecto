package co.sena.seleccion;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

/** Adaptador HTTP: delega las reglas y transacciones al servicio reutilizable. */
@RestController
@RequestMapping("/api")
public class SeleccionController {
    private final SeleccionService service;

    public SeleccionController(SeleccionService service) {
        this.service = service;
    }

    // Spring Security procesa login/logout; el cliente conserva la cookie de sesión.
    @GetMapping("/auth/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @GetMapping("/auth/me")
    public Map<String, Object> me(Principal user) {
        return service.usuario(user.getName());
    }

    @GetMapping("/candidatos")
    public List<Map<String, Object>> candidatos(
            @RequestParam(defaultValue = "") @Size(max = 100) String busqueda) {
        return service.candidatos(busqueda);
    }

    @GetMapping("/candidatos/{id}")
    public Map<String, Object> candidato(@PathVariable @Positive long id) {
        return service.candidato(id);
    }

    @PostMapping("/candidatos")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crear(@Valid @RequestBody Dtos.CandidatoInput datos) {
        return service.crearCandidato(datos);
    }

    @PutMapping("/candidatos/{id}")
    public Map<String, Object> editar(@PathVariable @Positive long id,
            @Valid @RequestBody Dtos.CandidatoInput datos) {
        return service.editarCandidato(id, datos);
    }

    @GetMapping("/vacantes")
    public List<Map<String, Object>> vacantes() {
        return service.vacantes();
    }

    @GetMapping("/candidatos/{id}/postulaciones")
    public List<Map<String, Object>> postulaciones(@PathVariable @Positive long id) {
        return service.postulaciones(id);
    }

    @PostMapping("/postulaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> postular(@Valid @RequestBody Dtos.PostulacionInput datos,
            Principal user) {
        // El responsable se obtiene de la sesión, no del JSON del cliente.
        return service.postular(datos, user.getName());
    }

    @PatchMapping("/postulaciones/{id}/estado")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void estado(@PathVariable @Positive long id,
            @Valid @RequestBody Dtos.EstadoInput datos, Principal user) {
        service.cambiarEstado(id, datos, user.getName());
    }

    @GetMapping("/postulaciones/{id}/historial")
    public List<Map<String, Object>> historial(@PathVariable @Positive long id) {
        return service.historial(id);
    }
}
