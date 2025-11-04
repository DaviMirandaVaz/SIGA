document.addEventListener("DOMContentLoaded", async () => {
  const tabelaUsuarios = document.querySelector("#tabelaUsuarios tbody");
  const formNovoUsuario = document.querySelector("#formNovoUsuario");
  const formEditarUsuario = document.querySelector("#formEditarUsuario");
  const fazendaSelect = document.getElementById("fazenda");
  const editFazendaSelect = document.getElementById("editFazenda");
  const API_BASE = "http://localhost:8080/api";
  const usuarioId = localStorage.getItem("USUARIO_ID");

  let fazendas = [];
  let usuarioEmEdicao = null;

  await carregarFazendas();
  await carregarUsuarios();

  // ==============================
  // 🔹 Carregar fazendas
  // ==============================
  async function carregarFazendas() {
    try {
      const resp = await fetch(`${API_BASE}/fazendas/porDono/${usuarioId}`);
      fazendas = await resp.json();

      const container = document.getElementById("fazendasCheckboxes");
      container.innerHTML = "";

      fazendas.forEach(f => {
        const div = document.createElement("div");
        div.classList.add("form-check");
        div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${f.idFazenda}" id="fazenda_${f.idFazenda}">
        <label class="form-check-label" for="fazenda_${f.idFazenda}">${f.nome}</label>
      `;
        container.appendChild(div);
      });

    } catch (err) {
      console.error("Erro ao carregar fazendas:", err);
    }
  }


  // ==============================
  // 🔹 Carregar usuários (apenas subordinados do dono logado)
  // ==============================
  async function carregarUsuarios() {
    try {
      if (!usuarioId) {
        console.error("USUARIO_ID não encontrado no localStorage.");
        return;
      }

      const resp = await fetch(`${API_BASE}/usuarios/subordinados/${usuarioId}`);
      if (!resp.ok) throw new Error("Erro ao buscar usuários subordinados.");

      const usuarios = await resp.json();
      tabelaUsuarios.innerHTML = "";

      for (const u of usuarios) {
        // Buscar fazendas vinculadas ao usuário
        let fazendasUsuario = [];
        try {
          const respUF = await fetch(`${API_BASE}/usuario-fazenda/porUsuario/${u.idUsuario}`);
          if (respUF.ok) {
            fazendasUsuario = await respUF.json();
          }
        } catch (err) {
          console.error(`Erro ao buscar fazendas de ${u.nome}:`, err);
        }

        const fazendaNomes = fazendasUsuario.length > 0
          ? fazendasUsuario
            .map(uf => uf.fazenda && uf.fazenda.nome ? uf.fazenda.nome : "—")
            .filter(nome => nome !== "—")
            .join(", ") || "—"
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
      }
    } catch (err) {
      console.error("Erro ao carregar usuários subordinados:", err);
      tabelaUsuarios.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Erro ao carregar usuários</td></tr>`;
    }
  }


  // ==============================
  // 🔹 Cadastrar novo usuário + vínculo
  // ==============================
  formNovoUsuario.addEventListener("submit", async e => {
    e.preventDefault();

    const novoUsuario = {
      nome: document.getElementById("nome").value,
      email: document.getElementById("email").value,
      senha: document.getElementById("senha").value,
      tipoUsuario: document.getElementById("tipo").value,
      usuarioDono: { idUsuario: parseInt(usuarioId) }
      // ✅ adiciona o vínculo com o dono
    };


    try {
      // 1️⃣ Cadastra o usuário
      const respUsuario = await fetch(`${API_BASE}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
      });

      if (!respUsuario.ok) throw new Error("Falha ao cadastrar usuário");
      const usuarioCriado = await respUsuario.json();

      // 2️⃣ Cria o vínculo com a fazenda
      // ✅ Pega todas as fazendas marcadas
      const fazendasSelecionadas = Array.from(
        document.querySelectorAll("#fazendasCheckboxes input:checked")
      ).map(cb => parseInt(cb.value));

      for (const idFazenda of fazendasSelecionadas) {
        await fetch(`${API_BASE}/usuario-fazenda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: { idUsuario: usuarioCriado.idUsuario },
            fazenda: { idFazenda },
            cargo: "Funcionário"
          })
        });
      }


      await carregarUsuarios();
      formNovoUsuario.reset();
      alert("✅ Usuário cadastrado e vinculado à fazenda com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      alert("Erro ao cadastrar usuário!");
    }
  });

  // ==============================
  // 🔹 Abrir modal de edição (com múltiplas fazendas)
  // ==============================
  tabelaUsuarios.addEventListener("click", async e => {
    if (e.target.closest(".editar")) {
      const id = e.target.closest(".editar").dataset.id;

      try {
        // Busca usuário
        const resp = await fetch(`${API_BASE}/usuarios/${id}`);
        const usuario = await resp.json();
        usuarioEmEdicao = usuario.idUsuario;

        document.getElementById("editNome").value = usuario.nome;
        document.getElementById("editEmail").value = usuario.email;
        document.getElementById("editTipo").value = usuario.tipoUsuario;

        // Busca as fazendas do dono logado
        const usuarioLogadoId = localStorage.getItem("USUARIO_ID");
        const respFazendas = await fetch(`${API_BASE}/usuarios/porDono/${usuarioLogadoId}`);
        const fazendas = await respFazendas.json();

        const container = document.getElementById("editCheckboxFazendas");
        container.innerHTML = ""; // limpa o container

        // Cria os checkboxes
        fazendas.forEach(f => {
          const div = document.createElement("div");
          div.classList.add("form-check");
          div.innerHTML = `
          <input class="form-check-input" type="checkbox" value="${f.idFazenda}" id="edit_fazenda_${f.idFazenda}">
          <label class="form-check-label" for="edit_fazenda_${f.idFazenda}">${f.nome}</label>
        `;
          container.appendChild(div);
        });

        // Busca vínculos do usuário e marca os checkboxes correspondentes
        const respUF = await fetch(`${API_BASE}/usuario-fazenda/porUsuario/${id}`);
        const vinculos = await respUF.json();

        vinculos.forEach(v => {
          const cb = document.getElementById(`edit_fazenda_${v.fazenda.idFazenda}`);
          if (cb) cb.checked = true;
        });

        const modal = new bootstrap.Modal(document.getElementById("modalEditar"));
        modal.show();
      } catch (err) {
        console.error("Erro ao carregar usuário para edição:", err);
      }
    }
  });


  // ==============================
  // 🔹 Salvar alterações + múltiplos vínculos
  // ==============================
  formEditarUsuario.addEventListener("submit", async e => {
    e.preventDefault();

    const usuarioAtualizado = {
      nome: document.getElementById("editNome").value,
      email: document.getElementById("editEmail").value,
      tipoUsuario: document.getElementById("editTipo").value,
    };

    // Coleta os IDs das fazendas marcadas
    const fazendaIds = Array.from(document.querySelectorAll("#editCheckboxFazendas input:checked"))
      .map(cb => cb.value);

    try {
      // Atualiza dados do usuário
      const resp = await fetch(`${API_BASE}/usuarios/${usuarioEmEdicao}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioAtualizado),
      });

      if (!resp.ok) throw new Error("Falha ao atualizar usuário");

      // Apaga vínculos antigos
      const respUF = await fetch(`${API_BASE}/usuario-fazenda/porUsuario/${usuarioEmEdicao}`);
      const vinculos = await respUF.json();

      for (const v of vinculos) {
        await fetch(`${API_BASE}/usuario-fazenda/${v.idUsuarioFazenda}`, { method: "DELETE" });
      }

      // Cria novos vínculos
      for (const idFazenda of fazendaIds) {
        await fetch(`${API_BASE}/usuario-fazenda`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: { idUsuario: usuarioEmEdicao },
            fazenda: { idFazenda: parseInt(idFazenda) },
            cargo: "Funcionário"
          }),
        });
      }

      await carregarUsuarios();

      const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar"));
      modal.hide();

      alert("✅ Usuário atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      alert("Erro ao atualizar usuário!");
    }
  });

  // ==============================
  // 🔹 Excluir usuário + vínculo
  // ==============================
  tabelaUsuarios.addEventListener("click", async e => {
    if (e.target.closest(".excluir")) {
      const id = e.target.closest(".excluir").dataset.id;
      if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

      try {
        // Apaga vínculos primeiro
        const respUF = await fetch(`${API_BASE}/usuario-fazenda/porUsuario/${id}`);
        const vinculos = await respUF.json();
        for (const v of vinculos) {
          await fetch(`${API_BASE}/usuario-fazenda/${v.idUsuarioFazenda}`, { method: "DELETE" });
        }

        // Depois apaga o usuário
        const resp = await fetch(`${API_BASE}/usuarios/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Falha ao excluir usuário");
        await carregarUsuarios();
      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  });
});
