package br.com.nextdev.gestao_cafe.repository;

import br.com.nextdev.gestao_cafe.model.Fazenda;
import br.com.nextdev.gestao_cafe.model.ProdutoSaida;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoSaidaRepository extends JpaRepository<ProdutoSaida, Integer> {
    List<ProdutoSaida> findByFazendaIn(List<Fazenda> fazendas);
    List<ProdutoSaida> findByFazenda_IdFazenda(Integer idFazenda);

}