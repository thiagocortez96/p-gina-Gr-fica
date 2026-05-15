const SEU_NUMERO = "5513991967570"; 
const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbw80sAk-yNvulvVnaDlHEcKbCYmTIN0zwMuXDzYXCxUWVipViRHvKywFPHjorXedxMs/exec"; 
let materiais = [];

async function iniciarSite() {
    try {
        const res = await fetch(URL_PLANILHA);
        const dados = await res.json();
        
        // ORDEM ALFABÉTICA
        materiais = dados.sort((a, b) => a.nome.localeCompare(b.nome));

        gerarMenuCategorias();
        renderizarProdutos('todos');
    } catch (e) {
        document.getElementById('product-grid').innerHTML = "Erro ao carregar catálogo.";
    }
}

function gerarMenuCategorias() {
    const filtros = document.getElementById('filters');
    const cats = [...new Set(materiais.map(i => i.cat))].sort();
    
    let html = `<button data-cat="todos" class="filter-btn active-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">⚡ Todos</button>`;
    
    cats.forEach(c => {
        html += `<button data-cat="${c}" class="filter-btn text-left font-black uppercase p-3 border-2 border-black neo-shadow-sm bg-white hover:bg-[#CCFF00] transition-all">📦 ${c}</button>`;
    });
    
    filtros.innerHTML = html;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-btn'));
            btn.classList.add('active-btn');
            renderizarProdutos(btn.dataset.cat);
        };
    });
}

function renderizarProdutos(categoria = 'todos') {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const filtrados = categoria === 'todos' ? materiais : materiais.filter(i => i.cat === categoria);

    filtrados.forEach(item => {
        const c = item.config;
        grid.innerHTML += `
            <div class="bg-white border-4 border-black p-6 neo-shadow flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-black uppercase bg-black text-white px-2 py-1">${item.cat}</span>
                    <h2 class="text-2xl font-black uppercase mt-4 mb-1">${item.nome}</h2>
                    <p class="text-[10px] mb-4 font-bold text-gray-400 italic">${c.materiais[0]} • ${c.acabamentos[0]}</p>
                    
                    <div class="space-y-3 mb-4">
                        <select id="tam-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 font-bold text-xs">
                            ${c.tamanhos.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                        <select id="cor-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 font-bold text-xs">
                            <option value="4x0">Só Frente (4x0)</option>
                            <option value="4x4">Frente e Verso (4x4)</option>
                        </select>
                        <select id="qtd-${item.id}" onchange="atualizarPreco(${item.id})" class="w-full border-2 border-black p-2 font-bold text-xs">
                            ${c.quantidades.map(q => `<option value="${q}">${q} unids</option>`).join('')}
                        </select>
                    </div>

                    <div class="flex items-center gap-3 p-3 border-2 border-black bg-[#f3f3f3] mb-4 cursor-pointer" onclick="const cb=document.getElementById('arte-${item.id}'); cb.checked=!cb.checked; atualizarPreco(${item.id})">
                        <input type="checkbox" id="arte-${item.id}" onchange="atualizarPreco(${item.id})" class="w-5 h-5 border-2 border-black" onclick="event.stopPropagation()">
                        <label class="text-[10px] font-black uppercase cursor-pointer">Criar arte (+R$30)</label>
                    </div>
                </div>

                <div class="border-t-4 border-black pt-4">
                    <span id="preco-${item.id}" class="font-black text-3xl tracking-tighter text-black">---</span>
                    <button onclick="enviarWhatsApp(${item.id})" class="w-full bg-[#CCFF00] border-2 border-black py-3 font-black neo-shadow-sm uppercase text-xs hover:bg-black hover:text-[#CCFF00] transition-all mt-4">Pedir Orçamento</button>
                </div>
            </div>
        `;
        atualizarPreco(item.id);
    });
}

window.atualizarPreco = function(id) {
    const item = materiais.find(m => m.id == id);
    const tam = document.getElementById(`tam-${id}`).value;
    const cor = document.getElementById(`cor-${id}`).value;
    const qtd = document.getElementById(`qtd-${id}`).value;
    const arte = document.getElementById(`arte-${id}`).checked;
    
    try {
        let valor = item.precos[tam][item.config.materiais[0]][cor][item.config.acabamentos[0]][qtd];
        if (arte) valor += 30;
        document.getElementById(`preco-${id}`).innerText = `R$ ${valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    } catch(e) { document.getElementById(`preco-${id}`).innerText = "Indisponível"; }
}

window.enviarWhatsApp = function(id) {
    const item = materiais.find(m => m.id == id);
    const preco = document.getElementById(`preco-${id}`).innerText;
    const tam = document.getElementById(`tam-${id}`).value;
    const cor = document.getElementById(`cor-${id}`).options[document.getElementById(`cor-${id}`).selectedIndex].text;
    const qtd = document.getElementById(`qtd-${id}`).value;
    
    let msg = `Olá! Quero um orçamento:\n📦 *${item.nome}*\n📏 Tam: ${tam}\n🎨 Cor: ${cor}\n🔢 Qtd: ${qtd}\n💰 *Total: ${preco}*`;
    window.open(`https://api.whatsapp.com/send?phone=${SEU_NUMERO}&text=${encodeURIComponent(msg)}`);
}

document.addEventListener('DOMContentLoaded', iniciarSite);
