// ==========================
//   REGISTRO DE USUÁRIO
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById('register-form');
  const registerButton = document.getElementById('register-btn');

  if (!registerForm || !registerButton) {
    console.warn('Formulário de registro ou botão não encontrados. Registro desabilitado.');
    return;
  }

  registerButton.addEventListener('click', async () => {
    const nome = document.getElementById('reg-nome').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const senha = document.getElementById('reg-senha').value.trim();

    if (!nome || !email || !senha) {
      alert('Preencha nome, e-mail e senha.');
      return;
    }

    // Objeto enviado para o backend
    const usuario = {
      nome,
      email,
      senha,
      tipoUsuario: "ADMIN" // Se quiser mudar depois, me avise
    };

    try {
      const response = await fetch('http://localhost:8080/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });

      if (response.ok) {
        const usuarioCriado = await response.json();
        alert(`Usuário cadastrado com sucesso! ID: ${usuarioCriado.id}`);
        registerForm.reset();
      } else {
        const texto = await response.text();
        alert('Erro no registro: ' + texto);
      }

    } catch (error) {
      console.error('Erro de conexão no registro:', error);
      alert('Não foi possível conectar ao servidor.');
    }
  });
});


// ==========================
//           LOGIN
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById('login-form');

  if (!loginForm) {
    console.error('Formulário de login não encontrado.');
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!email || !senha) {
      alert('Preencha o e-mail e a senha.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (response.ok) {
        const data = await response.json();

        // 🔥 SALVA TUDO PADRONIZADO
        localStorage.setItem('USUARIO_ID', data.id);
        localStorage.setItem('USUARIO_NOME', data.nome);
        localStorage.setItem('USUARIO_PERFIL', data.tipoUsuario); // AGORA É O MESMO QUE AS PÁGINAS LEEM

        alert(`Login realizado com sucesso! Bem-vindo, ${data.nome}`);
        window.location.href = "../html/estoque.html"; // redirecionamento
      } else {
        const erro = await response.json();
        alert(erro.erro || "Email ou senha incorretos.");
      }
    } catch (error) {
      console.error('Erro ao conectar com o servidor:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
});
