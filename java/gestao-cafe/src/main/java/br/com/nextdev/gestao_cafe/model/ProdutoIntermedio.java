package br.com.nextdev.gestao_cafe.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ProdutoIntermedio")
public class ProdutoIntermedio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idProdutoIntermedio;

    private String nomeProduto;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    private BigDecimal quantidade;
    private BigDecimal valorEstimado;
    private LocalDate dataInicio;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ATIVO;

    @ManyToOne
    @JoinColumn(name = "idFazenda", nullable = false)
    @JsonBackReference("fazenda-produtoIntermedio")
    private Fazenda fazenda;


    public enum Tipo { ANIMAL, LAVOURA, PLANTAÇÃO }
    public enum Status { ATIVO, VENDIDO, MORTE, COLHIDO }

    // Getters e Setters
    public Integer getIdProdutoIntermedio() { return idProdutoIntermedio; }
    public void setIdProdutoIntermedio(Integer idProdutoIntermedio) { this.idProdutoIntermedio = idProdutoIntermedio; }
    public String getNomeProduto() { return nomeProduto; }
    public void setNomeProduto(String nomeProduto) { this.nomeProduto = nomeProduto; }
    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }
    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }
    public BigDecimal getValorEstimado() { return valorEstimado; }
    public void setValorEstimado(BigDecimal valorEstimado) { this.valorEstimado = valorEstimado; }
    public LocalDate getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDate dataInicio) { this.dataInicio = dataInicio; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Fazenda getFazenda() { return fazenda; }
    public void setFazenda(Fazenda fazenda) { this.fazenda = fazenda; }
    public Integer getIdFazenda() {
        return fazenda != null ? fazenda.getIdFazenda() : null;
    }
}
