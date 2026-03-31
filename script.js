let categoriasData = [];
let expandidoHome = false;

const termosProcurados = ["apple watch", "ar condicionado", "bicicletas", "iphone 16", "ps5", "notebook dell", "jbl", "tv 50 4k", "tenis masculino", "xiaomi"];

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        gerarTagsFooter();
        iniciarTimer();
        configurarBusca();
    } catch (e) { console.error("Erro ao carregar dados:", e); }
}

function normalizarTexto(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function configurarBusca() {
    document.getElementById("input-busca").addEventListener("input", (e) => {
        filtrarConteudo(normalizarTexto(e.target.value));
    });
}

function filtrarConteudo(termo) {
    const feed = document.getElementById("feed-infinito");
    if (!termo) { renderizarFeedCompleto(); return; }
    feed.innerHTML = `<h2 class="section-title">Resultados</h2><div class="flash-grid" id="search-grid"></div>`;
    const grid = document.getElementById("search-grid");
    categoriasData.forEach(c => c.produtos.forEach(p => {
        if (normalizarTexto(p.nome).includes(termo)) grid.appendChild(criarCardHTML(p));
    }));
}

function mostrarModalGame() {
    const modal = document.getElementById('game-loading-modal');
    modal.classList.add('active');
    setTimeout(() => modal.classList.remove('active'), 3000);
}

function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h4>${p.nome}</h4>
            <div class="preco">R$ ${p.preco}</div>
            <div class="btn-comprar" onclick="mostrarModalGame()">Comprar agora</div>
        </div>`;
    return div;
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        const section = document.createElement("section");
        section.innerHTML = `
            <h2 class="section-title">${cat.nome}</h2>
            <div class="category-carousel-container">
                <div class="category-carousel-track">
                    ${cat.produtos.map(p => `<div class="card-wrapper">${criarCardHTML(p).outerHTML}</div>`).join('')}
                </div>
            </div>`;
        feed.appendChild(section);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        grid.innerHTML += `<a href="#cat-${c.id}" class="cat-icon-card"><img src="${c.icone}"><span>${c.nome}</span></a>`;
    });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos" : "Ver mais categorias";
}

function gerarTagsFooter() {
    const container = document.querySelector(".tags-container-inline");
    container.innerHTML = termosProcurados.map(t => `<span class="footer-tag-link" onclick="dispararBusca('${t}')">${t}</span>`).join(' • ');
}

function dispararBusca(t) {
    document.getElementById("input-busca").value = t;
    window.scrollTo({top: 0, behavior: 'smooth'});
    filtrarConteudo(normalizarTexto(t));
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        nav.innerHTML += `<a href="#cat-${c.id}" onclick="this.parentElement.classList.remove('show')">${c.nome}</a>`;
    });
    document.querySelector(".dropbtn").onclick = (e) => {
        e.stopPropagation();
        nav.classList.toggle("show");
    };
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => grid.appendChild(criarCardHTML(p)));
    }
}

function iniciarTimer() {
    setInterval(() => {
        const end = new Date().setHours(23, 59, 59);
        const diff = end - new Date();
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
