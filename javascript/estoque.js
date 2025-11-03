const usuarioId = localStorage.getItem('USUARIO_ID');
let produtosCarregados = [];

window.addEventListener("DOMContentLoaded", carregarTodosProdutos);


async function carregarTodosProdutos() {
  if (!usuarioId) {
    alert("Usuário não autenticado. Faça login.");
    return;
  }

  try {
    const [entradas, intermedios, saidas] = await Promise.all([
      carregar("entrada", "http://localhost:8080/api/produtosEntrada"),
      carregar("intermedio", "http://localhost:8080/api/produtosIntermedios"),
      carregar("saida", "http://localhost:8080/api/produtosSaida"),
    ]);

    produtosCarregados = [...entradas, ...intermedios, ...saidas];
    renderizarProdutos(produtosCarregados);
  } catch (err) {
    console.error("Erro geral ao carregar produtos:", err);
    alert("Erro ao carregar produtos. Verifique o servidor.");
  }
}

async function carregar(tipo, url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Erro ao buscar ${tipo}: ${resp.status}`);
    let dados = await resp.json();


    // 🔹 Filtra apenas produtos da fazenda logada
    const usuarioId = parseInt(localStorage.getItem("USUARIO_ID"), 10);
    dados = dados.filter(p => p.fazenda?.usuario?.idUsuario === usuarioId);


    return dados.map(p => ({ ...p, tipoProduto: tipo }));
  } catch (e) {
    console.error(`Erro ao buscar ${tipo}:`, e);
    return [];
  }
}

function renderizarProdutos(produtos) {
  const tabelaEntrada = document.getElementById("lista-produtos-entrada");
  const tabelaIntermedio = document.getElementById("lista-produtos-intermedio");
  const tabelaSaida = document.getElementById("lista-produtos-saida");

  tabelaEntrada.innerHTML = tabelaIntermedio.innerHTML = tabelaSaida.innerHTML = "";

  if (!produtos || produtos.length === 0) {
    tabelaEntrada.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  produtos.forEach(p => {
    let tipo = "desconhecido";
    if (p.idProdutosEntrada) tipo = "entrada";
    else if (p.idProdutoIntermedio) tipo = "intermedio";
    else if (p.idProdutoSaida) tipo = "saida";

    const id = p.idProdutosEntrada || p.idProdutoIntermedio || p.idProdutoSaida;
    const fazendaNome = p.fazenda?.nome || "—";
    const valor = p.valorUnitario || p.valorEstimado || p.valorVenda || 0;
    const unidade = p.unidadeMedida || "-"; // 👈 nova linha

    const tr = document.createElement("tr");

    if (tipo === "saida") {
      // 👇 Montagem da tabela de saída com unidade de medida
      tr.innerHTML = `
        <td>${p.nomeProduto || "-"}</td>
        <td>${unidade}</td>
        <td>${p.quantidade || "-"}</td>
        <td>R$ ${parseFloat(valor).toFixed(2)}</td>
        <td>${fazendaNome}</td>
        <td>
          <button class="btn btn-sm btn-success me-2" onclick="abrirEdicao('${tipo}', ${id})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="excluirProduto('${tipo}', ${id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaSaida.appendChild(tr);
    } 
    else if (tipo === "entrada") {
      tr.innerHTML = `
        <td>${p.nomeProduto || "-"}</td>
        <td>${p.tipo || "-"}</td>
        <td>${p.quantidade || "-"}</td>
        <td>R$ ${parseFloat(valor).toFixed(2)}</td>
        <td>${fazendaNome}</td>
        <td>
          <button class="btn btn-sm btn-success me-2" onclick="abrirEdicao('${tipo}', ${id})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="excluirProduto('${tipo}', ${id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaEntrada.appendChild(tr);
    } 
    else if (tipo === "intermedio") {
      tr.innerHTML = `
        <td>${p.nomeProduto || "-"}</td>
        <td>${p.tipo || "-"}</td>
        <td>${p.quantidade || "-"}</td>
        <td>R$ ${parseFloat(valor).toFixed(2)}</td>
        <td>${fazendaNome}</td>
        <td>
          <button class="btn btn-sm btn-success me-2" onclick="abrirEdicao('${tipo}', ${id})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="excluirProduto('${tipo}', ${id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tabelaIntermedio.appendChild(tr);
    } 
    else {
      console.warn("⚠️ Tipo de produto desconhecido:", p);
    }
  });
}


// 🗑️ Excluir produto
async function excluirProduto(tipo, id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  const url = tipo === "entrada"
    ? `http://localhost:8080/api/produtosEntrada/${id}`
    : tipo === "intermedio"
      ? `http://localhost:8080/api/produtosIntermedios/${id}`
      : `http://localhost:8080/api/produtosSaida/${id}`;

  try {
    const resp = await fetch(url, { method: "DELETE" });
    if (resp.ok) {
      alert("Produto excluído com sucesso!");
      carregarTodosProdutos();
    } else {
      alert("Erro ao excluir produto.");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("Erro de conexão ao excluir produto.");
  }
}


// ✏️ Abrir modal de edição
function abrirEdicao(tipo, id) {
  const idNum = Number(id);
  const produto = produtosCarregados.find(p => {
    if (tipo === "entrada") return p.idProdutosEntrada === idNum;
    if (tipo === "intermedio") return p.idProdutoIntermedio === idNum;
    if (tipo === "saida") return p.idProdutoSaida === idNum;
  });

  if (!produto) return alert("Produto não encontrado.");

  // Preenche dados básicos
  document.getElementById("edit-id").value = idNum;
  document.getElementById("edit-tipo-produto").value = tipo;
  document.getElementById("edit-nome").value = produto.nomeProduto || "";
  document.getElementById("edit-quantidade").value = produto.quantidade || 0;
  document.getElementById("edit-valor").value =
    produto.valorUnitario || produto.valorEstimado || produto.valorVenda || 0;

  const selectSubtipo = document.getElementById("edit-subtipo");
  selectSubtipo.innerHTML = ""; // limpa opções anteriores

  // 🔹 Entrada → Tipos de insumos
  if (tipo === "entrada") {
    ["RAÇÃO", "ADUBO", "MEDICAMENTO", "SEMENTE", "OUTRO"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    selectSubtipo.value = produto.tipo || "";

  // 🔹 Intermediário → Tipos de produção
  } else if (tipo === "intermedio") {
    ["ANIMAL", "LAVOURA", "PLANTAÇÃO"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    selectSubtipo.value = produto.tipo || "";

  // 🔹 Saída → Unidade de medida (editável)
  } else if (tipo === "saida") {
    ["KG", "L", "SACA", "TONELADA"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    // ✅ Garante que a unidade atual venha selecionada (sem forçar "SACA")
    selectSubtipo.value = produto.unidadeMedida?.toUpperCase?.() || "SACA";
  }

  // Abre o modal de edição
  new bootstrap.Modal(document.getElementById("modal-editar")).show();
}







// 💾 Salvar edição
async function salvarEdicao() {
  const id = document.getElementById("edit-id").value;
  const tipo = document.getElementById("edit-tipo-produto").value; // entrada / intermedio / saida
  const nome = document.getElementById("edit-nome").value.trim();
  const subtipo = document.getElementById("edit-subtipo").value.trim().toUpperCase(); // garante enum válido
  const quantidade = parseFloat(document.getElementById("edit-quantidade").value);
  const valor = parseFloat(document.getElementById("edit-valor").value);
  const fazendaId = localStorage.getItem("FAZENDA_ID") || 1; // substitua se estiver usando fazenda selecionada

  let produtoAtualizado = { nomeProduto: nome, quantidade };

  if (tipo === "entrada") {
    produtoAtualizado.idProdutosEntrada = parseInt(id);
    produtoAtualizado.tipo = subtipo; // deve ser "RAÇÃO", "SEMENTE", etc.
    produtoAtualizado.valorUnitario = valor;
    produtoAtualizado.unidadeMedida = "SACA";
    produtoAtualizado.dataCompra = new Date().toISOString().split("T")[0];
    produtoAtualizado.fazenda = { idFazenda: fazendaId };

  } else if (tipo === "intermedio") {
    produtoAtualizado.idProdutoIntermedio = parseInt(id);
    produtoAtualizado.tipo = subtipo; // "ANIMAL", "LAVOURA" ou "PLANTAÇÃO"
    produtoAtualizado.valorEstimado = valor;
    produtoAtualizado.dataInicio = new Date().toISOString().split("T")[0];
    produtoAtualizado.status = "ATIVO"; // default do backend
    produtoAtualizado.fazenda = { idFazenda: fazendaId };

  } else if (tipo === "saida") {
    produtoAtualizado.idProdutoSaida = parseInt(id);
    produtoAtualizado.valorVenda = valor;
    produtoAtualizado.unidadeMedida = subtipo; // 👈 pega o valor escolhido no select
    produtoAtualizado.dataVenda = new Date().toISOString().split("T")[0];
    produtoAtualizado.fazenda = { idFazenda: fazendaId };
  }

  const url =
    tipo === "entrada"
      ? `http://localhost:8080/api/produtosEntrada/${id}`
      : tipo === "intermedio"
        ? `http://localhost:8080/api/produtosIntermedios/${id}`
        : `http://localhost:8080/api/produtosSaida/${id}`;

  console.log("🧾 Enviando PUT:", url, produtoAtualizado);

  try {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produtoAtualizado),
    });

    if (resp.ok) {
      alert("✅ Produto atualizado com sucesso!");
      bootstrap.Modal.getInstance(document.getElementById("modal-editar")).hide();
      carregarTodosProdutos();
    } else {
      const erro = await resp.text();
      console.error("❌ Erro na resposta:", erro);
      alert("Erro ao atualizar produto. Veja o console para detalhes.");
    }
  } catch (err) {
    console.error("❌ Erro ao atualizar:", err);
    alert("Erro de conexão com o servidor.");
  }
}




function tipoTabela(p) {
  if (p.idProdutosEntrada) return "entrada";
  if (p.idProdutoIntermedio) return "intermedio";
  if (p.idProdutoSaida) return "saida";
  return "desconhecido";
}

