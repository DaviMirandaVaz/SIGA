document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById('cadastro-produto-form');
  if (!form) {
    console.error("Form 'cadastro-produto-form' não encontrado.");
    return;
  }

  const tipoProdutoSelect = document.getElementById('tipo_produto');
  const camposTipo = document.querySelectorAll('.campos-tipo');
  const fazendaSelect = document.getElementById('fazenda_select');
  const usuarioId = localStorage.getItem('USUARIO_ID');

  // esconde blocos inicialmente
  camposTipo.forEach(c => c.style.display = 'none');

  // exibir bloco conforme seleção
  tipoProdutoSelect.addEventListener('change', () => {
    camposTipo.forEach(c => c.style.display = 'none');
    const tipo = tipoProdutoSelect.value;
    if (tipo) {
      const bloco = document.querySelector(`.${tipo}`);
      if (bloco) bloco.style.display = 'block';
    }
  });

  // carrega fazendas do usuário
  async function carregarFazendas() {
    try {
        const usuarioId = localStorage.getItem("USUARIO_ID");

        if (!usuarioId) {
            console.warn("⚠️ USUARIO_ID não encontrado no localStorage.");
            return;
        }

        // Pegando o select CORRETO pelo ID correto
        const fazendaSelect = document.getElementById("fazenda_select");

        // Se não existir, evita erro silencioso
        if (!fazendaSelect) {
            console.error("❌ ERRO: Select #fazenda_select NÃO encontrado no HTML.");
            return;
        }

        const resp = await fetch(`http://localhost:8080/api/usuario-fazenda/porUsuario/${usuarioId}`);

        if (!resp.ok) {
            throw new Error(`Erro ao buscar vínculos: ${resp.status}`);
        }

        const vinculos = await resp.json();

        // Limpa o select mantendo o placeholder
        fazendaSelect.innerHTML = `<option value="" disabled selected>Selecione uma fazenda</option>`;

        // Preenche as fazendas corretas
        vinculos.forEach(v => {
            if (v.fazenda) {
                const opt = document.createElement("option");
                opt.value = v.fazenda.idFazenda;
                opt.textContent = `${v.fazenda.nome} - ${v.fazenda.localizacao || 'Local não informado'}`;
                fazendaSelect.appendChild(opt);
            }
        });

    } catch (e) {
        console.error('❌ Erro ao carregar fazendas:', e);
        alert('Erro ao carregar fazendas vinculadas ao usuário.');
    }
}

  await carregarFazendas();

  // preencher datas com hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(i => { if (!i.value) i.value = hoje; });

  // mapeamento seguro para enums / valores esperados pelo backend
  function mapearTipoIntermedio(valor) {
    if (!valor) return null;
    const v = valor.toString().trim().toUpperCase();
    // Ajustes comuns: se o front usa "PRODUÇÃO" e backend espera "PLANTAÇÃO"
    if (v === 'PRODUÇÃO' || v === 'PRODUCAO') return 'PLANTAÇÃO';
    // se já estiver ANIMAL ou LAVOURA ou PLANTAÇÃO, retorna como está
    if (['ANIMAL','LAVOURA','PLANTAÇÃO','PLANTACAO'].includes(v)) {
      if (v === 'PLANTACAO') return 'PLANTAÇÃO';
      return v;
    }
    return v;
  }

  // evento submit
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const tipoProduto = tipoProdutoSelect.value;
    if (!tipoProduto) {
      alert('Selecione o tipo de produto.');
      return;
    }

    const fazendaId = fazendaSelect.value;
    if (!fazendaId) {
      alert('Selecione uma fazenda.');
      return;
    }

    // nome comum para todos os tipos (você usa este id no HTML)
    const nomeProduto = document.getElementById('nome_produto').value.trim();

    let dados = {};
    let url = '';

    if (tipoProduto === 'entrada') {
  let tipoSelecionado = document.getElementById('tipo_entrada').value || 'OUTRO';

  // 🔹 Verifica se o tipo é aceito pelo backend
  const tiposValidos = ['ADUBO', 'SEMENTE', 'RAÇÃO', 'MEDICAMENTO', 'OUTRO'];
  if (!tiposValidos.includes(tipoSelecionado)) {
    tipoSelecionado = 'OUTRO';
  }

  dados = {
    nomeProduto,
    tipo: tipoSelecionado,
    quantidade: (parseFloat(document.getElementById('quantidade_entrada').value) || 0).toString(),
    unidadeMedida: document.getElementById('unidade_medida_entrada').value || null,
    valorUnitario: (parseFloat(document.getElementById('valor_unitario').value) || 0).toString(),
    dataCompra: document.getElementById('data_compra').value || null,
    fazenda: { idFazenda: parseInt(fazendaId, 10) }
  };

  url = 'http://localhost:8080/api/produtosEntrada';

    } else if (tipoProduto === 'intermedio') {
      // mapear tipo que o backend espera
      const tipoInter = mapearTipoIntermedio(document.getElementById('tipo_intermedio').value);
      dados = {
        nomeProduto,
        tipo: tipoInter || null,
        quantidade: (parseFloat(document.getElementById('quantidade_intermedio').value) || 0).toString(),
        valorEstimado: (parseFloat(document.getElementById('valor_estimado').value) || 0).toString(),
        dataInicio: document.getElementById('data_inicio').value || null,
        status: (document.getElementById('status_intermedio') ? document.getElementById('status_intermedio').value : 'ATIVO'),
        fazenda: { idFazenda: parseInt(fazendaId, 10) }
      };
      url = 'http://localhost:8080/api/produtosIntermedios';

    } else if (tipoProduto === 'saida') {
      dados = {
        nomeProduto,
        quantidade: (parseFloat(document.getElementById('quantidade_saida').value) || 0).toString(),
        unidadeMedida: document.getElementById('unidade_medida_saida').value || null,
        valorVenda: (parseFloat(document.getElementById('valor_venda').value) || 0).toString(),
        dataVenda: document.getElementById('data_venda').value || null,
        fazenda: { idFazenda: parseInt(fazendaId, 10) }
      };
      url = 'http://localhost:8080/api/produtosSaida';
    } else {
      alert('Tipo de produto inválido.');
      return;
    }

    // logs para debug
    console.log('Enviando para', url);
    console.log('Payload', dados);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const texto = await resp.text();
      console.log('Resposta servidor:', resp.status, texto);

      if (resp.ok) {
        alert('Produto cadastrado com sucesso!');
        form.reset();
        camposTipo.forEach(c => c.style.display = 'none');
        // reaplica data hoje nos campos de data resetados
        document.querySelectorAll('input[type="date"]').forEach(i => i.value = hoje);
      } else {
        // mostrar mensagem de erro (JSON ou texto)
        let mensagem = texto;
        try {
          const j = JSON.parse(texto);
          // tenta mostrar campo message/erro/timestamp
          mensagem = j.message || j.erro || JSON.stringify(j);
        } catch (e) { /* não JSON */ }
        alert('Erro ao cadastrar o produto:\n' + mensagem);
      }
    } catch (err) {
      console.error('Erro fetch:', err);
      alert('Não foi possível conectar ao servidor. Veja console para detalhes.');
    }
  });
});
