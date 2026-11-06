package co.sena.seleccion;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean UserDetailsService users(JdbcTemplate db) {
        return correo -> db.query("SELECT u.correo,u.password_hash,u.activo,r.nombre AS rol FROM usuario u JOIN rol r ON r.id_rol=u.id_rol WHERE u.correo=?",
            (rs, row) -> User.withUsername(rs.getString("correo")).password(rs.getString("password_hash"))
                .roles(rs.getString("rol").toUpperCase(java.util.Locale.ROOT)).disabled(!rs.getBoolean("activo")).build(), correo)
            .stream().findFirst().orElseThrow(() -> new UsernameNotFoundException("Cuenta no encontrada"));
    }
    @Bean SecurityFilterChain security(HttpSecurity http, ObjectMapper mapper, SeleccionService service) throws Exception {
        // Las mutaciones requieren rol y token CSRF. El frontend no decide los permisos reales.
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/csrf", "/api/auth/login", "/error").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/candidatos", "/api/postulaciones").hasRole("ANALISTA")
            .requestMatchers(HttpMethod.PUT, "/api/candidatos/**").hasRole("ANALISTA")
            .requestMatchers(HttpMethod.PATCH, "/api/postulaciones/**").hasRole("ANALISTA")
            .requestMatchers("/api/**").authenticated().anyRequest().denyAll())
            .formLogin(form -> form.loginProcessingUrl("/api/auth/login").usernameParameter("correo").passwordParameter("password")
                .successHandler((req,res,auth) -> { res.setContentType("application/json;charset=UTF-8"); mapper.writeValue(res.getWriter(), service.usuario(auth.getName())); })
                .failureHandler((req,res,e) -> { res.setStatus(401);res.setContentType("application/json;charset=UTF-8");mapper.writeValue(res.getWriter(),Map.of("message","Correo o contraseña incorrectos.")); }))
            .logout(logout -> logout.logoutUrl("/api/auth/logout").logoutSuccessHandler((req,res,auth) -> {res.setStatus(204);}))
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((req,res,e) -> {res.setStatus(401);res.setContentType("application/json;charset=UTF-8");mapper.writeValue(res.getWriter(),Map.of("message","Inicia sesión para continuar."));})
                .accessDeniedHandler((req,res,e) -> {res.setStatus(403);res.setContentType("application/json;charset=UTF-8");mapper.writeValue(res.getWriter(),Map.of("message","No tienes permiso o la sesión de seguridad ha vencido."));}));
        return http.build();
    }
}
