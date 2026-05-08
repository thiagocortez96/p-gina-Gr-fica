/**
 * CONFIGURAÇÕES GERAIS
 */
const SEU_NUMERO = "5513991967570";
const VALOR_ARTE = 30;
const MARGEM_LUCRO = 1.3; // Multiplicador de 30% sobre o custo
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbzo4SesUTXD9a2wqfNpsPQZGgtrEjZvfeVtq1Ps3XRmmc7g5SEwMZkqx4ni2-rZqAdZ/exec";

let materiais = [];

/**
 * LÓGICA DO MENU HAMBURGUER (MOBILE)
 */
window.toggleMenu = function() {
    const filters = document.getElementById('filters');
    if (!filters) return;
    
    // Alterna visibilidade no mobile usando a classe que definimos no CSS do HTML
    filters.classList.toggle('hidden');
    filters.classList.toggle('show-mobile');
};

/**
 * GERA O MENU DE CATEGORIAS DINAMICAMENTE
 */
function gerarMenuCategorias() {
    const filtrosContainer = document.getElementById('filters');
    if (!filtrosContainer) return;

    // Obtém categorias únicas da planilha
    const categoriasUnicas = [...new Set(materiais.map(item => item.cat))];

    let htmlBotoes = `
        <button data-cat="todos" class="filter-btn active-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">
            ⚡ Todos os Produtos
        </button>
    `;

    categoriasUnicas.forEach(cat => {
        htmlBotoes += `
            <button data-cat="${cat}" class="filter-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">
                📦 ${cat}
            </button>
        `;
    });

    filtrosContainer.innerHTML = htmlBotoes;

    // Eventos de clique nos botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-btn'));
            btn.classList.add('active-btn');
            
            renderizarProdutos(btn.getAttribute('data-cat'));

            // Fecha menu se estiver no mobile
            if (window.innerWidth < 768) {
                toggleMenu();
            }
        });
    });
}

/**
 * ATUALIZA O PREÇO EM TEMPO REAL
 */
window.atualizarPreco = function(id) {
    const item = materiais.find(m => m.id == id);
    if (!item) return;

    const precoDisplay = document.getElementById(`preco-${id}`);
    const arteCheckbox = document.getElementById(`arte-${id}`);
    const precisaArte = arteCheckbox ? arteCheckbox.checked : false;

    // Parâmetros fixos do CMS
    const tam = item.config.tamanhos[0];
    const mat = item.config.materiais[0];
    const aca = item.config.acabamentos[0];
    
    // Inputs do usuário
    const corSelecionada = document.getElementById(`cores-${id}`).value; 
    const qtd = document.getElementById(`qtd-${id}`).value;

    try {
        const precoCusto = item.precos[tam][mat][corSelecionada][aca][qtd];
        
        // VALIDAÇÃO: Se o valor for zero, vazio ou inexistente
        if (!precoCusto || precoCusto === 0 || precoCusto === "0") {
            precoDisplay.innerText = "Indisponível";
            precoDisplay.classList.add('text-red-500');
            return;
        }

        let valorVenda = precoCusto * MARGEM_LUCRO;
        if (precisaArte) valorVenda += VALOR_ARTE;
        
        precoDisplay.innerText = `R$ ${valorVenda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        precoDisplay.classList.remove('text-red-500');
        
    } catch (e) {
        precoDisplay.innerText = "Indisponível";
        precoDisplay.classList.add('text-red-500');
    }
}

/**
 * ENVIA O PEDIDO PARA WHATSAPP
 */
window.enviarWhatsApp = function(id) {
    const item = materiais.find(m => m.id == id);
    const arteCheckbox = document.getElementById(`arte-${id}`);
    const precisaArte = arteCheckbox ? arteCheckbox.checked : false;
    const precoTexto = document.getElementById(`preco-${id}`).innerText;

    if (precoTexto === "Indisponível") {
        return alert("Esta combinação de produto não está disponível no momento.");
    }

    const corTexto = document.getElementById(`cores-${id}`).options[document.getElementById(`cores-${id}`).selectedIndex].text;
    const qtd = document.getElementById(`qtd-${id}`).value;

    let mensagem = `Olá Thiago!\n\nGostaria de fechar este pedido:\n📦 *Produto:* ${item.nome}`;
    mensagem += `\n🎨 *Cores:* ${corTexto}`;
    mensagem += `\n🔢 *Quantidade:* ${qtd}`;
    mensagem += `\n✨ *Especificações:* ${item.config.tamanhos[0]} | ${item.config.materiais[0]}`;
    mensagem += `\n🎨 *Precisa de Arte:* ${precisaArte ? 'Sim (+ R$ 30,00)' : 'Não (Já tenho)'}`;
    mensagem += `\n\n💰 *VALOR TOTAL:* ${precoTexto}`;

    window.open(`https://api.whatsapp.com/send?phone=${SEU_NUMERO}&text=${encodeURIComponent(mensagem)}`, '_blank');
}

/**
 * RENDERIZAÇÃO DOS CARDS DE PRODUTO
 */
function renderizarProdutos(categoria = 'todos') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtrados = categoria === 'todos' ? materiais : materiais.filter(i => i.cat === categoria);

    filtrados.forEach(item => {
        const c = item.config;
        let precoInicialFormatado = "---";

        // Tenta calcular o primeiro preço da lista ao carregar
        try {
            const custoBase = item.precos[c.tamanhos[0]][c.materiais[0]][c.cores[0]][c.acabamentos[0]][c.quantidades[0]];
            
            if (!custoBase || custoBase === 0 || custoBase === "0") {
                precoInicialFormatado = "Indisponível";
            } else {
                const vendaBase = custoBase * MARGEM_LUCRO;
                precoInicialFormatado = `R$ ${vendaBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
            }
        } catch(e) { 
            precoInicialFormatado = "Indisponível"; 
        }

        const controlesSimplificados = `
            <div class="space-y-3 mb-4">
                <div class="grid grid-cols-1 gap-1">
                    <label class="text-[9px] font-black uppercase">Impressão:</label>
                    <select id="cores-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 text-xs font-bold bg-white outline-none focus:bg-[#CCFF00]">
                        ${c.cores.map(cor => `
                            <option value="${cor}">${cor === '4x0' ? 'Só Frente' : 'Frente e Verso'}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="grid grid-cols-1 gap-1">
                    <label class="text-[9px] font-black uppercase">Quantidade:</label>
                    <select id="qtd-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 text-xs font-bold bg-white outline-none focus:bg-[#CCFF00]">
                        ${c.quantidades.map(q => `<option value="${q}">${q} unidades</option>`).join('')}
                    </select>
                </div>
            </div>
        `;

        const opcaoArteHtml = `
            <div class="flex items-center gap-3 p-3 border-2 border-black bg-[#f3f3f3] mb-4 active:scale-95 transition-transform cursor-pointer" 
                 onclick="const cb = document.getElementById('arte-${item.id}'); cb.checked = !cb.checked; atualizarPreco(${item.id})">
                <input type="checkbox" id="arte-${item.id}" class="w-5 h-5 border-2 border-black appearance-none checked:bg-black pointer-events-none transition-colors">
                <label class="text-[10px] font-black uppercase select-none cursor-pointer">Criar arte (+ R$ 30)</label>
            </div>
        `;

        grid.innerHTML += `
            <div class="bg-white border-4 border-black p-6 neo-shadow flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-black uppercase bg-black text-white px-2 py-1 tracking-widest">${item.cat}</span>
                    <h2 class="text-2xl font-black uppercase mt-4 mb-1 leading-tight">${item.nome}</h2>
                    <p class="text-[10px] mb-4 font-bold text-gray-500 uppercase italic">
                        ${c.tamanhos[0]} • ${c.materiais[0]} • ${c.acabamentos[0]}
                    </p>
                    <p class="text-sm mb-4 font-medium text-gray-700">${item.desc}</p>
                    
                    ${controlesSimplificados}
                    ${opcaoArteHtml}
                </div>
                <div class="flex flex-col gap-4 border-t-4 border-black pt-4">
                    <span id="preco-${item.id}" class="font-black text-3xl tracking-tighter ${precoInicialFormatado === 'Indisponível' ? 'text-red-500' : ''}">${precoInicialFormatado}</span>
                    <button onclick="enviarWhatsApp(${item.id})" class="w-full bg-[#CCFF00] border-2 border-black py-3 font-black neo-shadow-sm uppercase text-xs hover:bg-black hover:text-[#CCFF00] transition-all">
                        Pedir Orçamento
                    </button>
                </div>
            </div>
        `;
    });
}

/**
 * INICIALIZAÇÃO
 */
async function iniciarSite() {
    try {
        const resposta = await fetch(URL_PLANILHA);
        materiais = await resposta.json();
        
        gerarMenuCategorias();
        renderizarProdutos('todos');
    } catch (erro) {
        console.error("Erro ao carregar dados do catálogo:", erro);
    }
}

document.addEventListener('DOMContentLoaded', iniciarSite);