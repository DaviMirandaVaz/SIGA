package br.com.nextdev.gestao_cafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.ProdutoIntermedio;

public interface ProdutoIntermedioRepository extends JpaRepository<ProdutoIntermedio, Integer> { }
