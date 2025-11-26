package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.*;
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
@CrossOrigin(origins = "*") // Importante para evitar bloqueios
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ProdutosEntradaRepository entradaRepo;

    @Autowired
    private ProdutoSaidaRepository saidaRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    // MÉTODO AUXILIAR: Busca as fazendas usando o ID recebido (userId)
    private List<Fazenda> getFazendasDoUsuario(Integer userId) {

        if (userId == null) {
            throw new RuntimeException("ID do usuário não foi informado.");
        }

        Usuario usuario = usuarioRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + userId));

        List<Fazenda> fazendasAcessiveis = new ArrayList<>();

        // 1. Se ele for Dono
        if (usuario.getFazendas() != null && !usuario.getFazendas().isEmpty()) {
            fazendasAcessiveis.addAll(usuario.getFazendas());
        }

        // 2. Se ele for Funcionário
        if (usuario.getUsuarioFazendas() != null && !usuario.getUsuarioFazendas().isEmpty()) {
            for (UsuarioFazenda vinculo : usuario.getUsuarioFazendas()) {
                fazendasAcessiveis.add(vinculo.getFazenda());
            }
        }

        return fazendasAcessiveis;
    }

    // 1. DADOS DE ENTRADA
    @GetMapping("/entrada")
    public List<Map<String, Object>> getDadosEntrada(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);

        if (fazendas.isEmpty()) return new ArrayList<>();

        List<ProdutosEntrada> lista = entradaRepo.findByFazendaIn(fazendas);

        Map<String, Double> mapaSoma = new HashMap<>();
        for (ProdutosEntrada item : lista) {
            String nome = item.getNomeProduto();
            Double qtd = item.getQuantidade() != null ? item.getQuantidade().doubleValue() : 0.0;
            mapaSoma.put(nome, mapaSoma.getOrDefault(nome, 0.0) + qtd);
        }

        return formatarParaGrafico(mapaSoma);
    }

    // 2. DADOS DE SAÍDA
    @GetMapping("/saida")
    public List<Map<String, Object>> getDadosSaida(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        if (fazendas.isEmpty()) return new ArrayList<>();

        List<ProdutoSaida> lista = saidaRepo.findByFazendaIn(fazendas);

        Map<String, Double> mapaSoma = new HashMap<>();
        for (ProdutoSaida item : lista) {
            String nome = item.getNomeProduto();
            Double valor = item.getValorVenda() != null ? item.getValorVenda().doubleValue() : 0.0;
            mapaSoma.put(nome, mapaSoma.getOrDefault(nome, 0.0) + valor);
        }

        return formatarParaGrafico(mapaSoma);
    }

    // 3. RESUMO (Cards)
    @GetMapping("/resumo")
    public Map<String, Object> getResumo(@RequestParam Integer userId) {
        List<Fazenda> fazendas = getFazendasDoUsuario(userId);
        Map<String, Object> resumo = new HashMap<>();

        if (fazendas.isEmpty()) {
            resumo.put("totalEntrada", 0);
            resumo.put("faturamento", 0);
            return resumo;
        }

        List<ProdutosEntrada> entradas = entradaRepo.findByFazendaIn(fazendas);
        double totalItensEntrada = 0;
        for (ProdutosEntrada item : entradas) {
            if (item.getQuantidade() != null) totalItensEntrada += item.getQuantidade().doubleValue();
        }

        List<ProdutoSaida> saidas = saidaRepo.findByFazendaIn(fazendas);
        double totalFaturamento = 0;
        for (ProdutoSaida item : saidas) {
            if (item.getValorVenda() != null) totalFaturamento += item.getValorVenda().doubleValue();
        }

        resumo.put("totalEntrada", totalItensEntrada);
        resumo.put("faturamento", totalFaturamento);

        return resumo;
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