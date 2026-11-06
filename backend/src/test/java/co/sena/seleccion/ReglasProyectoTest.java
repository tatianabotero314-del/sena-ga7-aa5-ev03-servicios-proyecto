package co.sena.seleccion;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/** Aísla los datos mediante rollback y comprueba invariantes de negocio. */
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:reglas;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE"})
@AutoConfigureMockMvc
@Transactional
class ReglasProyectoTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate db;
    @Autowired ObjectMapper mapper;

    @Test void vacanteCerradaNoCreaPostulacion() throws Exception {
        var analista=user("analista@demo.local").roles("ANALISTA");
        String body="{\"tipoDocumento\":\"CC\",\"numeroDocumento\":\"CERRADA-01\",\"nombres\":\"Ana\",\"apellidos\":\"Prueba\",\"correo\":\"ana@example.com\",\"telefono\":\"3001234567\"}";
        String result=mvc.perform(post("/api/candidatos").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        long id=mapper.readTree(result).get("id").asLong();
        db.update("UPDATE vacante SET estado='Cerrada' WHERE id_vacante=1");
        mvc.perform(post("/api/postulaciones").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"idCandidato\":"+id+",\"idVacante\":1}"))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.message").value("La vacante está cerrada."));
        assertEquals(0,db.queryForObject("SELECT COUNT(*) FROM postulacion WHERE id_candidato=?",Integer.class,id));
    }

    @Test void historialInexistenteDevuelve404() throws Exception {
        mvc.perform(get("/api/postulaciones/99999999/historial").with(user("analista@demo.local").roles("ANALISTA")))
            .andExpect(status().isNotFound());
    }
}
