package br.com.nextdev.gestao_cafe.repository;

import br.com.nextdev.gestao_cafe.model.Fazenda;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.FinanceiroEntrada;

import java.util.List;

public interface FinanceiroEntradaRepository extends JpaRepository<FinanceiroEntrada, Integer> {
    List<FinanceiroEntrada> findByFazenda_IdFazenda(Integer idFazenda);
    List<FinanceiroEntrada> findByFazendaIn(List<Fazenda> fazendas);
}

