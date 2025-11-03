package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.Usuario;
import br.com.nextdev.gestao_cafe.repository.FazendaRepository;
import br.com.nextdev.gestao_cafe.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import br.com.nextdev.gestao_cafe.model.Fazenda;

import java.util.List;


@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FazendaRepository fazendaRepository;


    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}")
    public Usuario buscarUsuario(@PathVariable Integer id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Usuario cadastrarUsuario(@RequestBody Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public Usuario atualizarUsuario(@PathVariable Integer id, @RequestBody Usuario usuarioAtualizado) {
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario != null) {
            usuario.setNome(usuarioAtualizado.getNome());
            usuario.setEmail(usuarioAtualizado.getEmail());
            usuario.setSenha(usuarioAtualizado.getSenha());
            usuario.setTipoUsuario(usuarioAtualizado.getTipoUsuario());
            return usuarioRepository.save(usuario);
        }
        return null;
    }

    @GetMapping("/porDono/{idDono}")
    public List<Fazenda> listarFazendasPorDono(@PathVariable Integer idDono) {
        return fazendaRepository.findByUsuario_IdUsuario(idDono);
    }



    @DeleteMapping("/{id}")
    public void deletarUsuario(@PathVariable Integer id) {
        usuarioRepository.deleteById(id);
    }
}

