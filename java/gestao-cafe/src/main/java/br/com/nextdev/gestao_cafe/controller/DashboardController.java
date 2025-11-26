package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.*;

import br.com.nextdev.gestao_cafe.repository.FinanceiroEntradaRepository;
import br.com.nextdev.gestao_cafe.repository.FinanceiroSaidaRepository;
import br.com.nextdev.gestao_cafe.repository.ProdutosEntradaRepository;
import br.com.nextdev.gestao_cafe.repository.ProdutoSaidaRepository;
import br.com.nextdev.gestao_cafe.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private ProdutosEntradaRepository entradaRepo;
    @Autowired private ProdutoSaidaRepository saidaRepo;
    @Autowired private UsuarioRepository usuarioRepo;

    // NOVAS INJEÇÕES
    @Autowired private FinanceiroEntradaRepository finEntradaRepo;
    @Autowired private FinanceiroSaidaRepository finSaidaRepo;

    // --- SEU MÉTODO DE SEGURANÇA (MANTIDO IGUAL) ---
    private List<Fazenda> getFazendasDoUsuario(Integer userId) {
        if (userId == null) throw new RuntimeException("ID do usuário não informado.");
        Usuario usuario = usuarioRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + userId));

        List<Fazenda> fazendasAcessiveis = new ArrayList<>();
        if (usuario.getFazendas() != null) fazendasAcessiveis.addAll(usuario.getFazendas());
        if (usuario.getUsuarioFazendas() != null) {
            for (UsuarioFazenda vinculo : usuario.getUsuarioFazendas()) {
                fazendasAcessiveis.add(vinculo.getFazenda());
            }
        }
        return fazendasAcessiveis;
    }

    // --- ENDPOINTS ANTIGOS DE PRODUTO (MANTIDOS) ---
    @GetMapping("/entrada")
    public List<Map<String, Object>> getDadosEntrada(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        if (fazendas.isEmpty()) return new ArrayList<>();
        List<ProdutosEntrada> lista = entradaRepo.findByFazendaIn(fazendas);

        Map<String, Double> mapaSoma = new HashMap<>();
        for (ProdutosEntrada item : lista) {
            mapaSoma.put(item.getNomeProduto(), mapaSoma.getOrDefault(item.getNomeProduto(), 0.0) + (item.getQuantidade() != null ? item.getQuantidade().doubleValue() : 0.0));
        }
        return formatarParaGrafico(mapaSoma);
    }

    @GetMapping("/saida")
    public List<Map<String, Object>> getDadosSaida(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        if (fazendas.isEmpty()) return new ArrayList<>();
        List<ProdutoSaida> lista = saidaRepo.findByFazendaIn(fazendas);

        Map<String, Double> mapaSoma = new HashMap<>();
        for (ProdutoSaida item : lista) {
            mapaSoma.put(item.getNomeProduto(), mapaSoma.getOrDefault(item.getNomeProduto(), 0.0) + (item.getValorVenda() != null ? item.getValorVenda().doubleValue() : 0.0));
        }
        return formatarParaGrafico(mapaSoma);
    }

    @GetMapping("/resumo")
    public Map<String, Object> getResumo(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        Map<String, Object> resumo = new HashMap<>();
        if (fazendas.isEmpty()) { resumo.put("totalEntrada", 0); resumo.put("faturamento", 0); return resumo; }

        double totalItensEntrada = entradaRepo.findByFazendaIn(fazendas).stream()
                .mapToDouble(i -> i.getQuantidade() != null ? i.getQuantidade().doubleValue() : 0).sum();
        double totalFaturamento = saidaRepo.findByFazendaIn(fazendas).stream()
                .mapToDouble(i -> i.getValorVenda() != null ? i.getValorVenda().doubleValue() : 0).sum();

        resumo.put("totalEntrada", totalItensEntrada);
        resumo.put("faturamento", totalFaturamento);
        return resumo;
    }

    // --- NOVOS ENDPOINTS FINANCEIROS ---

    @GetMapping("/financeiro/entradas")
    public List<FinanceiroEntrada> getFinanceiroEntradas(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        if (fazendas.isEmpty()) return new ArrayList<>();
        return finEntradaRepo.findByFazendaIn(fazendas);
    }

    @GetMapping("/financeiro/saidas")
    public List<FinanceiroSaida> getFinanceiroSaidas(@RequestParam Integer userId) {
        // OBS: Se sua classe chamar FinanceiroSaida (sem S no final), ajuste aqui
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        if (fazendas.isEmpty()) return new ArrayList<>();
        return finSaidaRepo.findByFazendaIn(fazendas);
    }

    private List<Map<String, Object>> formatarParaGrafico(Map<String, Double> mapaSoma) {
        List<Map<String, Object>> dados = new ArrayList<>();
        for (Map.Entry<String, Double> entry : mapaSoma.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("nome", entry.getKey());
            map.put("valor", entry.getValue());
            dados.add(map);
        }
        return dados;
    }
}