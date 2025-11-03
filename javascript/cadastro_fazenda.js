document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('cadastro-fazenda-form');
  if (!form) {
    console.error("Form cadastro-fazenda-form não encontrado.");
    return;
  }

  const usuarioId = localStorage.getItem('USUARIO_ID');
  console.log("FAZ: usuarioId do localStorage =", usuarioId);

  function coletarDados() {
    const nome = document.getElementById('nome_fazenda')?.value?.trim() || "";
    const localizacao = document.getElementById('localizacao_fazenda')?.value?.trim() || "";
    const areaRaw = document.getElementById('area_fazenda')?.value;
    const area = areaRaw ? parseFloat(areaRaw) : null;
    return { nome, localizacao, area };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const dados = coletarDados();
    console.log("Tentando cadastrar fazenda com dados:", dados);

    if (!dados.nome) {
      alert("Informe o nome da fazenda.");
      return;
    }

    if (!usuarioId) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "../html/login.html";
      return;
    }

    const payload = {
      nome: dados.nome,
      localizacao: dados.localizacao || null,
      areaHectares: dados.area,
      usuario: { idUsuario: parseInt(usuarioId, 10) }
    };

    console.log("Payload JSON ->", JSON.stringify(payload));

    try {
      const url = "http://localhost:8080/api/fazendas"; 
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("Resposta HTTP:", response.status, response.statusText);
      const texto = await response.text();
      console.log("Corpo da resposta (texto):", texto);

      if (response.ok) {
        let novaFazenda;
        try { novaFazenda = JSON.parse(texto); } catch(e) { novaFazenda = null; }

        const idSalvo = novaFazenda?.idFazenda ?? novaFazenda?.id ?? null;
        if (idSalvo) localStorage.setItem('FAZENDA_ID', idSalvo);

        alert(`Fazenda cadastrada com sucesso! ${idSalvo ? "ID: " + idSalvo : ""}`);
        form.reset();
      } else {
        alert("Erro ao cadastrar fazenda: " + texto);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Não foi possível conectar ao servidor. Veja console para detalhes.");
    }
  });
});
