package br.com.nextdev.gestao_cafe.repository;

import br.com.nextdev.gestao_cafe.model.Fazenda;
import br.com.nextdev.gestao_cafe.model.ProdutosEntrada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutosEntradaRepository extends JpaRepository<ProdutosEntrada, Integer> {
    // Mudamos de findByFazenda para findByFazendaIn (aceita uma lista)
    List<ProdutosEntrada> findByFazendaIn(List<Fazenda> fazendas);
}