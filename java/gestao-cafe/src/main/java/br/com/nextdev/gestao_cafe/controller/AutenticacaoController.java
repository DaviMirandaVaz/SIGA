package br.com.nextdev.gestao_cafe.controller;

import br.com.nextdev.gestao_cafe.model.Usuario;
import br.com.nextdev.gestao_cafe.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class AutenticacaoController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");

        Optional<Usuario> usuarioOptional = usuarioRepository.findByEmail(email);

        if (usuarioOptional.isPresent()) {
            Usuario usuario = usuarioOptional.get();
            if (usuario.getSenha().equals(senha)) {
                Map<String, Object> resposta = new HashMap<>();
                resposta.put("id", usuario.getIdUsuario());
                resposta.put("nome", usuario.getNome());
                resposta.put("tipoUsuario", usuario.getTipoUsuario());
                return ResponseEntity.ok(resposta);
            }
        }
        return ResponseEntity.status(401)
                .body(Map.of("erro", "Email ou senha inválidos."));
    }

    // REGISTRO
    @PostMapping("/registrar")
    public ResponseEntity<String> registrar(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        String senha = credenciais.get("senha");
        String nome = credenciais.get("nome");

        // Verifica se o usuário já existe
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Este email já está em uso.");
        }

        // Cria um novo usuário
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNome(nome);
        novoUsuario.setEmail(email);
        novoUsuario.setSenha(senha); // Em produção, criptografe!
        novoUsuario.setTipoUsuario(Usuario.TipoUsuario.ADMIN); // Perfil padrão

        usuarioRepository.save(novoUsuario);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuário registrado com sucesso!");
    }
}
