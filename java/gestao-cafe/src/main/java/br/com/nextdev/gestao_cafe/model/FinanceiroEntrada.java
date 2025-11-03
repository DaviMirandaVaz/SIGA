package br.com.nextdev.gestao_cafe.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "FinanceiroEntrada")
public class FinanceiroEntrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFinanceiroEntrada;

    @Enumerated(EnumType.STRING)
    private TipoEntrada tipoEntrada = TipoEntrada.VENDA;

    private String descricao;
    private BigDecimal valor;
    private LocalDate dataEntrada;

    @ManyToOne
    @JoinColumn(name = "idProdutoSaida")
    private ProdutoSaida produtoSaida;

    @ManyToOne
    @JoinColumn(name = "idFazenda", nullable = false)
    private Fazenda fazenda;

    public enum TipoEntrada { VENDA, SUBVENCAO, OUTROS }

    // Getters e Setters
    public Integer getIdFinanceiroEntrada() { return idFinanceiroEntrada; }
    public void setIdFinanceiroEntrada(Integer idFinanceiroEntrada) { this.idFinanceiroEntrada = idFinanceiroEntrada; }
    public TipoEntrada getTipoEntrada() { return tipoEntrada; }
    public void setTipoEntrada(TipoEntrada tipoEntrada) { this.tipoEntrada = tipoEntrada; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDate dataEntrada) { this.dataEntrada = dataEntrada; }
    public ProdutoSaida getProdutoSaida() { return produtoSaida; }
    public void setProdutoSaida(ProdutoSaida produtoSaida) { this.produtoSaida = produtoSaida; }
    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }
}
