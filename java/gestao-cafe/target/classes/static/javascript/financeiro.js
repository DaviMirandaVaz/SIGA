document.addEventListener("DOMContentLoaded", async () => {
    // 1. Carrega os dados iniciais
    await carregarFazendas(); 
    await carregarFazendasModal(); 
    
    // 2. Define o estado inicial (Entrada ou Saída)
    await mudarTipoTransacao(); 
    
    // 3. Carrega a tabela financeira
    await carregarFinanceiro(); 
});

// --- LISTAGEM E FILTROS ---

async function carregarFazendas() {
    const select = document.getElementById("filtro-fazenda");
    try {
        const usuarioId = localStorage.getItem("USUARIO_ID");
        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
        if(!resp.ok) return;

        const vinculos = await resp.json();
        select.innerHTML = `<option value="todas">Todas as Fazendas</option>`;

        vinculos.forEach(v => {
            if (v.fazenda) {
                const opt = document.createElement("option");
                opt.value = v.fazenda.idFazenda;
                opt.textContent = v.fazenda.nome;
                select.appendChild(opt);
            }
        });
    } catch (err) {
        console.error("Erro ao carregar fazendas filtro:", err);
    }
}

async function carregarFinanceiro(fazendaId = "todas") {
    const urlBase = "http://localhost:8080/api/financeiro";
    
    const urlEntradas = fazendaId === "todas" ? `${urlBase}/entradas` : `${urlBase}/entradas/fazenda/${fazendaId}`;
    const urlSaidas = fazendaId === "todas" ? `${urlBase}/saidas` : `${urlBase}/saidas/fazenda/${fazendaId}`;

    try {
        const [respEntradas, respSaidas] = await Promise.all([
            fetch(urlEntradas),
            fetch(urlSaidas)
        ]);

        const entradas = await respEntradas.json();
        const saidas = await respSaidas.json();

        renderizarEntradas(entradas);
        renderizarSaidas(saidas);
        atualizarSaldos(entradas, saidas);

    } catch (err) {
        console.error("Erro ao carregar tabelas:", err);
    }
}

function filtrarPorFazenda() {
    const fazendaId = document.getElementById("filtro-fazenda").value;
    carregarFinanceiro(fazendaId);
}

// --- MODAL E CADASTRO ---

async function carregarFazendasModal() {
    const select = document.getElementById("select-fazenda-modal");
    try {
        const usuarioId = localStorage.getItem("USUARIO_ID");
        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
        const vinculos = await resp.json();
        
        select.innerHTML = '<option value="" disabled selected>Selecione a fazenda...</option>';
        vinculos.forEach(v => {
            if(v.fazenda) {
                const opt = document.createElement("option");
                opt.value = v.fazenda.idFazenda;
                opt.textContent = v.fazenda.nome;
                select.appendChild(opt);
            }
        });
    } catch (err) {
        console.error("Erro fazendas modal:", err);
    }
}

async function mudarTipoTransacao() {
    const tipo = document.getElementById("tipo-operacao").value;
    const labelProduto = document.getElementById("label-produto");
    
    if (tipo === "ENTRADA") {
        labelProduto.textContent = "Produto Vendido (Estoque Saída)";
        await carregarProdutos("http://localhost:8080/api/produtosSaida");
    } else {
        labelProduto.textContent = "Insumo Comprado (Estoque Entrada)";
        await carregarProdutos("http://localhost:8080/api/produtosEntrada");
    }
}

async function carregarProdutos(url) {
    const select = document.getElementById("select-produto");
    select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Erro na API de produtos");
        
        const produtos = await resp.json();
        select.innerHTML = '<option value="" disabled selected>Selecione o produto...</option>';
        
        produtos.forEach(p => {
            const opt = document.createElement("option");
            
            // 🛑 AJUSTE CRÍTICO AQUI: Pegando o ID correto baseado na sua classe Java
            // Se for ProdutoSaida tem idProdutoSaida, se for Entrada tem idProdutosEntrada
            const idReal = p.idProdutoSaida || p.idProdutosEntrada;
            
            opt.value = idReal; 
            opt.textContent = p.nomeProduto; 
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        select.innerHTML = '<option value="">Erro ao carregar lista</option>';
    }
}

async function salvarTransacao() {
    const tipo = document.getElementById("tipo-operacao").value;
    const descricao = document.getElementById("descricao").value;
    const valor = document.getElementById("valor").value;
    const data = document.getElementById("data").value;
    const fazendaId = document.getElementById("select-fazenda-modal").value;
    const produtoId = document.getElementById("select-produto").value;

    if (!descricao || !valor || !data || !fazendaId || !produtoId) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Objeto Base
    const payload = {
        descricao: descricao,
        valor: parseFloat(valor),
        fazenda: { idFazenda: parseInt(fazendaId) } 
    };

    let url = "";

    if (tipo === "ENTRADA") {
        // --- FINANCEIRO ENTRADA (Receita) ---
        payload.tipoEntrada = "VENDA"; // ✅ Correto (existe no seu Java)
        payload.dataEntrada = data;
        payload.produtoSaida = { idProdutoSaida: parseInt(produtoId) }; 
        
        url = "http://localhost:8080/api/financeiro/entradas";

    } else {
        // --- FINANCEIRO SAÍDA (Despesa) ---
        
        // 🚨 AQUI ESTAVA O ERRO: "COMPRA" não existe no seu Enum. 
        // Mudei para "CUSTO" (ou use "GASTO" / "INVESTIMENTO")
        payload.tipoSaida = "CUSTO"; 
        
        payload.dataSaida = data;

        // ✅ CORREÇÃO DO NOME DO CAMPO:
        // No Java é: private ProdutosEntrada produtoEntrada; (Singular)
        // No objeto dentro: idProdutosEntrada (Conforme seu model ProdutosEntrada)
        payload.produtoEntrada = { idProdutosEntrada: parseInt(produtoId) };
        
        url = "http://localhost:8080/api/financeiro/saidas";
    }

    try {
        console.log("Enviando Payload:", JSON.stringify(payload)); 

        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            alert("Salvo com sucesso!");
            
            const modalEl = document.getElementById('modalTransacao');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            
            document.getElementById("form-transacao").reset();
            mudarTipoTransacao(); 
            carregarFinanceiro();
        } else {
            alert("Erro ao salvar. Verifique o console.");
            console.log(await resp.text());
        }
    } catch (err) {
        console.error("Erro na requisição:", err);
    }
}

// --- RENDERS (TABELAS) ---

function renderizarEntradas(lista) {
    const tabela = document.getElementById("lista-entradas");
    tabela.innerHTML = "";
    if (!lista || lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma entrada registrada.</td></tr>`;
        return;
    }
    lista.forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatarData(e.dataEntrada)}</td>
            <td>${e.descricao}</td>
            <td><span class="badge bg-success">${e.tipoEntrada || "ENTRADA"}</span></td>
            <td>R$ ${parseFloat(e.valor).toFixed(2)}</td>
            <td>${e.fazenda ? e.fazenda.nome : "-"}</td>
            <td>${e.produtoSaida ? e.produtoSaida.nomeProduto : "-"}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deletarItem('entradas', ${e.id})"><i class="fas fa-trash"></i></button>
            </td>`;
        tabela.appendChild(tr);
    });
}

function renderizarSaidas(lista) {
    const tabela = document.getElementById("lista-saidas");
    tabela.innerHTML = "";
    if (!lista || lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma saída registrada.</td></tr>`;
        return;
    }
    lista.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatarData(s.dataSaida)}</td>
            <td>${s.descricao}</td>
            <td><span class="badge bg-danger">${s.tipoSaida || "SAIDA"}</span></td>
            <td>R$ ${parseFloat(s.valor).toFixed(2)}</td>
            <td>${s.fazenda ? s.fazenda.nome : "-"}</td>
            <td>${s.produtoEntrada ? s.produtoEntrada.nomeProduto : "-"}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deletarItem('saidas', ${s.id})"><i class="fas fa-trash"></i></button>
            </td>`;
        tabela.appendChild(tr);
    });
}

function atualizarSaldos(entradas, saidas) {
    const totalEntradas = entradas.reduce((acc, e) => acc + (e.valor || 0), 0);
    const totalSaidas = saidas.reduce((acc, s) => acc + (s.valor || 0), 0);
    
    document.getElementById("saldo-entradas").innerText = `R$ ${totalEntradas.toFixed(2)}`;
    document.getElementById("saldo-saidas").innerText = `R$ ${totalSaidas.toFixed(2)}`;
    document.getElementById("saldo-total").innerText = `R$ ${(totalEntradas - totalSaidas).toFixed(2)}`;
}

function formatarData(dataStr) {
    if(!dataStr) return "-";
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function deletarItem(tipo, id) {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`http://localhost:8080/api/financeiro/${tipo}/${id}`, { method: "DELETE" });
        carregarFinanceiro();
    } catch(err) { console.error(err); }
}