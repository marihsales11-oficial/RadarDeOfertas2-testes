let categoriasData = [];
let expandidoHome = false;

// Lista de termos para o rodapé (extraída do seu original)
const termosProcurados = [
    "apple watch", "ar condicionado", "ar condicionado inverter", "bicicletas", "cafeteira", "carros novos", "computador", "fogao 4 boca", "fone de ouvido bluetooth", "freezer vertical", "geladeira frost free", "guarda roupa casal", "guarda roupa solteiro", "ipad", "iphone", "iphone 8 plus", "iphone 11", "iphone 13", "iphone 13 pro max", "iphone 14", "iphone 14 pro", "iphone 14 pro max", "iphone 15", "iphone 16", "iphone 16 plus", "iphone 16 pro", "iphone 16 pro max", "jbl", "microondas", "monitor", "motorola", "nintendo switch", "notebook", "notebook dell", "painel para tv", "penteadeira", "poco x5 pro", "ps4", "ps5", "redmi note 12", "s22 ultra", "samsung a54", "samsung s23", "smartwatch", "tablets samsung", "tenis masculino", "tennis feminino", "tv 32 polegadas", "tv 50 4k", "tv 50 polegadas", "ventilador", "xbox", "xbox series x", "xdj", "xiaomi", "comparador de celulares"
];

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
        gerarTagsFooter(); // Inicializa as tags clicáveis
        gerarAlfabeto();   // Inicializa o alfabeto clicável
    } catch (e) { console.error("Erro ao carregar dados:", e); }
}

function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function configurarBusca() {
    const inputBusca = document.getElementById("input-busca");
    inputBusca.addEventListener("input", (e) => {
        filtrarConteudo(normalizarTexto(e.target.value));
    });
}

function filtrarConteudo(termo) {
    const feed = document.getElementById("feed-infinito");
    const heroSection = document.querySelector(".flash-deals-hero");
    const categoriasPopulares = document.querySelector(".home-categories");

    if (termo === "") {
        heroSection.style.display = "block";
        categoriasPopulares.style.display = "block";
        renderizarExpirando();
        renderizarFeedCompleto();
        return;
    }

    heroSection.style.display = "none";
    categoriasPopulares.style.display = "none";
    feed.innerHTML = `<h2 class="section-title">Resultados da busca</h2><div class="flash-grid" id="search-results-grid"></div>`;
    const resultsGrid = document.getElementById("search-results-grid");

    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            if (normalizarTexto(p.nome).includes(termo)) {
                resultsGrid.appendChild(criarCardHTML(p));
            }
        });
    });
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
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
            </div>`;
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

// MODAL DE REDIRECIONAMENTO ESTILO GAME
function mostrarLoadingGame() {
    const modal = document.getElementById('game-loading-modal');
    modal.classList.add('active');
    setTimeout(() => {
        modal.classList.remove('active');
    }, 3000);
}

function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h4>${p.nome}</h4>
            <div class="preco">R$ ${p.preco}</div>
            <div style="color:#00a650; font-size:12px; font-weight:bold; margin-bottom:15px">Frete grátis</div>
            <div class="btn-comprar" onclick="mostrarLoadingGame()">Comprar agora</div>
        </div>`;
    return div;
}

// BUSCA AUTOMÁTICA VIA TAGS
function dispararBuscaDireta(termo) {
    const inputBusca = document.getElementById("input-busca");
    inputBusca.value = termo;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    filtrarConteudo(normalizarTexto(termo));
}

function gerarTagsFooter() {
    const container = document.querySelector(".tags-container-inline");
    container.innerHTML = "";
    termosProcurados.forEach((t, i) => {
        const span = document.createElement("span");
        span.className = "footer-tag-link";
        span.innerText = t;
        span.onclick = () => dispararBuscaDireta(t);
        container.appendChild(span);
        if (i < termosProcurados.length - 1) container.appendChild(document.createTextNode(", "));
    });
}

function gerarAlfabeto() {
    const container = document.querySelector(".letters-inline");
    container.innerHTML = "";
    "A-B-C-D-E-F-G-H-I-J-K-L-M-N-O-P-Q-R-S-T-U-V-W-X-Y-Z".split("-").forEach((l, i, arr) => {
        const span = document.createElement("span");
        span.className = "footer-tag-link";
        span.innerText = l;
        span.onclick = () => dispararBuscaDireta(l);
        container.appendChild(span);
        if (i < arr.length - 1) container.appendChild(document.createTextNode(" - "));
    });
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    const dropBtn = document.querySelector(".dropbtn");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        a.onclick = () => document.querySelector(".dropdown-content").style.display = "none";
        nav.appendChild(a);
    });
    dropBtn.onclick = (e) => {
        e.stopPropagation();
        const content = document.querySelector(".dropdown-content");
        content.style.display = content.style.display === "block" ? "none" : "block";
    };
    document.addEventListener("click", () => document.querySelector(".dropdown-content").style.display = "none");
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    track.scrollBy({ left: (track.clientWidth / 2) * direction, behavior: 'smooth' });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
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
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
