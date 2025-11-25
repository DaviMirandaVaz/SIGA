package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.Fazenda;
import br.com.nextdev.gestao_cafe.model.UsuarioFazenda;
import br.com.nextdev.gestao_cafe.repository.FazendaRepository;
import br.com.nextdev.gestao_cafe.repository.UsuarioFazendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fazendas")
@CrossOrigin(origins = "http://127.0.0.1:5500") // ou http://localhost:5500, conforme seu front
public class FazendaController {

    @Autowired
    private FazendaRepository fazendaRepository;

    @Autowired
    private UsuarioFazendaRepository usuarioFazendaRepository;

    // ✅ Listar todas as fazendas
    @GetMapping
    public List<Fazenda> listar() {
        return fazendaRepository.findAll();
    }

    // ✅ Buscar fazenda por ID
    @GetMapping("/{id}")
    public Fazenda buscar(@PathVariable Integer id) {
        return fazendaRepository.findById(id).orElse(null);
    }

    // ✅ Novo endpoint para listar fazendas de um usuário dono
    @GetMapping("/porDono/{idUsuario}")
    public List<Fazenda> listarPorDono(@PathVariable Integer idUsuario) {
        return fazendaRepository.findByUsuario_IdUsuario(idUsuario);
    }

    // ✅ Cadastrar fazenda
    @PostMapping(consumes = "application/json", produces = "application/json")
    public Fazenda cadastrar(@RequestBody Fazenda fazenda) {

        System.out.println("Recebendo fazenda: " + fazenda.getNome());

        // 1. Salva a fazenda
        Fazenda fazendaSalva = fazendaRepository.save(fazenda);

        // 2. Cria o vínculo com o dono
        UsuarioFazenda uf = new UsuarioFazenda();
        uf.setUsuario(fazendaSalva.getUsuario());
        uf.setFazenda(fazendaSalva);
        uf.setCargo("Dono");
        uf.setDataVinculo(LocalDate.now());

        usuarioFazendaRepository.save(uf);

        return fazendaSalva;
    }


    // ✅ Atualizar fazenda
    @PutMapping("/{id}")
    public Fazenda atualizar(@PathVariable Integer id, @RequestBody Fazenda novaFazenda) {
        Fazenda fazenda = fazendaRepository.findById(id).orElse(null);
        if (fazenda != null) {
            fazenda.setNome(novaFazenda.getNome());
            fazenda.setLocalizacao(novaFazenda.getLocalizacao());
            fazenda.setAreaHectares(novaFazenda.getAreaHectares());
            fazenda.setUsuario(novaFazenda.getUsuario());
            return fazendaRepository.save(fazenda);
        }
        return null;
    }

    // ✅ Deletar fazenda
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        fazendaRepository.deleteById(id);
    }
}
