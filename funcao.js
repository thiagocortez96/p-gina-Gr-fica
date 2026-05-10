const SEU_NUMERO = "5511999999999"; 
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbwjM-GL2uDMLIHl3E9bYBpseRzzZ_dUFmc8b94sHAw40KUIMtGyJuEro4qne6pDa-Kn/exec"; 
let materiais = [];

async function iniciarSite() {
    try {
        const res = await fetch(URL_PLANILHA);
        const dados = await res.json();
        
        // 1. ORDEM ALFABÉTICA: Ordena os produtos pelo nome antes de salvar
        materiais = dados.sort((a, b) => a.nome.localeCompare(b.nome));

        gerarMenuCategorias();
        renderizarProdutos('todos');
    } catch (e) {
        console.error(e);
        document.getElementById('product-grid').innerHTML = "<p class='font-bold uppercase p-10'>Erro ao carregar catálogo.</p>";
    }
}

/**
 * MENU DE CATEGORIAS (Também em Ordem Alfabética)
 */
function gerarMenuCategorias() {
    const filtrosContainer = document.getElementById('filters');
    if (!filtrosContainer) return;

    // Pega as categorias e coloca em ordem alfabética
    const categorias = [...new Set(materiais.map(item => item.cat))].sort();

    let html = `
        <button data-cat="todos" class="filter-btn active-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">
            ⚡ Todos os Produtos
        </button>
    `;

    categorias.forEach(cat => {
        html += `
            <button data-cat="${cat}" class="filter-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">
                📦 ${cat}
            </button>
        `;
    });

    filtrosContainer.innerHTML = html;

    // Adiciona o evento de clique nos botões do menu
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-btn'));
            btn.classList.add('active-btn');
            renderizarProdutos(btn.getAttribute('data-cat'));
            
            // Se for mobile, fecha o menu após clicar (opcional)
            if (window.innerWidth < 768 && typeof toggleMenu === 'function') toggleMenu();
        });
    });
}

/**
 * RENDERIZAÇÃO DOS CARDS
 */
function renderizarProdutos(categoria = 'todos') {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtrados = categoria === 'todos' ? materiais : materiais.filter(i => i.cat === categoria);

    filtrados.forEach(item => {
        const c = item.config;
        
        grid.innerHTML += `
            <div class="bg-white border-4 border-black p-6 neo-shadow flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-black uppercase bg-black text-white px-2 py-1">${item.cat}</span>
                    <h2 class="text-2xl font-black uppercase mt-4 mb-1 leading-tight">${item.nome}</h2>
                    <p class="text-[10px] mb-4 font-bold text-gray-500 uppercase italic">
                        Material: ${c.materiais[0]} • ${c.acabamentos[0]}
                    </p>
                    
                    <div class="space-y-3 mb-4">
                        <div>
                            <label class="text-[9px] font-black uppercase">Tamanho:</label>
                            <select id="tamanho-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 text-xs font-bold bg-white outline-none focus:bg-[#CCFF00]">
                                ${c.tamanhos.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label class="text-[9px] font-black uppercase">Quantidade:</label>
                            <select id="qtd-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 text-xs font-bold bg-white outline-none focus:bg-[#CCFF00]">
                                ${c.quantidades.map(q => `<option value="${q}">${q} unidades</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 p-3 border-2 border-black bg-[#f3f3f3] mb-4 cursor-pointer" 
                         onclick="const cb = document.getElementById('arte-${item.id}'); cb.checked = !cb.checked; atualizarPreco(${item.id})">
                        <input type="checkbox" id="arte-${item.id}" onchange="atualizarPreco(${item.id})" class="w-5 h-5 border-2 border-black" onclick="event.stopPropagation()">
                        <label class="text-[10px] font-black uppercase cursor-pointer select-none">Criar arte (+ R$ 30)</label>
                    </div>
                </div>

                <div class="flex flex-col gap-4 border-t-4 border-black pt-4">
                    <span id="preco-${item.id}" class="font-black text-3xl tracking-tighter">---</span>
                    <button onclick="enviarWhatsApp(${item.id})" class="w-full bg-[#CCFF00] border-2 border-black py-3 font-black neo-shadow-sm uppercase text-xs hover:bg-black hover:text-[#CCFF00] transition-all">
                        Pedir Orçamento
                    </button>
                </div>
            </div>
        `;
        atualizarPreco(item.id);
    });
}

/**
 * ATUALIZA PREÇO
 */
window.atualizarPreco = function(id) {
    const item = materiais.find(m => m.id == id);
    const precoDisplay = document.getElementById(`preco-${id}`);
    const temArte = document.getElementById(`arte-${id}`).checked;
    
    const tam = document.getElementById(`tamanho-${id}`).value;
    const qtd = document.getElementById(`qtd-${id}`).value;
    const mat = item.config.materiais[0];
    const aca = item.config.acabamentos[0];

    try {
        // Busca na árvore de preços (que já veio calculada com 30% do servidor)
        let valorVenda = item.precos[tam][mat]["4x0"][aca][qtd];
        if (temArte) valorVenda += 30;

        precoDisplay.innerText = `R$ ${valorVenda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    } catch (e) {
        precoDisplay.innerText = "Indisponível";
    }
}

/**
 * WHATSAPP
 */
window.enviarWhatsApp = function(id) {
    const item = materiais.find(m => m.id == id);
    const preco = document.getElementById(`preco-${id}`).innerText;
    const tam = document.getElementById(`tamanho-${id}`).value;
    const qtd = document.getElementById(`qtd-${id}`).value;

    let msg = `Olá! Gostaria de um orçamento:\n📦 *${item.nome}*\n📏 Tamanho: ${tam}\n🔢 Qtd: ${qtd}\n💰 *Total: ${preco}*`;
    window.open(`https://api.whatsapp.com/send?phone=${SEU_NUMERO}&text=${encodeURIComponent(msg)}`);
}

document.addEventListener('DOMContentLoaded', iniciarSite);