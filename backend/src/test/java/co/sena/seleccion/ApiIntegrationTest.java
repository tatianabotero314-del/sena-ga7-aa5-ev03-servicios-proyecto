package co.sena.seleccion;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:tests;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE"})
@AutoConfigureMockMvc
class ApiIntegrationTest {
 @Autowired MockMvc mvc;@Autowired ObjectMapper mapper;
 String candidato="{\"tipoDocumento\":\"CC\",\"numeroDocumento\":\"TEST-001\",\"nombres\":\"Ana\",\"apellidos\":\"Test\",\"correo\":\"ana@example.com\",\"telefono\":\"3001234567\"}";
 @Test void loginConservaTildesUtf8()throws Exception{
  mvc.perform(post("/api/auth/login").with(csrf()).param("correo","analista@demo.local").param("password","Practica2026!"))
   .andExpect(status().isOk()).andExpect(content().contentType("application/json;charset=UTF-8"))
   .andExpect(jsonPath("$.nombre").value("Analista de práctica"));
 }
 @Test void exigeSesion()throws Exception{mvc.perform(get("/api/candidatos")).andExpect(status().isUnauthorized());}
 @Test void coordinadorNoPuedeEscribir()throws Exception{mvc.perform(post("/api/candidatos").with(user("coordinador@demo.local").roles("COORDINADOR")).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(candidato)).andExpect(status().isForbidden());}
 @Test void rechazaSinCsrf()throws Exception{mvc.perform(post("/api/candidatos").with(user("analista@demo.local").roles("ANALISTA")).contentType(MediaType.APPLICATION_JSON).content(candidato)).andExpect(status().isForbidden());}
 @Test void rechazaNombreVacio()throws Exception{mvc.perform(post("/api/candidatos").with(user("analista@demo.local").roles("ANALISTA")).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(candidato.replace("\"nombres\":\"Ana\"","\"nombres\":\"  \""))).andExpect(status().isBadRequest());}
 @Test void registroDuplicadosEstadoEHistorial()throws Exception{
  var analista=user("analista@demo.local").roles("ANALISTA");
  String result=mvc.perform(post("/api/candidatos").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(candidato)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
  long id=mapper.readTree(result).get("id").asLong();
  mvc.perform(post("/api/candidatos").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(candidato)).andExpect(status().isConflict());
  String body="{\"idCandidato\":"+id+",\"idVacante\":1}";
  String post=mvc.perform(post("/api/postulaciones").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
  long pid=mapper.readTree(post).get("id").asLong();
  mvc.perform(post("/api/postulaciones").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
  mvc.perform(patch("/api/postulaciones/"+pid+"/estado").with(analista).with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"Seleccionado\",\"observacion\":\"Entrevista aprobada\"}")).andExpect(status().isNoContent());
  mvc.perform(get("/api/postulaciones/"+pid+"/historial").with(analista)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2)).andExpect(jsonPath("$[1].estado").value("Seleccionado")).andExpect(jsonPath("$[1].responsable").value("Analista de práctica"));
 }
}
