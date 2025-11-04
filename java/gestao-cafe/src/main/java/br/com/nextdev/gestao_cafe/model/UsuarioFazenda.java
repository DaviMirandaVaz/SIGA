package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "usuario_fazenda")
public class UsuarioFazenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuarioFazenda;

    @ManyToOne
    @JoinColumn(name = "idFazenda")
    @JsonIgnoreProperties({"usuarioFazendas", "produtosEntrada", "produtosIntermedios", "produtosSaida"})
    private Fazenda fazenda;

    @ManyToOne
    @JoinColumn(name = "idUsuario")
    @JsonIgnoreProperties({"usuarioFazendas", "usuariosSubordinados", "usuarioDono"})
    private Usuario usuario;

    @Column(length = 255)
    private String cargo;

    @Column(name = "data_vinculo")
    private LocalDate dataVinculo = LocalDate.now();

    // Getters e Setters
    public Integer getIdUsuarioFazenda() { return idUsuarioFazenda; }
    public void setIdUsuarioFazenda(Integer idUsuarioFazenda) { this.idUsuarioFazenda = idUsuarioFazenda; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }

    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }

    public LocalDate getDataVinculo() { return dataVinculo; }
    public void setDataVinculo(LocalDate dataVinculo) { this.dataVinculo = dataVinculo; }
}
