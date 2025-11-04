document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('cadastro-fazenda-form');
  if (!form) {
    console.error("❌ Form 'cadastro-fazenda-form' não encontrado.");
    return;
  }

  const usuarioId = localStorage.getItem('USUARIO_ID');
  console.log("🧩 Usuário autenticado:", usuarioId);

  if (!usuarioId) {
    alert("Usuário não autenticado. Faça login novamente.");
    window.location.href = "../html/login.html";
    return;
  }

  function coletarDados() {
    const nome = document.getElementById('nome_fazenda')?.value?.trim() || "";
    const localizacao = document.getElementById('localizacao_fazenda')?.value?.trim() || "";
    const areaStr = document.getElementById('area_fazenda')?.value?.trim();

    // ✅ Converte corretamente o número (ou deixa null se vazio)
    const areaHectares = areaStr ? parseFloat(areaStr.replace(",", ".")) : null;

    return { nome, localizacao, areaHectares };
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const dados = coletarDados();

    if (!dados.nome) {
      alert("Informe o nome da fazenda.");
      return;
    }

    const payload = {
      nome: dados.nome,
      localizacao: dados.localizacao || null,
      areaHectares: dados.areaHectares,
      usuario: { idUsuario: parseInt(usuarioId, 10) }
    };

    console.log("📦 Enviando payload JSON:", JSON.stringify(payload));

    try {
      const response = await fetch("http://localhost:8080/api/fazendas", {
        method: "POST",
        headers: {
          "Accept": "application/json",              // ✅ adiciona Accept
          "Content-Type": "application/json;" // ✅ garante charset UTF-8
        },
        body: JSON.stringify(payload)
      });

      console.log("🌐 Resposta HTTP:", response.status, response.statusText);
      const texto = await response.text();
      console.log("🧾 Corpo da resposta:", texto);

      if (response.ok) {
        let novaFazenda = null;
        try { novaFazenda = JSON.parse(texto); } catch {}

        const idSalvo = novaFazenda?.idFazenda || novaFazenda?.id;
        if (idSalvo) localStorage.setItem('FAZENDA_ID', idSalvo);

        alert(`✅ Fazenda cadastrada com sucesso! ${idSalvo ? "ID: " + idSalvo : ""}`);
        form.reset();
      } else {
        alert("❌ Erro ao cadastrar fazenda: " + texto);
      }
    } catch (error) {
      console.error("💥 Erro na requisição:", error);
      alert("Não foi possível conectar ao servidor.");
    }
  });
});
