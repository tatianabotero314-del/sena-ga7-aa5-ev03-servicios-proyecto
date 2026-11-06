package co.sena.seleccion;

import java.sql.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class SeleccionService {
    private final JdbcTemplate db;
    public SeleccionService(JdbcTemplate db) { this.db=db; }
    private ResponseStatusException noExiste() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"No se encontró el registro solicitado."); }
    private Map<String,Object> mapCandidato(ResultSet r) throws SQLException {
        return Map.of("id",r.getLong("id_candidato"),"tipoDocumento",r.getString("tipo_documento"),"numeroDocumento",r.getString("numero_documento"),
            "nombres",r.getString("nombres"),"apellidos",r.getString("apellidos"),"correo",r.getString("correo"),"telefono",r.getString("telefono"));
    }
    public Map<String,Object> usuario(String correo) {
        return db.query("SELECT u.id_usuario,u.nombre,u.correo,r.nombre AS rol FROM usuario u JOIN rol r ON r.id_rol=u.id_rol WHERE u.correo=?",
            (r,i)->Map.<String,Object>of("id",r.getLong("id_usuario"),"nombre",r.getString("nombre"),"correo",r.getString("correo"),"rol",r.getString("rol")),correo).stream().findFirst().orElseThrow(this::noExiste);
    }
    public List<Map<String,Object>> candidatos(String busqueda) {
        // LOCATE parametrizado trata %, _ y comillas como texto, no como instrucciones SQL.
        String q=busqueda.trim().toLowerCase(Locale.ROOT);
        return db.query("SELECT * FROM candidato WHERE LOCATE(?,LOWER(CONCAT(nombres,' ',apellidos,' ',numero_documento)))>0 ORDER BY apellidos,nombres,id_candidato",(r,i)->mapCandidato(r),q);
    }
    public Map<String,Object> candidato(long id) { return db.query("SELECT * FROM candidato WHERE id_candidato=?",(r,i)->mapCandidato(r),id).stream().findFirst().orElseThrow(this::noExiste); }
    private long insertar(String sql, String idColumn, Object... args) {
        GeneratedKeyHolder key=new GeneratedKeyHolder();
        db.update(c->{PreparedStatement ps=c.prepareStatement(sql,new String[]{idColumn});for(int i=0;i<args.length;i++)ps.setObject(i+1,args[i]);return ps;},key);
        return Objects.requireNonNull(key.getKey()).longValue();
    }
    @Transactional public Map<String,Object> crearCandidato(Dtos.CandidatoInput d) {
        long id=insertar("INSERT INTO candidato(tipo_documento,numero_documento,nombres,apellidos,correo,telefono) VALUES(?,?,?,?,?,?)","id_candidato",d.tipoDocumento().trim(),d.numeroDocumento().trim(),d.nombres().trim(),d.apellidos().trim(),d.correo().trim(),d.telefono().trim());
        return candidato(id);
    }
    @Transactional public Map<String,Object> editarCandidato(long id,Dtos.CandidatoInput d) {
        candidato(id);db.update("UPDATE candidato SET tipo_documento=?,numero_documento=?,nombres=?,apellidos=?,correo=?,telefono=? WHERE id_candidato=?",d.tipoDocumento().trim(),d.numeroDocumento().trim(),d.nombres().trim(),d.apellidos().trim(),d.correo().trim(),d.telefono().trim(),id);return candidato(id);
    }
    public List<Map<String,Object>> vacantes() {
        return db.query("SELECT v.*,c.nombre AS cargo,c.descripcion FROM vacante v JOIN cargo c ON c.id_cargo=v.id_cargo ORDER BY v.id_vacante",(r,i)->Map.<String,Object>of("id",r.getLong("id_vacante"),"cargo",r.getString("cargo"),"descripcion",r.getString("descripcion"),"cupos",r.getInt("cupos"),"estado",r.getString("estado"),"fechaApertura",r.getDate("fecha_apertura").toString()));
    }
    public List<Map<String,Object>> postulaciones(long candidato) {
        candidato(candidato);
        return db.query("SELECT p.*,e.nombre AS estado,c.nombre AS cargo FROM postulacion p JOIN estado_seleccion e ON e.id_estado=p.id_estado JOIN vacante v ON v.id_vacante=p.id_vacante JOIN cargo c ON c.id_cargo=v.id_cargo WHERE p.id_candidato=? ORDER BY p.id_postulacion",(r,i)->Map.<String,Object>of("id",r.getLong("id_postulacion"),"idVacante",r.getLong("id_vacante"),"cargo",r.getString("cargo"),"estado",r.getString("estado"),"fecha",r.getTimestamp("fecha_postulacion").toLocalDateTime().toString()),candidato);
    }
    private long estadoId(String estado){return db.queryForObject("SELECT id_estado FROM estado_seleccion WHERE nombre=?",Long.class,estado);}
    private long usuarioId(String correo){return ((Number)usuario(correo).get("id")).longValue();}
    @Transactional public Map<String,Object> postular(Dtos.PostulacionInput d,String correo) {
        candidato(d.idCandidato());
        var estados=db.queryForList("SELECT estado FROM vacante WHERE id_vacante=? FOR UPDATE",String.class,d.idVacante());
        if(estados.isEmpty())throw noExiste();
        if(!estados.get(0).equals("Abierta"))throw new ResponseStatusException(HttpStatus.CONFLICT,"La vacante está cerrada.");
        long estado=estadoId("En proceso");
        long id=insertar("INSERT INTO postulacion(id_candidato,id_vacante,id_estado) VALUES(?,?,?)","id_postulacion",d.idCandidato(),d.idVacante(),estado);
        db.update("INSERT INTO historial_estado(id_postulacion,id_estado,id_usuario,observacion) VALUES(?,?,?,?)",id,estado,usuarioId(correo),"Registro inicial de la postulación.");
        return Map.of("id",id);
    }
    @Transactional public void cambiarEstado(long id,Dtos.EstadoInput d,String correo) {
        var anteriores=db.queryForList("SELECT id_estado FROM postulacion WHERE id_postulacion=? FOR UPDATE",Long.class,id);
        if(anteriores.isEmpty())throw noExiste();
        long estado=estadoId(d.estado());
        if(anteriores.get(0)==estado)throw new ResponseStatusException(HttpStatus.CONFLICT,"La postulación ya tiene ese estado.");
        // La transacción garantiza que estado e historial se confirmen juntos.
        db.update("UPDATE postulacion SET id_estado=? WHERE id_postulacion=?",estado,id);
        db.update("INSERT INTO historial_estado(id_postulacion,id_estado,id_usuario,observacion) VALUES(?,?,?,?)",id,estado,usuarioId(correo),d.observacion().trim());
    }
    public List<Map<String,Object>> historial(long id) {
        if(db.queryForObject("SELECT COUNT(*) FROM postulacion WHERE id_postulacion=?",Integer.class,id)==0)throw noExiste();
        return db.query("SELECT h.*,e.nombre AS estado,u.nombre AS responsable FROM historial_estado h JOIN estado_seleccion e ON e.id_estado=h.id_estado JOIN usuario u ON u.id_usuario=h.id_usuario WHERE h.id_postulacion=? ORDER BY h.fecha_cambio,h.id_historial",(r,i)->Map.<String,Object>of("id",r.getLong("id_historial"),"estado",r.getString("estado"),"responsable",r.getString("responsable"),"observacion",r.getString("observacion"),"fecha",r.getTimestamp("fecha_cambio").toLocalDateTime().toString()),id);
    }
}
