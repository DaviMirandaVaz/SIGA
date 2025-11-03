document.addEventListener("DOMContentLoaded", async () => {
  const tabelaUsuarios = document.querySelector("#tabelaUsuarios tbody");
  const formNovoUsuario = document.querySelector("#formNovoUsuario");
  const formEditarUsuario = document.querySelector("#formEditarUsuario");
  const fazendaSelect = document.getElementById("fazenda");
  const editFazendaSelect = document.getElementById("editFazenda");
  const API_BASE = "http://localhost:8080/api";

  let fazendas = [];
  let usuarioEmEdicao = null;

  // Inicialização
  await carregarFazendas();
  await carregarUsuarios();

  // ==============================
  // 🔹 Carregar fazendas
  // ==============================
  async function carregarFazendas() {
    try {
      const resp = await fetch(`${API_BASE}/fazendas`);
      if (!resp.ok) throw new Error("Falha ao carregar fazendas");
      const texto = await resp.text();
      try {
        fazendas = JSON.parse(texto);
      } catch {
        console.error("⚠️ JSON de fazendas inválido:", texto);
        return;
      }

      // Popula os selects
      const preencherSelect = (select) => {
        select.innerHTML = `<option value="">Selecione</option>`;
        fazendas.forEach(f => {
          const opt = document.createElement("option");
          opt.value = f.idFazenda;
          opt.textContent = f.nome;
          select.appendChild(opt);
        });
      };

      preencherSelect(fazendaSelect);
      preencherSelect(editFazendaSelect);
      console.log("✅ Fazendas carregadas:", fazendas);
    } catch (err) {
      console.error("❌ Erro ao carregar fazendas:", err);
      fazendaSelect.innerHTML = `<option value="">Erro ao carregar</option>`;
    }
  }

  // ==============================
  // 🔹 Carregar usuários
  // ==============================
  async function carregarUsuarios() {
    try {
      const resp = await fetch(`${API_BASE}/usuarios`);
      if (!resp.ok) throw new Error("Falha ao carregar usuários");

      const texto = await resp.text();
      let usuarios = [];
      try {
        usuarios = JSON.parse(texto);
      } catch {
        console.error("⚠️ JSON de usuários inválido:", texto);
        return;
      }

      tabelaUsuarios.innerHTML = "";

      usuarios.forEach(u => {
        const fazendaNomes = (u.fazendas && u.fazendas.length > 0)
          ? u.fazendas.map(f => f.nome).join(", ")
          : "—";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td>${u.tipoUsuario || "—"}</td>
          <td>${fazendaNomes}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2 editar" data-id="${u.idUsuario}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger excluir" data-id="${u.idUsuario}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        tabelaUsuarios.appendChild(row);
      });
    } catch (err) {
      console.error("❌ Erro ao carregar usuários:", err);
      tabelaUsuarios.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar usuários</td></tr>`;
    }
  }

  // ==============================
  // 🔹 Cadastrar novo usuário
  // ==============================
  formNovoUsuario.addEventListener("submit", async e => {
    e.preventDefault();

    const usuario = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      tipoUsuario: document.getElementById("tipo").value,
      fazendas: [{
        idFazenda: document.getElementById("fazenda").value
      }]
    };

    try {
      const resp = await fetch(`${API_BASE}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
      });

      if (!resp.ok) throw new Error("Falha ao cadastrar usuário");
      await carregarUsuarios();
      formNovoUsuario.reset();
      alert("✅ Usuário cadastrado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao cadastrar usuário:", err);
      alert("Erro ao cadastrar usuário!");
    }
  });

  // ==============================
  // 🔹 Abrir modal de edição
  // ==============================
  tabelaUsuarios.addEventListener("click", async e => {
    if (e.target.closest(".editar")) {
      const id = e.target.closest(".editar").dataset.id;
      try {
        const resp = await fetch(`${API_BASE}/usuarios/${id}`);
        const usuario = await resp.json();

        usuarioEmEdicao = usuario.idUsuario;

        document.getElementById("editNome").value = usuario.nome;
        document.getElementById("editEmail").value = usuario.email;
        document.getElementById("editTipo").value = usuario.tipoUsuario;
        if (usuario.fazendas && usuario.fazendas.length > 0) {
          document.getElementById("editFazenda").value = usuario.fazendas[0].idFazenda;
        }

        const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
        modal.show();
      } catch (err) {
        console.error("❌ Erro ao carregar usuário para edição:", err);
      }
    }
  });

  // ==============================
  // 🔹 Salvar alterações
  // ==============================
  formEditarUsuario.addEventListener("submit", async e => {
    e.preventDefault();

    const usuarioAtualizado = {
      nome: document.getElementById("editNome").value,
      email: document.getElementById("editEmail").value,
      tipoUsuario: document.getElementById("editTipo").value,
      fazendas: [{
        idFazenda: document.getElementById("editFazenda").value
      }]
    };

    try {
      const resp = await fetch(`${API_BASE}/usuarios/${usuarioEmEdicao}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioAtualizado)
      });

      if (!resp.ok) throw new Error("Falha ao atualizar usuário");

      await carregarUsuarios();
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
      modal.hide();
      alert("✅ Usuário atualizado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao atualizar usuário:", err);
      alert("Erro ao atualizar usuário!");
    }
  });

  // ==============================
  // 🔹 Excluir usuário
  // ==============================
  tabelaUsuarios.addEventListener("click", async e => {
    if (e.target.closest(".excluir")) {
      const id = e.target.closest(".excluir").dataset.id;
      if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

      try {
        const resp = await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Falha ao excluir usuário");
        await carregarUsuarios();
      } catch (err) {
        console.error("❌ Erro ao excluir:", err);
      }
    }
  });
});
