let categoriasData = [];
let expandidoHome = false;
let limiteExpirando = 8; // Controle de paginação para Ofertas Expirando

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        iniciarTimer();
        configurarBusca();
        
        // Redirecionamento compatível com Android/iOS
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

        // Força verificação de setas em todos os dispositivos após carregar
        setTimeout(() => {
            categoriasData.forEach(cat => gerenciarSetas(cat.id));
        }, 1000);

    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

// --- LÓGICA DAS SETAS (ATIVAS EM TODOS OS SISTEMAS) ---
function gerenciarSetas(trackId) {
    const track = document.getElementById(`track-${trackId}`);
    if (!track) return;
    
    const container = track.parentElement;
    const btnLeft = container.querySelector('.arrow-left');
    const btnRight = container.querySelector('.arrow-right');

    // Em dispositivos touch, as setas ajudam na navegação visual
    if (btnLeft) {
        btnLeft.style.display = track.scrollLeft <= 10 ? 'none' : 'flex';
    }
    if (btnRight) {
        const fimDoScroll = track.scrollLeft + track.clientWidth >= track.scrollWidth - 15;
        btnRight.style.display = fimDoScroll ? 'none' : 'flex';
    }
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
    
    // Atualiza visibilidade após o movimento
    setTimeout(() => gerenciarSetas(id), 500);
}

// --- CATEGORIA EXPIRANDO (CORREÇÃO MOBILE PARA O BOTÃO) ---
function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if (!grid || !categoriasData[0]) return;

    const produtos = categoriasData[0].produtos;
    grid.innerHTML = "";

    const exibidos = produtos.slice(0, limiteExpirando);
    exibidos.forEach(p => grid.appendChild(criarCardHTML(p)));

    // Garante que o botão apareça em qualquer sistema/tamanho de tela
    let btnVerMais = document.getElementById("btn-mais-expirando");
    
    if (limiteExpirando < produtos.length) {
        if (!btnVerMais) {
            btnVerMais = document.createElement("button");
            btnVerMais.id = "btn-mais-expirando";
            btnVerMais.className = "btn-ver-mais";
            btnVerMais.style.display = "block"; // Força exibição
            btnVerMais.innerText = "Ver mais Ofertas";
            btnVerMais.onclick = () => {
                limiteExpirando += 8;
                renderizarExpirando();
            };
            grid.after(btnVerMais);
        }
    } else if (btnVerMais) {
        btnVerMais.remove();
    }
}

// --- FEED COMPLETO (RESTAURAÇÃO TOTAL DE DADOS) ---
function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    if (!feed) return;
    feed.innerHTML = '<h2 class="section-title">Mais ofertas para você</h2>';
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return; 
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.className = "category-section";
        section.innerHTML = `
            <h3 class="category-name-title">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        track.addEventListener('scroll', () => gerenciarSetas(cat.id), { passive: true });
        
        cat.produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.appendChild(criarCardHTML(p));
            track.appendChild(wrapper);
        });
        
        feed.appendChild(section);
        // Verifica setas inicialmente para cada categoria
        setTimeout(() => gerenciarSetas(cat.id), 100);
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

// --- FUNÇÕES DE INTERFACE E SUPORTE ---
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function configurarBusca() {
    const inputBusca = document.getElementById("input-busca");
    if (!inputBusca) return;
    inputBusca.addEventListener("input", (e) => {
        const termo = normalizarTexto(e.target.value);
        const feed = document.getElementById("feed-infinito");
        const hero = document.querySelector(".flash-deals-hero");
        if (termo === "") {
            if(hero) hero.style.display = "block";
            renderizarExpirando();
            renderizarFeedCompleto();
            return;
        }
        if(hero) hero.style.display = "none";
        feed.innerHTML = `<div class="flash-grid" id="search-grid"></div>`;
        const grid = document.getElementById("search-grid");
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                if (normalizarTexto(p.nome).includes(termo)) grid.appendChild(criarCardHTML(p));
            });
        });
    });
}

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
    if (btn) btn.innerText = expandidoHome ? "Ver menos" : "Ver mais";
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    if(!nav) return;
    nav.innerHTML = "";
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
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
        const el = document.getElementById("timer");
        if(el) el.innerText = `${h}:${m}:${s}`;
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

init();
