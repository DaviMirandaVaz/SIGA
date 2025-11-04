package br.com.nextdev.gestao_cafe.repository;

import br.com.nextdev.gestao_cafe.model.UsuarioFazenda;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UsuarioFazendaRepository extends JpaRepository<UsuarioFazenda, Integer> {
    List<UsuarioFazenda> findByUsuario_IdUsuario(Integer idUsuario);
    List<UsuarioFazenda> findByFazenda_IdFazenda(Integer idFazenda);
}
