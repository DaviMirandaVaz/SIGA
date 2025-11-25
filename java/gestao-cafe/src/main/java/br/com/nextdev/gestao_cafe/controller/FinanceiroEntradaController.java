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

    // ✅ NOVO: Listar TUDO (necessário para a opção "Todas as Fazendas")
    @GetMapping
    public List<FinanceiroEntrada> listarTodos() {
        List<FinanceiroEntrada> lista = financeiroEntradaRepository.findAll();
        // Força o carregamento dos objetos relacionados para o JSON não ir vazio
        lista.forEach(e -> {
            if (e.getFazenda() != null) e.getFazenda().getNome();
            if (e.getProdutoSaida() != null) e.getProdutoSaida().getNomeProduto();
        });
        return lista;
    }

    // 🔎 Listar por fazenda (Atualizado com carregamento forçado)
    @GetMapping("/fazenda/{idFazenda}")
    public List<FinanceiroEntrada> listarPorFazenda(@PathVariable Integer idFazenda) {
        List<FinanceiroEntrada> lista = financeiroEntradaRepository.findByFazenda_IdFazenda(idFazenda);
        lista.forEach(e -> {
            if (e.getFazenda() != null) e.getFazenda().getNome();
            if (e.getProdutoSaida() != null) e.getProdutoSaida().getNomeProduto();
        });
        return lista;
    }

    @PostMapping
    public FinanceiroEntrada cadastrar(@RequestBody FinanceiroEntrada entrada) {
        return financeiroEntradaRepository.save(entrada);
    }

    // ... seus métodos PUT e DELETE continuam iguais ...
    @PutMapping("/{id}")
    public FinanceiroEntrada atualizar(@PathVariable Integer id, @RequestBody FinanceiroEntrada novaEntrada) {
        return financeiroEntradaRepository.findById(id).map(e -> {
            e.setTipoEntrada(novaEntrada.getTipoEntrada());
            e.setDescricao(novaEntrada.getDescricao());
            e.setValor(novaEntrada.getValor());
            e.setDataEntrada(novaEntrada.getDataEntrada());
            e.setProdutoSaida(novaEntrada.getProdutoSaida()); // Atualiza vínculo
            return financeiroEntradaRepository.save(e);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        financeiroEntradaRepository.deleteById(id);
    }
}