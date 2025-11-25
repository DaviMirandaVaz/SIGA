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

    // 🔎 Listar saídas por fazenda
    @GetMapping("/fazenda/{idFazenda}")
    public List<FinanceiroSaida> listarPorFazenda(@PathVariable Integer idFazenda) {
        return financeiroSaidaRepository.findByFazenda_IdFazenda(idFazenda);
    }


    @PostMapping
    public FinanceiroSaida cadastrar(@RequestBody FinanceiroSaida saida) {
        return financeiroSaidaRepository.save(saida);
    }

    @PutMapping("/{id}")
    public FinanceiroSaida atualizar(@PathVariable Integer id, @RequestBody FinanceiroSaida novaSaida) {
        return financeiroSaidaRepository.findById(id)
                .map(s -> {
                    s.setTipoSaida(novaSaida.getTipoSaida());
                    s.setDescricao(novaSaida.getDescricao());
                    s.setValor(novaSaida.getValor());
                    s.setDataSaida(novaSaida.getDataSaida());
                    s.setProdutoEntrada(novaSaida.getProdutoEntrada());
                    return financeiroSaidaRepository.save(s);
                }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        financeiroSaidaRepository.deleteById(id);
    }
}

