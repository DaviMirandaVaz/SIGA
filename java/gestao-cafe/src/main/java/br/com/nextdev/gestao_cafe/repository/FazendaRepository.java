package br.com.nextdev.gestao_cafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.Fazenda;

import java.util.List;

public interface FazendaRepository extends JpaRepository<Fazenda, Integer> {
    List<Fazenda> findByUsuario_IdUsuario(Integer idUsuario);
}


