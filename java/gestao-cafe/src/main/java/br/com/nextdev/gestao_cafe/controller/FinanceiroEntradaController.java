package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.FinanceiroEntrada;
import br.com.nextdev.gestao_cafe.repository.FinanceiroEntradaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financeiro/entradas")
@CrossOrigin(origins = "*")
public class FinanceiroEntradaController {

    @Autowired
    private FinanceiroEntradaRepository financeiroEntradaRepository;

    // 🔎 Listar entradas por fazenda
    @GetMapping("/fazenda/{idFazenda}")
    public List<FinanceiroEntrada> listarPorFazenda(@PathVariable Integer idFazenda) {
        return financeiroEntradaRepository.findByFazenda_IdFazenda(idFazenda);
    }


    @PostMapping
    public FinanceiroEntrada cadastrar(@RequestBody FinanceiroEntrada entrada) {
        return financeiroEntradaRepository.save(entrada);
    }

    @PutMapping("/{id}")
    public FinanceiroEntrada atualizar(@PathVariable Integer id, @RequestBody FinanceiroEntrada novaEntrada) {
        return financeiroEntradaRepository.findById(id)
                .map(e -> {
                    e.setTipoEntrada(novaEntrada.getTipoEntrada());
                    e.setDescricao(novaEntrada.getDescricao());
                    e.setValor(novaEntrada.getValor());
                    e.setDataEntrada(novaEntrada.getDataEntrada());
                    e.setProdutoSaida(novaEntrada.getProdutoSaida());
                    return financeiroEntradaRepository.save(e);
                }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        financeiroEntradaRepository.deleteById(id);
    }
}

