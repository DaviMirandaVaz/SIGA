document.addEventListener("DOMContentLoaded", async () => {
  await carregarFazendas();
  await carregarFinanceiro();
});

async function carregarFazendas() {
  const select = document.getElementById("filtro-fazenda");

  try {
    const usuarioId = localStorage.getItem("USUARIO_ID");

    const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);
    if (!resp.ok) throw new Error("Erro ao buscar fazendas do usuário");

    const vinculos = await resp.json();

    select.innerHTML = `<option value="todas">Todas as Fazendas</option>`;

    vinculos.forEach(v => {
      if (!v.fazenda) return;

      const opt = document.createElement("option");
      opt.value = v.fazenda.idFazenda;
      opt.textContent = v.fazenda.nome;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Erro ao carregar fazendas:", err);
  }
}

async function carregarFinanceiro(fazendaId = "todas") {
  const urlBase = "http://localhost:8080/api/financeiro";

  const urlEntradas = fazendaId === "todas"
    ? `${urlBase}/entradas`
    : `${urlBase}/entradas/fazenda/${fazendaId}`;

  const urlSaidas = fazendaId === "todas"
    ? `${urlBase}/saidas`
    : `${urlBase}/saidas/fazenda/${fazendaId}`;

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

function renderizarEntradas(lista) {
  const tabela = document.getElementById("lista-entradas");
  tabela.innerHTML = "";

  if (!lista || lista.length === 0) {
    tabela.innerHTML = `<tr><td colspan="6" class="text-center">Nenhuma entrada registrada.</td></tr>`;
    return;
  }

  lista.forEach(e => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.descricao || "-"}</td>
      <td>${e.tipoEntrada || "-"}</td>
      <td>R$ ${parseFloat(e.valor).toFixed(2)}</td>
      <td>${e.dataEntrada || "-"}</td>
      <td>${e.fazenda?.nome || "-"}</td>
      <td>
        <button class="btn btn-sm btn-success"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
      </td>`;
    tabela.appendChild(tr);
  });
}

function renderizarSaidas(lista) {
  const tabela = document.getElementById("lista-saidas");
  tabela.innerHTML = "";

  if (!lista || lista.length === 0) {
    tabela.innerHTML = `<tr><td colspan="6" class="text-center">Nenhuma saída registrada.</td></tr>`;
    return;
  }

  lista.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.descricao || "-"}</td>
      <td>${s.tipoSaida || "-"}</td>
      <td>R$ ${parseFloat(s.valor).toFixed(2)}</td>
      <td>${s.dataSaida || "-"}</td>
      <td>${s.fazenda?.nome || "-"}</td>
      <td>
        <button class="btn btn-sm btn-success"><i class="fas fa-pen"></i></button>
        <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
      </td>`;
    tabela.appendChild(tr);
  });
}

function atualizarSaldos(entradas, saidas) {
  const totalEntradas = entradas.reduce((acc, e) => acc + parseFloat(e.valor || 0), 0);
  const totalSaidas = saidas.reduce((acc, s) => acc + parseFloat(s.valor || 0), 0);
  const saldoTotal = totalEntradas - totalSaidas;

  document.getElementById("saldo-entradas").innerText = `R$ ${totalEntradas.toFixed(2)}`;
  document.getElementById("saldo-saidas").innerText = `R$ ${totalSaidas.toFixed(2)}`;
  document.getElementById("saldo-total").innerText = `R$ ${saldoTotal.toFixed(2)}`;
}

function filtrarPorFazenda() {
  const fazendaId = document.getElementById("filtro-fazenda").value;
  carregarFinanceiro(fazendaId);
}
