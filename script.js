let categoriasData = [];
let expandidoHome = false;

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
        
        // Ouvinte global para capturar cliques nos botões 'Comprar agora'
        document.body.addEventListener('click', function(e) {
            // Verifica se o clique foi no botão ou em algum ícone dentro dele
            const btn = e.target.closest('.btn-comprar');
            
            if (btn) {
                e.preventDefault();
                const urlAfiliado = btn.getAttribute('data-url');
                
                if (urlAfiliado && urlAfiliado !== "#") {
                    mostrarModalRedirecionamento(urlAfiliado);
                } else {
                    console.warn("Link de afiliado não configurado para este produto.");
                }
            }
        });

    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function configurarBusca() {
    const inputBusca = document.getElementById("input-busca");
    if (!inputBusca) return;
    
    inputBusca.addEventListener("input", (e) => {
        const termo = normalizarTexto(e.target.value);
        filtrarConteudo(termo);
    });
}

function filtrarConteudo(termo) {
    const feed = document.getElementById("feed-infinito");
    const heroSection = document.querySelector(".flash-deals-hero");
    const categoriasPopulares = document.querySelector(".home-categories");

    if (termo === "") {
        if (heroSection) heroSection.style.display = "block";
        if (categoriasPopulares) categoriasPopulares.style.display = "block";
        renderizarExpirando();
        renderizarFeedCompleto();
        return;
    }

    if (heroSection) heroSection.style.display = "none";
    if (categoriasPopulares) categoriasPopulares.style.display = "none";
    
    feed.innerHTML = `<h2 class="section-title">Resultados da busca</h2><div class="flash-grid" id="search-results-grid"></div>`;
    
    const resultsGrid = document.getElementById("search-results-grid");
    let encontrouAlgo = false;

    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            if (normalizarTexto(p.nome).includes(termo)) {
                resultsGrid.appendChild(criarCardHTML(p));
                encontrouAlgo = true;
            }
        });
    });

    if (!encontrouAlgo) {
        resultsGrid.innerHTML = "<p style='grid-column: 1/-1; padding: 20px; color: #666;'>Nenhum produto encontrado.</p>";
    }
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    if (!feed) return;
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        
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
        cat.produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.appendChild(criarCardHTML(p));
            track.appendChild(wrapper);
        });
        feed.appendChild(section);
    });
}

/**
 * Cria o HTML do Card injetando o link de afiliado no data-url
 */
function criarCardHTML(p) {
    const divCard = document.createElement("div");
    divCard.className = "card";
    
    // Define o link vindo do JSON ou um padrão caso esteja vazio
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

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
    const amount = window.innerWidth < 768 ? track.clientWidth : track.clientWidth / 2;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
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
        const iconUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${iconUrl}" alt="${c.nome}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if (!grid) return;
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.style.padding = "5px";
            wrapper.appendChild(criarCardHTML(p));
            grid.appendChild(wrapper);
        });
    }
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    const btn = document.getElementById("btn-expandir-home");
    if (btn) btn.innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    const dropBtn = document.querySelector(".dropbtn");
    if(!nav || !dropBtn) return;

    nav.innerHTML = ""; // Limpa antes de renderizar
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        a.addEventListener("click", () => nav.classList.remove("show"));
        nav.appendChild(a);
    });

    dropBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        nav.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest('.category-dropdown')) {
            nav.classList.remove("show");
        }
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
        
        const timerEl = document.getElementById("timer");
        if(timerEl) timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// =========================================
// LÓGICA DO MODAL DE REDIRECIONAMENTO
// =========================================
function mostrarModalRedirecionamento(url) {
    const modal = document.getElementById('redirectModal');
    if (!modal) return;
    
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Simula o tempo de carregamento (2.5 segundos) e então abre o link
    setTimeout(() => {
        esconderModalRedirecionamento();
        // Abre o link de afiliado em nova aba
        window.open(url, '_blank');
    }, 2500); 
}

function esconderModalRedirecionamento() {
    const modal = document.getElementById('redirectModal');
    if (!modal) return;
    
    modal.classList.remove('visible');
    document.body.style.overflow = '';
}

// Inicializa a aplicação
init();
