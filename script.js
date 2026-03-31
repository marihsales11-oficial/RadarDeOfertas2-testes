let categoriasData = [];
let expandidoHome = false;
let produtosExibidosCount = 8; // Define quantos produtos aparecem por vez no feed principal

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedInical(); // Inicializa o feed com o botão "Ver mais"
        iniciarTimer();
        configurarBusca();
        
        // Ouvinte para cliques nos botões de compra
        document.body.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn-comprar');
            if (btn) {
                e.preventDefault();
                const urlAfiliado = btn.getAttribute('data-url');
                if (urlAfiliado && urlAfiliado !== "#") {
                    mostrarModalRedirecionamento(urlAfiliado);
                }
            }
        });

        // Inicializa a visibilidade das setas nos carrosséis após o carregamento
        setTimeout(() => {
            document.querySelectorAll('.category-carousel-track').forEach(track => {
                const id = track.id.replace('track-', '');
                gerenciarSetas(id);
            });
        }, 800);

    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

// --- LÓGICA DAS SETAS DO CARROSSEL ---
function gerenciarSetas(trackId) {
    const track = document.getElementById(`track-${trackId}`);
    if (!track) return;
    
    const btnLeft = track.parentElement.querySelector('.arrow-left');
    const btnRight = track.parentElement.querySelector('.arrow-right');

    if (btnLeft) {
        // Esconde a seta esquerda se o scroll for quase zero
        btnLeft.style.display = track.scrollLeft <= 5 ? 'none' : 'flex';
    }

    if (btnRight) {
        // Esconde a seta direita se o scroll chegar ao final do conteúdo
        const fimDoScroll = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
        btnRight.style.display = fimDoScroll ? 'none' : 'flex';
    }
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
    
    // Atualiza as setas após o movimento suave
    setTimeout(() => gerenciarSetas(id), 500);
}

// --- LÓGICA DO FEED "VER MAIS" ---
function renderizarFeedInical() {
    const feed = document.getElementById("feed-infinito");
    if (!feed) return;
    feed.innerHTML = '<h2 class="section-title">Mais ofertas para você</h2>';
    
    // Agrupa todos os produtos de todas as categorias (exceto a categoria "expirando")
    let todosProdutos = [];
    categoriasData.forEach((cat, index) => {
        if (cat.id !== "expirando") {
            cat.produtos.forEach(p => todosProdutos.push(p));
        }
    });

    const grid = document.createElement("div");
    grid.className = "flash-grid";
    grid.id = "grid-principal-feed";
    feed.appendChild(grid);

    exibirProdutosPaginados(todosProdutos);
}

function exibirProdutosPaginados(lista) {
    const grid = document.getElementById("grid-principal-feed");
    const containerFeed = document.getElementById("feed-infinito");
    
    const btnAntigo = document.getElementById("btn-ver-mais-feed");
    if (btnAntigo) btnAntigo.remove();

    const fragmento = document.createDocumentFragment();
    const limite = Math.min(produtosExibidosCount, lista.length);

    grid.innerHTML = ""; 
    for (let i = 0; i < limite; i++) {
        fragmento.appendChild(criarCardHTML(lista[i]));
    }
    grid.appendChild(fragmento);

    // Cria o botão se houver mais itens para mostrar
    if (produtosExibidosCount < lista.length) {
        const btn = document.createElement("button");
        btn.id = "btn-ver-mais-feed";
        btn.className = "btn-ver-mais";
        btn.innerText = "Ver mais Ofertas";
        btn.onclick = () => {
            produtosExibidosCount += 8; // Aumenta o limite de 8 em 8
            exibirProdutosPaginados(lista);
        };
        containerFeed.appendChild(btn);
    }
}

function criarCardHTML(p) {
    const divCard = document.createElement("div");
    divCard.className = "card";
    const linkDestino = p.link || "https://www.mercadolivre.com.br";
    divCard.innerHTML = `
        <img src="${p.imagem}" loading="lazy" alt="${p.nome}">
        <div class="card-info">
            <h4>${p.nome}</h4>
            <div class="preco">R$ ${p.preco}</div>
            <div style="color:#00a650; font-size:12px; font-weight:bold; margin-bottom:15px">Frete grátis</div>
            <button class="btn-comprar" data-url="${linkDestino}">Comprar agora</button>
        </div>
    `;
    return divCard;
}

// --- FUNÇÕES DE INTERFACE ---
function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    if (!grid) return;
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        const iconUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${iconUrl}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if (!grid) return;
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            grid.appendChild(criarCardHTML(p));
        });
    }
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    const btn = document.getElementById("btn-expandir-home");
    if (btn) btn.innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); 
        end.setHours(23, 59, 59);
        const diff = end - now;
        if (diff <= 0) return;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const timerEl = document.getElementById("timer");
        if(timerEl) timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function mostrarModalRedirecionamento(url) {
    const modal = document.getElementById('redirectModal');
    if (!modal) return;
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        window.location.href = url;
        setTimeout(() => {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
        }, 500);
    }, 2500); 
}

function configurarBusca() {
    const inputBusca = document.getElementById("input-busca");
    if (inputBusca) {
        inputBusca.addEventListener("input", (e) => {
            const termo = e.target.value.toLowerCase();
            if (termo === "") { renderizarFeedInical(); return; }
            const resultados = [];
            categoriasData.forEach(cat => {
                cat.produtos.forEach(p => {
                    if (p.nome.toLowerCase().includes(termo)) resultados.push(p);
                });
            });
            produtosExibidosCount = 8;
            exibirProdutosPaginados(resultados);
        });
    }
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    if(!nav) return;
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

init();
