// auth.js — controle global de sessão e navbar
document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = localStorage.getItem("USUARIO_ID");
  const usuarioNome = localStorage.getItem("USUARIO_NOME");
  const usuarioPerfil = localStorage.getItem("USUARIO_PERFIL");

  // Se a página exigir login e não houver usuário logado → redireciona
  const precisaLogin = document.body.getAttribute("data-requer-login") === "true";
  if (precisaLogin && !usuarioId) {
    alert("Você precisa fazer login primeiro.");
    window.location.href = "login.html";
    return;
  }

  // Se a página exigir que seja DONO → verifica perfil
  const requerDono = document.body.getAttribute("data-requer-dono") === "true";
  if (requerDono && usuarioPerfil !== "ADMIN") {
    alert("Você não tem permissão para acessar esta página.");
    window.location.href = "../html/estoque.html";  // 🔥 redirecionamento ajustado
    return;
  }


  // Cria a navbar dinâmica
  const menuContainer = document.getElementById("usuario-menu");
  if (!menuContainer) return;

  menuContainer.innerHTML = ""; // limpa antes de montar

  // --- Caso o usuário esteja logado ---
  if (usuarioId) {
    menuContainer.classList.add("dropdown");

    const btnUsuario = document.createElement("button");
    btnUsuario.classList.add("btn", "btn-outline-success", "dropdown-toggle");
    btnUsuario.setAttribute("type", "button");
    btnUsuario.setAttribute("data-bs-toggle", "dropdown");
    btnUsuario.setAttribute("aria-expanded", "false");
    btnUsuario.textContent = usuarioNome || "Usuário";

    const dropdownMenu = document.createElement("ul");
    dropdownMenu.classList.add("dropdown-menu", "dropdown-menu-end");

    // --- Item: Ir para Main ---
    const mainItem = document.createElement("li");
    const mainLink = document.createElement("a");
    mainLink.classList.add("dropdown-item");
    mainLink.href = "../html/main.html";
    mainLink.innerHTML = '<i class="bi bi-house-door-fill me-2"></i> Ir para Main';
    mainItem.appendChild(mainLink);
    dropdownMenu.appendChild(mainItem);

    // --- Logout ---
    const logoutItem = document.createElement("li");
    const logoutLink = document.createElement("a");
    logoutLink.classList.add("dropdown-item", "text-danger");
    logoutLink.href = "#";
    logoutLink.textContent = "Sair";
    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("USUARIO_ID");
      localStorage.removeItem("USUARIO_NOME");
      localStorage.removeItem("USUARIO_PERFIL");
      alert("Você saiu da conta.");
      window.location.href = "../html/home.html";
    });

    logoutItem.appendChild(logoutLink);
    dropdownMenu.appendChild(logoutItem);

    menuContainer.appendChild(btnUsuario);
    menuContainer.appendChild(dropdownMenu);
  }
  // --- Caso não esteja logado ---
  else {
    const loginButton = document.createElement("a");
    loginButton.href = "../html/login.html";
    loginButton.classList.add("btn", "btn-success");
    loginButton.textContent = "Entrar";
    menuContainer.appendChild(loginButton);
  }
});

const usuarioPerfil = localStorage.getItem("USUARIO_PERFIL"); // DONO ou basico
const elementosSomenteDono = document.querySelectorAll("[data-so-dono='true']");

if (usuarioPerfil !== "ADMIN") {
  elementosSomenteDono.forEach(el => {
    el.style.display = "none";
  });
}
