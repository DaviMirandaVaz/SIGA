package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "Usuario")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TipoUsuario tipoUsuario = TipoUsuario.FUNCIONARIO;

    // 🔹 Fazendas do usuário dono
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"usuario", "usuarioFazendas"})
    private List<Fazenda> fazendas;

    // 🔹 Vínculos (funcionário x fazenda)
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"usuario"})
    private List<UsuarioFazenda> usuarioFazendas;

    // 🔹 Usuário dono
    @ManyToOne
    @JoinColumn(name = "id_usuario_dono")
    @JsonIgnoreProperties({"usuariosSubordinados", "fazendas", "usuarioFazendas"})
    private Usuario usuarioDono;

    // 🔹 Usuários subordinados
    @OneToMany(mappedBy = "usuarioDono")
    @JsonIgnoreProperties({"usuarioDono", "fazendas", "usuarioFazendas"})
    private List<Usuario> usuariosSubordinados;

    public enum TipoUsuario {
        ADMIN, FUNCIONARIO, GERENTE
    }

    // Getters e Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public List<Fazenda> getFazendas() { return fazendas; }
    public void setFazendas(List<Fazenda> fazendas) { this.fazendas = fazendas; }

    public List<UsuarioFazenda> getUsuarioFazendas() { return usuarioFazendas; }
    public void setUsuarioFazendas(List<UsuarioFazenda> usuarioFazendas) { this.usuarioFazendas = usuarioFazendas; }

    public Usuario getUsuarioDono() { return usuarioDono; }
    public void setUsuarioDono(Usuario usuarioDono) { this.usuarioDono = usuarioDono; }

    public List<Usuario> getUsuariosSubordinados() { return usuariosSubordinados; }
    public void setUsuariosSubordinados(List<Usuario> usuariosSubordinados) { this.usuariosSubordinados = usuariosSubordinados; }
}
