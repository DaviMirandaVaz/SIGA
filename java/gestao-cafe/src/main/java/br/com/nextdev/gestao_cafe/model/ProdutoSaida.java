package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ProdutoSaida")
public class ProdutoSaida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProdutoSaida;

    private String nomeProduto;
    private BigDecimal quantidade;
    private String unidadeMedida;
    private BigDecimal valorVenda;
    private LocalDate dataVenda;

    @ManyToOne
    @JoinColumn(name = "idFazenda", nullable = false)
    @JsonIgnoreProperties("produtosSaida")
    private Fazenda fazenda;


    // Getters e Setters
    public Integer getIdProdutoSaida() { return idProdutoSaida; }
    public void setIdProdutoSaida(Integer idProdutoSaida) { this.idProdutoSaida = idProdutoSaida; }
    public String getNomeProduto() { return nomeProduto; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }
    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }
    public String getUnidadeMedida() { return unidadeMedida; }
    public void setUnidadeMedida(String unidadeMedida) { this.unidadeMedida = unidadeMedida; }
    public BigDecimal getValorVenda() { return valorVenda; }
    public void setValorVenda(BigDecimal valorVenda) { this.valorVenda = valorVenda; }
    public LocalDate getDataVenda() { return dataVenda; }
    public void setDataVenda(LocalDate dataVenda) { this.dataVenda = dataVenda; }
    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }
    public Integer getIdFazenda() {
        return fazenda != null ? fazenda.getIdFazenda() : null;
    }
}

