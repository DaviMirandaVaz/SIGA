package br.com.nextdev.gestao_cafe.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "FinanceiroSaida")
public class FinanceiroSaida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idFinanceiroSaida;

    @Enumerated(EnumType.STRING)
    private TipoSaida tipoSaida = TipoSaida.CUSTO;

    private String descricao;
    private BigDecimal valor;
    private LocalDate dataSaida;

    @ManyToOne
    @JoinColumn(name = "idProdutoEntrada")
    private ProdutosEntrada produtoEntrada;

    @ManyToOne
    @JoinColumn(name = "idFazenda", nullable = false)
    private Fazenda fazenda;

    public enum TipoSaida { CUSTO, GASTO, INVESTIMENTO, CUSTEIO, OUTRO }

    // Getters e Setters
    public Integer getIdFinanceiroSaida() { return idFinanceiroSaida; }
    public void setIdFinanceiroSaida(Integer idFinanceiroSaida) { this.idFinanceiroSaida = idFinanceiroSaida; }
    public TipoSaida getTipoSaida() { return tipoSaida; }
    public void setTipoSaida(TipoSaida tipoSaida) { this.tipoSaida = tipoSaida; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public LocalDate getDataSaida() { return dataSaida; }
    public void setDataSaida(LocalDate dataSaida) { this.dataSaida = dataSaida; }
    public ProdutosEntrada getProdutoEntrada() { return produtoEntrada; }
    public void setProdutoEntrada(ProdutosEntrada produtoEntrada) { this.produtoEntrada = produtoEntrada; }
    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }
}

