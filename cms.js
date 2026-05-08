 const URL_PLANILHA = "https://script.google.com/macros/s/AKfycbzo4SesUTXD9a2wqfNpsPQZGgtrEjZvfeVtq1Ps3XRmmc7g5SEwMZkqx4ni2-rZqAdZ/exec";

        function addLinha() {
            const html = `
                <div class="grid-precos">
                    <div><label>Qtd</label><input type="text" class="p-qtd"></div>
                    <div><label>Preço 4x0 (R$)</label><input type="number" class="p-4x0"></div>
                    <div><label>Preço 4x4 (R$)</label><input type="number" class="p-4x4"></div>
                </div>`;
            document.getElementById('container-precos').insertAdjacentHTML('beforeend', html);
        }

        async function salvar() {
            const btn = document.getElementById('btn-salvar');
            btn.innerText = "PROCESSANDO...";
            btn.disabled = true;

            const nome = document.getElementById('nome').value;
            const cat = document.getElementById('cat').value.toLowerCase();
            const desc = document.getElementById('desc').value;
            const tam = document.getElementById('tamanho').value;
            const mat = document.getElementById('material').value;
            const aca = document.getElementById('acabamento').value;

            // Coleta preços
            const qtds = Array.from(document.querySelectorAll('.p-qtd')).map(i => i.value);
            const p0 = Array.from(document.querySelectorAll('.p-4x0')).map(i => i.value);
            const p4 = Array.from(document.querySelectorAll('.p-4x4')).map(i => i.value);

            const tree = {};
            tree[tam] = {};
            tree[tam][mat] = { "4x0": {}, "4x4": {} };

            qtds.forEach((q, i) => {
                if(q) {
                    tree[tam][mat]["4x0"][aca] = tree[tam][mat]["4x0"][aca] || {};
                    tree[tam][mat]["4x0"][aca][q] = parseFloat(p0[i]);
                    
                    tree[tam][mat]["4x4"][aca] = tree[tam][mat]["4x4"][aca] || {};
                    tree[tam][mat]["4x4"][aca][q] = parseFloat(p4[i]);
                }
            });

            const data = {
                id: Date.now(),
                cat: cat,
                nome: nome,
                desc: desc,
                impresso: true,
                precos: tree,
                config: {
                    tamanhos: [tam],
                    materiais: [mat],
                    cores: ["4x0", "4x4"],
                    acabamentos: [aca],
                    quantidades: qtds.filter(q => q !== "")
                }
            };

            try {
                await fetch(URL_PLANILHA, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
                alert("Produto Publicado!");
                location.reload();
            } catch(e) {
                alert("Erro ao salvar!");
                btn.disabled = false;
                btn.innerText = "Publicar Produto";
            }
        }