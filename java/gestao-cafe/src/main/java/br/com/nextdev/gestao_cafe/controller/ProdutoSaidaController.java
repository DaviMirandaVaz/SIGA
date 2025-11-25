package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.ProdutoSaida;
import br.com.nextdev.gestao_cafe.repository.ProdutoSaidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtosSaida")
@CrossOrigin(origins = "*")
public class ProdutoSaidaController {

    @Autowired
    private ProdutoSaidaRepository produtoSaidaRepository;

    @GetMapping
    public List<ProdutoSaida> listar() {
        List<ProdutoSaida> lista = produtoSaidaRepository.findAll();
        lista.forEach(p -> {
            if (p.getFazenda() != null) {
                p.getFazenda().getIdFazenda(); // força o carregamento
            }
        });
        return lista;
    }


    @PostMapping
    public ProdutoSaida cadastrar(@RequestBody ProdutoSaida produto) {
        return produtoSaidaRepository.save(produto);
    }

    @PutMapping("/{id}")
    public ProdutoSaida atualizar(@PathVariable Integer id, @RequestBody ProdutoSaida novoProduto) {
        return produtoSaidaRepository.findById(id)
                .map(p -> {
                    p.setNomeProduto(novoProduto.getNomeProduto());
                    p.setQuantidade(novoProduto.getQuantidade());
                    p.setUnidadeMedida(novoProduto.getUnidadeMedida());
                    p.setValorVenda(novoProduto.getValorVenda());
                    p.setDataVenda(novoProduto.getDataVenda());

                    // ✅ Atualiza a fazenda associada, se houver
                    if (novoProduto.getFazenda() != null && novoProduto.getFazenda().getIdFazenda() != null) {
                        p.setFazenda(novoProduto.getFazenda());
                    }

                    return produtoSaidaRepository.save(p);
                }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        produtoSaidaRepository.deleteById(id);
    }
}

