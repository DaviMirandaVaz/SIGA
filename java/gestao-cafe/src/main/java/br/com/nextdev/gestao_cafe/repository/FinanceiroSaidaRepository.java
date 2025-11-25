package br.com.nextdev.gestao_cafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.FinanceiroSaida;

import java.util.List;

public interface FinanceiroSaidaRepository extends JpaRepository<FinanceiroSaida, Integer> {
    List<FinanceiroSaida> findByFazenda_IdFazenda(Integer idFazenda);

}
