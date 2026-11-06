package co.sena.seleccion;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component
public class DemoData implements ApplicationRunner {
    private final JdbcTemplate db;private final PasswordEncoder encoder;
    @Value("${app.demo.enabled}") private boolean enabled;
    @Value("${app.demo.password}") private String password;
    public DemoData(JdbcTemplate db,PasswordEncoder encoder){this.db=db;this.encoder=encoder;}
    @Override @Transactional public void run(ApplicationArguments args){
        if(!enabled)return;
        // Se siembra únicamente una base nueva. Reiniciar no borra ni duplica registros.
        if(db.queryForObject("SELECT COUNT(*) FROM rol",Integer.class)>0)return;
        db.update("INSERT INTO rol(id_rol,nombre) VALUES(1,'Analista'),(2,'Coordinador')");
        String hash=encoder.encode(password);
        db.update("INSERT INTO usuario(id_rol,nombre,correo,password_hash) VALUES(1,'Analista de práctica','analista@demo.local',?),(2,'Coordinador de práctica','coordinador@demo.local',?)",hash,hash);
        db.update("INSERT INTO estado_seleccion(id_estado,nombre) VALUES(1,'En proceso'),(2,'Seleccionado'),(3,'Rechazado')");
        db.update("INSERT INTO cargo(id_cargo,nombre,descripcion) VALUES(1,'Operario de limpieza','Aseo y mantenimiento de espacios.'),(2,'Supervisor','Coordinación del equipo de servicios generales.'),(3,'Auxiliar administrativo','Apoyo documental y administrativo.')");
        db.update("INSERT INTO vacante(id_cargo,cupos,fecha_apertura,estado) VALUES(1,5,'2026-11-05','Abierta'),(2,2,'2026-11-05','Abierta'),(3,1,'2026-11-05','Abierta')");
        db.update("INSERT INTO candidato(tipo_documento,numero_documento,nombres,apellidos,correo,telefono) VALUES('CC','DEMO-001','Ana','Ejemplo','ana@example.com','3000000001'),('CC','DEMO-002','Carlos','Ejemplo','carlos@example.com','3000000002')");
    }
}
