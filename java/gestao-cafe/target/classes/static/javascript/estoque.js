const usuarioId = localStorage.getItem('USUARIO_ID');
let produtosCarregados = [];

window.addEventListener("DOMContentLoaded", carregarTodosProdutos);



//seletor fazenda
function filtrarPorFazenda() {
  const seletor = document.getElementById("filtro-fazenda");
  const fazendaSelecionada = seletor.value;

  if (fazendaSelecionada === "todas") {
    renderizarProdutos(produtosCarregados);
  } else {
    const produtosFiltrados = produtosCarregados.filter(
      p => String(p.fazenda?.idFazenda) === String(fazendaSelecionada)
    );
    renderizarProdutos(produtosFiltrados);
  }
}

//filtrar produtos
function filtrarProdutos() {
  const termo = document.getElementById("busca-produto").value.toLowerCase();
  const fazendaSelecionada = document.getElementById("filtro-fazenda").value;

  let produtosFiltrados = produtosCarregados.filter(p =>
  (p.nomeProduto?.toLowerCase().includes(termo) ||
    p.tipo?.toLowerCase().includes(termo) ||
    p.fazenda?.nome?.toLowerCase().includes(termo))
  );

  if (fazendaSelecionada !== "todas") {
    produtosFiltrados = produtosFiltrados.filter(
      p => String(p.fazenda?.idFazenda) === String(fazendaSelecionada)
    );
  }

  renderizarProdutos(produtosFiltrados);
}



async function carregarTodosProdutos() {
  if (!usuarioId) {
    alert("Usuário não autenticado. Faça login.");
    return;
  }

  try {
    // 🔹 1. Buscar as fazendas do usuário logado
    const fazendasResp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
    if (!fazendasResp.ok) throw new Error("Erro ao buscar fazendas do usuário.");
    const fazendasUsuario = await fazendasResp.json();
    const idsFazendas = fazendasUsuario.map(f => f.fazenda?.idFazenda).filter(id => id !== undefined && id !== null);

    console.log("✅ Fazendas do usuário:", fazendasUsuario);

    // 🔹 2. Popular seletor de fazendas (dropdown)
    const seletorFazenda = document.getElementById("filtro-fazenda");

    if (seletorFazenda) {
      seletorFazenda.innerHTML = `<option value="todas">Todas as Fazendas</option>`;

      fazendasUsuario.forEach(f => {
        const id = f.fazenda?.idFazenda;
        const nome = f.fazenda?.nome;

        console.log("ID detectado:", id, "Nome detectado:", nome);

        if (id && nome) {
          seletorFazenda.innerHTML += `<option value="${id}">${nome}</option>`;
        }
      });
    }




    // 🔹 3. Buscar todos os produtos (entrada, intermedio, saída)
    const [entradas, intermedios, saidas] = await Promise.all([
      carregar("entrada", "http://localhost:8080/api/produtosEntrada"),
      carregar("intermedio", "http://localhost:8080/api/produtosIntermedios"),
      carregar("saida", "http://localhost:8080/api/produtosSaida"),
    ]);

    console.log("📦 Produtos Entrada:", entradas);
    console.log("📦 Produtos Intermedios:", intermedios);
    console.log("📦 Produtos Saida:", saidas);
    console.log("🔍 IDs das fazendas do usuário:", idsFazendas);

    console.log("🔍 Verificando fazendas dos produtos Entrada:");
    entradas.forEach(p => console.log(`Entrada ${p.nomeProduto} →`, p.fazenda?.idFazenda));

    console.log("🔍 Verificando fazendas dos produtos Intermedios:");
    intermedios.forEach(p => console.log(`Intermedio ${p.nomeProduto} →`, p.fazenda?.idFazenda));

    console.log("🔍 Verificando fazendas dos produtos Saida:");
    saidas.forEach(p => console.log(`Saída ${p.nomeProduto} →`, p.fazenda?.idFazenda));


    // 🔹 4. Filtrar produtos apenas das fazendas do usuário
    const todosProdutos = [...entradas, ...intermedios, ...saidas].filter(
      p => idsFazendas.includes(p.fazenda?.idFazenda)
    );


    console.log("🎯 Produtos filtrados:", todosProdutos);

    // 🔹 5. Salvar no cache local e renderizar
    produtosCarregados = todosProdutos;
    renderizarProdutos(produtosCarregados);

    // 🔹 6. Garantir que filtros fiquem ativos após o carregamento
    document.getElementById("filtro-fazenda").addEventListener("change", filtrarProdutos);
    document.getElementById("busca-produto").addEventListener("input", filtrarProdutos);
  } catch (err) {
    console.error("Erro geral ao carregar produtos:", err);
    alert("Erro ao carregar produtos. Verifique o servidor.");
  }
}





async function carregar(tipo, url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Erro ao buscar ${tipo}: ${resp.status}`);
    const dados = await resp.json();
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
  if (!confirm("Desativar este produto?")) return;

  const url = tipo === "entrada"
    ? `http://localhost:8080/api/produtosEntrada/${id}/inativar`
    : tipo === "intermedio"
      ? `http://localhost:8080/api/produtosIntermedios/${id}/inativar`
      : `http://localhost:8080/api/produtosSaida/${id}/inativar`;

  try {
    const resp = await fetch(url, { method: "PUT" });
    if (resp.ok) {
      alert("Produto desativado!");
      carregarTodosProdutos();
    } else {
      alert("Erro ao desativar produto.");
    }
  } catch (err) {
    console.error("Erro ao inativar:", err);
    alert("Erro de conexão ao desativar produto.");
  }
}



// ✏️ Abrir modal de edição
async function abrirEdicao(tipo, id) {
  const idNum = Number(id);
  const produto = produtosCarregados.find(p => {
    if (tipo === "entrada") return p.idProdutosEntrada === idNum;
    if (tipo === "intermedio") return p.idProdutoIntermedio === idNum;
    if (tipo === "saida") return p.idProdutoSaida === idNum;
  });

  if (!produto) return alert("Produto não encontrado.");

  // 🔹 Preenche os campos básicos
  document.getElementById("edit-id").value = idNum;
  document.getElementById("edit-tipo-produto").value = tipo;
  document.getElementById("edit-nome").value = produto.nomeProduto || "";
  document.getElementById("edit-quantidade").value = produto.quantidade || 0;
  document.getElementById("edit-valor").value =
    produto.valorUnitario || produto.valorEstimado || produto.valorVenda || 0;

  // 🔹 Preenche opções do subtipo
  const selectSubtipo = document.getElementById("edit-subtipo");
  selectSubtipo.innerHTML = "";

  if (tipo === "entrada") {
    ["RAÇÃO", "ADUBO", "MEDICAMENTO", "SEMENTE", "OUTRO"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    selectSubtipo.value = produto.tipo || "";
  } else if (tipo === "intermedio") {
    ["ANIMAL", "LAVOURA", "PLANTAÇÃO"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    selectSubtipo.value = produto.tipo || "";
  } else if (tipo === "saida") {
    ["KG", "L", "SACA", "TONELADA"].forEach(op => {
      selectSubtipo.innerHTML += `<option value="${op}">${op}</option>`;
    });
    selectSubtipo.value = produto.unidadeMedida?.toUpperCase?.() || "SACA";
  }

  // 🔹 Preenche o seletor de fazenda
  const selectFazenda = document.getElementById("edit-fazenda");
  if (selectFazenda) {
    selectFazenda.innerHTML = `<option value="">Selecione uma fazenda...</option>`;

    try {
      const resp = await fetch(`http://localhost:8080/api/fazendas/porDono/${usuarioId}`);
      if (resp.ok) {
        const fazendas = await resp.json();
        fazendas.forEach(f => {
          const selected = produto.fazenda?.idFazenda === f.idFazenda ? "selected" : "";
          selectFazenda.innerHTML += `<option value="${f.idFazenda}" ${selected}>${f.nome}</option>`;
        });
      } else {
        console.warn("Erro ao carregar fazendas do usuário.");
      }
    } catch (e) {
      console.error("Erro ao buscar fazendas:", e);
    }
  }

  // 🔹 Exibe o modal
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
  const fazendaId = document.getElementById("edit-fazenda").value;


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

