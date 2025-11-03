package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.ProdutosEntrada;
import br.com.nextdev.gestao_cafe.repository.ProdutosEntradaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtosEntrada")
@CrossOrigin(origins = "*")
public class ProdutosEntradaController {

    @Autowired
    private ProdutosEntradaRepository produtosEntradaRepository;

    @GetMapping
    public List<ProdutosEntrada> listar() {
        return produtosEntradaRepository.findAll();
    }

    @PostMapping
    public ProdutosEntrada cadastrar(@RequestBody ProdutosEntrada produto) {
        return produtosEntradaRepository.save(produto);
    }

    @PutMapping("/{id}")
    public ProdutosEntrada atualizar(@PathVariable Integer id, @RequestBody ProdutosEntrada novoProduto) {
        return produtosEntradaRepository.findById(id)
                .map(p -> {
                    p.setNomeProduto(novoProduto.getNomeProduto());
                    p.setTipo(novoProduto.getTipo());
                    p.setQuantidade(novoProduto.getQuantidade());
                    p.setUnidadeMedida(novoProduto.getUnidadeMedida());
                    p.setValorUnitario(novoProduto.getValorUnitario());
                    p.setDataCompra(novoProduto.getDataCompra());
                    return produtosEntradaRepository.save(p);
                }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        produtosEntradaRepository.deleteById(id);
    }
}

