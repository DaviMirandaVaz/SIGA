package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.UsuarioFazenda;
import br.com.nextdev.gestao_cafe.repository.UsuarioFazendaRepository;
import br.com.nextdev.gestao_cafe.repository.UsuarioRepository;
import br.com.nextdev.gestao_cafe.repository.FazendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario-fazenda")
@CrossOrigin(origins = "*")
public class UsuarioFazendaController {

    @Autowired
    private UsuarioFazendaRepository usuarioFazendaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FazendaRepository fazendaRepository;

    // ✅ Listar todos os vínculos
    @GetMapping
    public List<UsuarioFazenda> listarTodos() {
        return usuarioFazendaRepository.findAll();
    }

    // ✅ Buscar por usuário
    @GetMapping("/porUsuario/{idUsuario}")
    public List<UsuarioFazenda> listarPorUsuario(@PathVariable Integer idUsuario) {
        return usuarioFazendaRepository.findByUsuario_IdUsuario(idUsuario);
    }

    // ✅ Buscar por fazenda
    @GetMapping("/porFazenda/{idFazenda}")
    public List<UsuarioFazenda> listarPorFazenda(@PathVariable Integer idFazenda) {
        return usuarioFazendaRepository.findByFazenda_IdFazenda(idFazenda);
    }

    // ✅ Criar vínculo entre usuário e fazenda
    @PostMapping
    public UsuarioFazenda vincularUsuarioAFazenda(@RequestBody UsuarioFazenda usuarioFazenda) {
        if (!usuarioRepository.existsById(usuarioFazenda.getUsuario().getIdUsuario())) {
            throw new RuntimeException("Usuário não encontrado");
        }
        if (!fazendaRepository.existsById(usuarioFazenda.getFazenda().getIdFazenda())) {
            throw new RuntimeException("Fazenda não encontrada");
        }
        return usuarioFazendaRepository.save(usuarioFazenda);
    }

    // ✅ Remover vínculo
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        usuarioFazendaRepository.deleteById(id);
    }
}
