package br.com.nextdev.gestao_cafe.repository;

import br.com.nextdev.gestao_cafe.model.Fazenda;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.FinanceiroSaida;

import java.util.List;

public interface FinanceiroSaidaRepository extends JpaRepository<FinanceiroSaida, Integer> {
    List<FinanceiroSaida> findByFazenda_IdFazenda(Integer idFazenda);
    List<FinanceiroSaida> findByFazendaIn(List<Fazenda> fazendas);
}
