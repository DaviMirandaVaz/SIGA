document.addEventListener("DOMContentLoaded", async () => {
    await carregarFazendas();
    await carregarFazendasModal();
    await mudarTipoTransacao();
    await carregarFinanceiro();
});

// ======================================
// LISTAGEM DE FAZENDAS DO USUÁRIO
// ======================================

async function carregarFazendasDoUsuarioIDs() {
    const usuarioId = localStorage.getItem("USUARIO_ID");

    try {
        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
        const vinculos = await resp.json();

        return vinculos
            .filter(v => v.fazenda)
            .map(v => v.fazenda.idFazenda);
    } catch (err) {
        console.error("Erro ao buscar fazendas do usuário:", err);
        return [];
    }
}




async function carregarFazendas() {
    const select = document.getElementById("filtro-fazenda");

    try {
        const usuarioId = localStorage.getItem("USUARIO_ID");
        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
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

function filtrarPorFazenda() {
    const fazendaId = document.getElementById("filtro-fazenda").value;
    carregarFinanceiro(fazendaId);
}

// ======================================
// LISTAGEM FINANCEIRO
// ======================================

async function carregarFinanceiro(fazendaId = "todas") {
    const usuarioId = localStorage.getItem("USUARIO_ID");
    const base = "http://localhost:8080/api/financeiro";

    const urlEntradas =
        fazendaId === "todas"
            ? `${base}/entradas?usuarioId=${usuarioId}`
            : `${base}/entradas/fazenda/${fazendaId}?usuarioId=${usuarioId}`;

    const urlSaidas =
        fazendaId === "todas"
            ? `${base}/saidas?usuarioId=${usuarioId}`
            : `${base}/saidas/fazenda/${fazendaId}?usuarioId=${usuarioId}`;

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
        console.error("Erro ao carregar financeiro:", err);
    }
}

// ======================================
// MODAL – LISTAR FAZENDAS DO USUÁRIO
// ======================================

async function carregarFazendasModal() {
    const select = document.getElementById("select-fazenda-modal");

    try {
        const usuarioId = localStorage.getItem("USUARIO_ID");
        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
        const vinculos = await resp.json();

        select.innerHTML = '<option value="" disabled selected>Selecione a fazenda...</option>';

        vinculos.forEach(v => {
            const f = v.fazenda;
            if (f) {
                const opt = document.createElement("option");
                opt.value = f.idFazenda;
                opt.textContent = f.nome;
                select.appendChild(opt);
            }
        });

        select.addEventListener("change", mudarTipoTransacao);

    } catch (err) {
        console.error("Erro ao carregar fazendas modal:", err);
    }
}

// ======================================
// PRODUTOS — GARANTE SOMENTE DO USUÁRIO
// ======================================

async function mudarTipoTransacao() {
    const tipo = document.getElementById("tipo-operacao").value;
    const labelProduto = document.getElementById("label-produto");
    const fazendaId = document.getElementById("select-fazenda-modal").value;
    const usuarioId = localStorage.getItem("USUARIO_ID");

    if (!fazendaId) return;

    let url = "";

    if (tipo === "ENTRADA") {
        labelProduto.textContent = "Produto Vendido (Estoque Saída)";
        url = `http://localhost:8080/api/produtosSaida/fazenda/${fazendaId}?usuarioId=${usuarioId}`;
    } else {
        labelProduto.textContent = "Insumo Comprado (Estoque Entrada)";
        url = `http://localhost:8080/api/produtosEntrada/fazenda/${fazendaId}?usuarioId=${usuarioId}`;
    }

    await carregarProdutos(url, fazendaId);
}

async function carregarProdutos(url, fazendaIdSelecionada) {
    const select = document.getElementById("select-produto");
    const usuarioId = parseInt(localStorage.getItem("USUARIO_ID"));

    select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

    try {
        const resp = await fetch(url);
        let produtos = await resp.json();

        // 🔥 FILTRO DEFINITIVO
        produtos = produtos.filter(p => {
            const fazendaDoProduto = p.fazenda?.idFazenda;
            return fazendaDoProduto === parseInt(fazendaIdSelecionada);
        });

        select.innerHTML = '<option value="" disabled selected>Selecione o produto...</option>';

        produtos.forEach(p => {
            const opt = document.createElement("option");

            const idReal = p.idProdutoSaida || p.idProdutosEntrada;
            opt.value = idReal;
            opt.textContent = p.nomeProduto;

            select.appendChild(opt);
        });

    } catch (err) {
        console.error("Erro produtos:", err);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

// ======================================
// SALVAR TRANSACAO
// ======================================

async function salvarTransacao() {
    const tipo = document.getElementById("tipo-operacao").value;
    const descricao = document.getElementById("descricao").value;
    const valor = document.getElementById("valor").value;
    const data = document.getElementById("data").value;
    const fazendaId = document.getElementById("select-fazenda-modal").value;
    const produtoId = document.getElementById("select-produto").value;

    if (!descricao || !valor || !data || !fazendaId || !produtoId) {
        alert("Preencha todos os campos.");
        return;
    }

    const payload = {
        descricao,
        valor: parseFloat(valor),
        fazenda: { idFazenda: parseInt(fazendaId) }
    };

    let url = "";

    if (tipo === "ENTRADA") {
        payload.tipoEntrada = "VENDA";
        payload.dataEntrada = data;
        payload.produtoSaida = { idProdutoSaida: parseInt(produtoId) };
        url = "http://localhost:8080/api/financeiro/entradas";
    } else {
        payload.tipoSaida = "CUSTO";
        payload.dataSaida = data;
        payload.produtoEntrada = { idProdutosEntrada: parseInt(produtoId) };
        url = "http://localhost:8080/api/financeiro/saidas";
    }

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            alert("Salvo com sucesso!");
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalTransacao'));
            modal.hide();
            document.getElementById("form-transacao").reset();
            carregarFinanceiro();
        } else {
            console.log(await resp.text());
            alert("Erro ao salvar!");
        }
    } catch (err) {
        console.error("Erro salvar:", err);
    }
}

// ======================================
// RENDERS
// ======================================

async function renderizarEntradas(lista) {
    const usuarioFazendas = await carregarFazendasDoUsuarioIDs();

    // manter somente entradas de fazendas que o usuário pode acessar
    lista = lista.filter(e =>
        usuarioFazendas.includes(e.fazenda?.idFazenda)
    );

    const tabela = document.getElementById("lista-entradas");
    tabela.innerHTML = "";

    if (!lista.length) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma entrada registrada.</td></tr>`;
        return;
    }

    lista.forEach(e => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatarData(e.dataEntrada)}</td>
            <td>${e.descricao}</td>
            <td><span class="badge bg-success">${e.tipoEntrada}</span></td>
            <td>R$ ${parseFloat(e.valor).toFixed(2)}</td>
            <td>${e.fazenda?.nome || "-"}</td>
            <td>${e.produtoSaida?.nomeProduto || "-"}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deletarItem('entradas', ${e.idFinanceiroEntrada})"><i class="fas fa-trash"></i></button></td>
        `;
        tabela.appendChild(tr);
    });
}

async function renderizarSaidas(lista) {
    const usuarioFazendas = await carregarFazendasDoUsuarioIDs();

    // manter somente saídas de fazendas que o usuário pode acessar
    lista = lista.filter(s =>
        usuarioFazendas.includes(s.fazenda?.idFazenda)
    );

    const tabela = document.getElementById("lista-saidas");
    tabela.innerHTML = "";

    if (!lista.length) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma saída registrada.</td></tr>`;
        return;
    }

    lista.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${formatarData(s.dataSaida)}</td>
            <td>${s.descricao}</td>
            <td><span class="badge bg-danger">${s.tipoSaida}</span></td>
            <td>R$ ${parseFloat(s.valor).toFixed(2)}</td>
            <td>${s.fazenda?.nome || "-"}</td>
            <td>${s.produtoEntrada?.nomeProduto || "-"}</td>
            <td><button class="btn btn-sm btn-danger" onclick="deletarItem('saidas', ${s.idFinanceiroSaida})"><i class="fas fa-trash"></i></button></td>
        `;
        tabela.appendChild(tr);
    });
}


async function atualizarSaldos(entradas, saidas) {
    const usuarioId = parseInt(localStorage.getItem("USUARIO_ID"));

    // 🔹 Buscar IDs das fazendas vinculadas ao usuário
    const fazendasUsuario = await carregarFazendasDoUsuarioIDs();

    // 🔥 Filtra entradas e saídas por fazendas do usuário
    const entradasUsuario = entradas.filter(e => fazendasUsuario.includes(e.fazenda?.idFazenda));
    const saidasUsuario = saidas.filter(s => fazendasUsuario.includes(s.fazenda?.idFazenda));

    // 🔢 Soma somente as filtradas
    const totE = entradasUsuario.reduce((t, e) => t + e.valor, 0);
    const totS = saidasUsuario.reduce((t, s) => t + s.valor, 0);

    // 💰 Atualiza os campos
    document.getElementById("saldo-entradas").innerText = `R$ ${totE.toFixed(2)}`;
    document.getElementById("saldo-saidas").innerText = `R$ ${totS.toFixed(2)}`;
    document.getElementById("saldo-total").innerText = `R$ ${(totE - totS).toFixed(2)}`;
}



function formatarData(data) {
    if (!data) return "-";
    const [y, m, d] = data.split("-");
    return `${d}/${m}/${y}`;
}

async function deletarItem(tipo, id) {
    if (!confirm("Excluir item?")) return;
    await fetch(`http://localhost:8080/api/financeiro/${tipo}/${id}`, {
        method: "DELETE"
    });
    carregarFinanceiro();
}

