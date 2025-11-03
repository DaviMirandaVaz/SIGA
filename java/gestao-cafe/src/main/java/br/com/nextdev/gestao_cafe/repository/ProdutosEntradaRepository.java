package br.com.nextdev.gestao_cafe.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.nextdev.gestao_cafe.model.ProdutosEntrada;

public interface ProdutosEntradaRepository extends JpaRepository<ProdutosEntrada, Integer> { }
