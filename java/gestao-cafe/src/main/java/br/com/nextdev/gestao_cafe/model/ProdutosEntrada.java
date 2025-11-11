package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ProdutosEntrada")
public class ProdutosEntrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProdutosEntrada;

    @Column(nullable = false, length = 100)
    private String nomeProduto;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Tipo tipo = Tipo.OUTRO;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal quantidade;

    private String unidadeMedida;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorUnitario;

    private LocalDate dataCompra;

    @ManyToOne
    @JoinColumn(name = "idFazenda", nullable = false)
    @JsonIgnoreProperties("produtosEntrada") // 👈 substitui o JsonBackReference
    private Fazenda fazenda;



    public enum Tipo {
        RAÇÃO, ADUBO, MEDICAMENTO, SEMENTE, OUTRO
    }

    // Getters e Setters
    public Integer getIdProdutosEntrada() { return idProdutosEntrada; }
    public void setIdProdutosEntrada(Integer idProdutosEntrada) { this.idProdutosEntrada = idProdutosEntrada; }
    public String getNomeProduto() { return nomeProduto; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }
    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }
    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }
    public String getUnidadeMedida() { return unidadeMedida; }
    public void setUnidadeMedida(String unidadeMedida) { this.unidadeMedida = unidadeMedida; }
    public BigDecimal getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
    public LocalDate getDataCompra() { return dataCompra; }
    public void setDataCompra(LocalDate dataCompra) { this.dataCompra = dataCompra; }
    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }
    public Integer getIdFazenda() {
        return fazenda != null ? fazenda.getIdFazenda() : null;
    }

}
