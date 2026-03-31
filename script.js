let categoriasData = [];
let expandidoHome = false;
let limiteExpirando = 8; // Controle exclusivo para a categoria Expirando

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando(); // Esta função agora terá o botão "Ver mais"
        renderizarFeedCompleto(); // Restaura os carrosséis originais para o resto do site
        iniciarTimer();
        configurarBusca();
        
        // Ouvinte global para os botões de compra
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

        // Inicializa as setas após um pequeno delay para o DOM carregar
        setTimeout(() => {
            categoriasData.forEach(cat => gerenciarSetas(cat.id));
        }, 1000);

    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

// --- LÓGICA DAS SETAS (IMAGEM 1) ---
function gerenciarSetas(trackId) {
    const track = document.getElementById(`track-${trackId}`);
    if (!track) return;
    
    const container = track.parentElement;
    const btnLeft = container.querySelector('.arrow-left');
    const btnRight = container.querySelector('.arrow-right');

    if (btnLeft) {
        btnLeft.style.display = track.scrollLeft <= 5 ? 'none' : 'flex';
    }
    if (btnRight) {
        const fimDoScroll = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
        btnRight.style.display = fimDoScroll ? 'none' : 'flex';
    }
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
    
    // Atualiza as setas após o scroll
    setTimeout(() => gerenciarSetas(id), 500);
}

// --- CATEGORIA EXPIRANDO COM BOTÃO "VER MAIS" (IMAGEM 2) ---
function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if (!grid || !categoriasData[0]) return;

    const produtos = categoriasData[0].produtos;
    grid.innerHTML = "";

    // Renderiza apenas até o limite definido
    const exibidos = produtos.slice(0, limiteExpirando);
    exibidos.forEach(p => grid.appendChild(criarCardHTML(p)));

    // Gerencia o botão "Ver mais Ofertas" apenas nesta seção
    let btnVerMais = document.getElementById("btn-mais-expirando");
    if (limiteExpirando < produtos.length) {
        if (!btnVerMais) {
            btnVerMais = document.createElement("button");
            btnVerMais.id = "btn-mais-expirando";
            btnVerMais.className = "btn-ver-mais";
            btnVerMais.innerText = "Ver mais Ofertas";
            btnVerMais.onclick = () => {
                limiteExpirando += 8;
                renderizarExpirando();
            };
            grid.parentElement.appendChild(btnVerMais);
        }
    } else if (btnVerMais) {
        btnVerMais.remove();
    }
}

// --- RESTAURAÇÃO DO FEED DE CARROSSÉIS ORIGINAIS ---
function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    if (!feed) return;
    feed.innerHTML = '<h2 class="section-title">Mais ofertas para você</h2>';
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return; // Pula a categoria expirando
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.innerHTML = `
            <h3 style="margin:40px 0 15px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        // Adiciona evento de scroll para as setas sumirem/aparecerem
        track.addEventListener('scroll', () => gerenciarSetas(cat.id));
        
        cat.produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.appendChild(criarCardHTML(p));
            track.appendChild(wrapper);
        });
        feed.appendChild(section);
    });
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

// --- DEMAIS FUNÇÕES ORIGINAIS ---
function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    if (!grid) return;
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        card.innerHTML = `<img src="${c.icone || ''}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
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
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function mostrarModalRedirecionamento(url) {
    const modal = document.getElementById('redirectModal');
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
    inputBusca.addEventListener("input", (e) => {
        const termo = e.target.value.toLowerCase();
        if (termo === "") { renderizarExpirando(); renderizarFeedCompleto(); return; }
        // Lógica de busca simples nos produtos
    });
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

init();
