const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbw80sAk-yNvulvVnaDlHEcKbCYmTIN0zwMuXDzYXCxUWVipViRHvKywFPHjorXedxMs/exec"; 

function addLinha() {
    const html = `
        <div class="grid-precos">
            <div><label>Tamanho</label><input type="text" class="p-tam" placeholder="Ex: A4"></div>
            <div><label>Qtd</label><input type="text" class="p-qtd" placeholder="500"></div>
            <div><label>Custo (R$)</label><input type="number" class="p-custo" placeholder="0.00"></div>
            <button onclick="this.parentElement.remove()" class="bg-black text-white h-[50px] font-bold">X</button>
        </div>`;
    document.getElementById('container-precos').insertAdjacentHTML('beforeend', html);
}

async function salvarProduto() {
    const btn = document.getElementById('btn-salvar');
    const nome = document.getElementById('nome').value;
    const cat = document.getElementById('cat').value;
    const desc = document.getElementById('desc').value;
    const mat = document.getElementById('material').value;
    const aca = document.getElementById('acabamento').value;
    
    if(!nome || !cat) return alert("Nome e Categoria são obrigatórios!");

    btn.innerText = "⏳ PUBLICANDO...";
    btn.disabled = true;

    const linhas = document.querySelectorAll('.grid-precos');
    let tree = {};
    let listaTamanhos = [];
    let listaQtds = [];

    linhas.forEach(linha => {
        const tam = linha.querySelector('.p-tam').value;
        const qtd = linha.querySelector('.p-qtd').value;
        const custo = parseFloat(linha.querySelector('.p-custo').value) || 0;

        if (!tam || !qtd) return;

        // Alimenta as listas de configuração para os filtros do site
        if (!listaTamanhos.includes(tam)) listaTamanhos.push(tam);
        if (!listaQtds.includes(qtd)) listaQtds.push(qtd);

        // Monta a árvore: Preços -> Tamanho -> Material -> Cor (Fixo 4x0) -> Acabamento -> Qtd
        if (!tree[tam]) tree[tam] = {};
        if (!tree[tam][mat]) tree[tam][mat] = { "4x0": {} };
        if (!tree[tam][mat]["4x0"][aca]) tree[tam][mat]["4x0"][aca] = {};

        tree[tam][mat]["4x0"][aca][qtd] = custo;
    });

    const data = {
        id: Date.now(),
        nome: nome,
        cat: cat,
        desc: desc,
        precos: tree,
        config: {
            tamanhos: listaTamanhos,
            materiais: [mat],
            cores: ["4x0"],
            acabamentos: [aca],
            quantidades: listaQtds
        }
    };

    try {
        await fetch(URL_PLANILHA, {
            method: 'POST',
            mode: 'no-cors', // Necessário para Google Scripts
            body: JSON.stringify(data)
        });
        
        alert("✅ PRODUTO SALVO! Ele aparecerá em ordem alfabética no site.");
        location.reload();
    } catch (e) {
        alert("❌ Erro ao conectar com a planilha.");
        console.error(e);
    } finally {
        btn.innerText = "🚀 Publicar Produto";
        btn.disabled = false;
    }
}
