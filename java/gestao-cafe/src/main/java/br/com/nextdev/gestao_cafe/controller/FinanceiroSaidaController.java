package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.FinanceiroSaida;
import br.com.nextdev.gestao_cafe.repository.FinanceiroSaidaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financeiro/saidas")
@CrossOrigin(origins = "*")
public class FinanceiroSaidaController {

    @Autowired
    private FinanceiroSaidaRepository financeiroSaidaRepository;

    // ✅ NOVO: Listar TUDO (Resolvendo o erro 404/405 no JS)
    @GetMapping
    public List<FinanceiroSaida> listarTodos() {
        List<FinanceiroSaida> lista = financeiroSaidaRepository.findAll();
        // Truque para inicializar o Proxy do Hibernate antes de virar JSON
        lista.forEach(s -> {
            if (s.getFazenda() != null) s.getFazenda().getNome();
            if (s.getProdutoEntrada() != null) s.getProdutoEntrada().getNomeProduto();
        });
        return lista;
    }

    // 🔎 Listar por fazenda (Atualizado)
    @GetMapping("/fazenda/{idFazenda}")
    public List<FinanceiroSaida> listarPorFazenda(@PathVariable Integer idFazenda) {
        List<FinanceiroSaida> lista = financeiroSaidaRepository.findByFazenda_IdFazenda(idFazenda);
        lista.forEach(s -> {
            if (s.getFazenda() != null) s.getFazenda().getNome();
            if (s.getProdutoEntrada() != null) s.getProdutoEntrada().getNomeProduto();
        });
        return lista;
    }

    @PostMapping
    public FinanceiroSaida cadastrar(@RequestBody FinanceiroSaida saida) {
        return financeiroSaidaRepository.save(saida);
    }

    // ... seus métodos PUT e DELETE continuam iguais ...
    @PutMapping("/{id}")
    public FinanceiroSaida atualizar(@PathVariable Integer id, @RequestBody FinanceiroSaida novaSaida) {
        return financeiroSaidaRepository.findById(id).map(s -> {
            s.setTipoSaida(novaSaida.getTipoSaida());
            s.setDescricao(novaSaida.getDescricao());
            s.setValor(novaSaida.getValor());
            s.setDataSaida(novaSaida.getDataSaida());
            s.setProdutoEntrada(novaSaida.getProdutoEntrada()); // Atualiza vínculo
            return financeiroSaidaRepository.save(s);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        financeiroSaidaRepository.deleteById(id);
    }
}