package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "Fazenda")
public class Fazenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFazenda;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 150)
    private String localizacao;

    @Column(precision = 10, scale = 2)
    private BigDecimal areaHectares;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    @JsonIgnoreProperties("fazendas") // 🔥 Evita recursão infinita
    private Usuario usuario;

    // Getters e Setters
    public Integer getIdFazenda() { return idFazenda; }
    public void setIdFazenda(Integer idFazenda) { this.idFazenda = idFazenda; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getLocalizacao() { return localizacao; }
    public void setLocalizacao(String localizacao) { this.localizacao = localizacao; }

    public BigDecimal getAreaHectares() { return areaHectares; }
    public void setAreaHectares(BigDecimal areaHectares) { this.areaHectares = areaHectares; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
