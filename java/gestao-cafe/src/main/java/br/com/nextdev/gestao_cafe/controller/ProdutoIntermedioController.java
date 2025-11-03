package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.ProdutoIntermedio;
import br.com.nextdev.gestao_cafe.repository.ProdutoIntermedioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtosIntermedios")
@CrossOrigin(origins = "*")
public class ProdutoIntermedioController {

    @Autowired
    private ProdutoIntermedioRepository produtoIntermedioRepository;

    @GetMapping
    public List<ProdutoIntermedio> listar() {
        return produtoIntermedioRepository.findAll();
    }

    @PostMapping
    public ProdutoIntermedio cadastrar(@RequestBody ProdutoIntermedio produto) {
        return produtoIntermedioRepository.save(produto);
    }

    @PutMapping("/{id}")
    public ProdutoIntermedio atualizar(@PathVariable Integer id, @RequestBody ProdutoIntermedio novoProduto) {
        return produtoIntermedioRepository.findById(id)
                .map(p -> {
                    p.setNomeProduto(novoProduto.getNomeProduto());
                    p.setTipo(novoProduto.getTipo());
                    p.setQuantidade(novoProduto.getQuantidade());
                    p.setValorEstimado(novoProduto.getValorEstimado());
                    p.setDataInicio(novoProduto.getDataInicio());
                    p.setStatus(novoProduto.getStatus());
                    return produtoIntermedioRepository.save(p);
                }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        produtoIntermedioRepository.deleteById(id);
    }
}

