package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "Fazenda")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    // 🔹 Usuário dono da fazenda
    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    @JsonIgnoreProperties({"fazendas", "usuarioFazendas", "usuariosSubordinados"})
    private Usuario usuario;

    // 🔹 Relação com usuários vinculados
    @OneToMany(mappedBy = "fazenda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"fazenda", "usuario"})
    private List<UsuarioFazenda> usuarioFazendas;

    // 🔹 Relações com produtos
    @OneToMany(mappedBy = "fazenda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"fazenda"})
    private List<ProdutosEntrada> produtosEntrada;

    @OneToMany(mappedBy = "fazenda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"fazenda"})
    private List<ProdutoIntermedio> produtosIntermedios;

    @OneToMany(mappedBy = "fazenda", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"fazenda"})
    private List<ProdutoSaida> produtosSaida;

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
    public List<UsuarioFazenda> getUsuarioFazendas() { return usuarioFazendas; }
    public void setUsuarioFazendas(List<UsuarioFazenda> usuarioFazendas) { this.usuarioFazendas = usuarioFazendas; }
    public List<ProdutosEntrada> getProdutosEntrada() { return produtosEntrada; }
    public void setProdutosEntrada(List<ProdutosEntrada> produtosEntrada) { this.produtosEntrada = produtosEntrada; }
    public List<ProdutoIntermedio> getProdutosIntermedios() { return produtosIntermedios; }
    public void setProdutosIntermedios(List<ProdutoIntermedio> produtosIntermedios) { this.produtosIntermedios = produtosIntermedios; }
    public List<ProdutoSaida> getProdutosSaida() { return produtosSaida; }
    public void setProdutosSaida(List<ProdutoSaida> produtosSaida) { this.produtosSaida = produtosSaida; }
}
