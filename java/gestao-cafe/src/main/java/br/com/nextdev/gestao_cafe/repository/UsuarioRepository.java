package br.com.nextdev.gestao_cafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.Usuario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByUsuarioDono_IdUsuario(Integer idDono);
}
