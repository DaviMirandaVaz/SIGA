document.addEventListener("DOMContentLoaded", async () => {
  const tabela = document.getElementById("tabela-fazendas");
  const usuarioId = localStorage.getItem("USUARIO_ID");

  if (!usuarioId) {
    tabela.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Usuário não identificado. Faça login novamente.</td></tr>`;
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/api/usuario-fazenda/fazendasPorUsuario/${usuarioId}`);
    if (!response.ok) throw new Error(`Erro ao buscar fazendas: ${response.status}`);

    const fazendas = await response.json();

    if (fazendas.length === 0) {
      tabela.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma fazenda cadastrada.</td></tr>`;
      return;
    }

    tabela.innerHTML = "";

    fazendas.forEach(f => {
      tabela.innerHTML += `
        <tr>
          <td>${f.idFazenda}</td>
          <td>${f.nome}</td>
          <td>${f.localizacao || "-"}</td>
          <td>${f.areaHectares ? f.areaHectares.toFixed(2) : "-"}</td>
          <td>${f.usuario ? f.usuario.nome : "-"}</td>
        </tr>
      `;
    });

  } catch (erro) {
    console.error("Erro ao carregar fazendas:", erro);
    tabela.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar fazendas.</td></tr>`;
  }
});

