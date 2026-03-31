const termosProcurados = ["apple watch", "ar condicionado", "bicicletas", "iphone 16 pro max", "ps5", "xbox", "notebook dell", "jbl", "tv 50 4k", "tenis masculino"];
let categoriasData = [];

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
        gerarAlfabeto();
        iniciarTimer();
        configurarBusca();
        
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-comprar')) mostrarModal();
        });
    } catch (e) { console.error(e); }
}

function normalizarTexto(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function configurarBusca() {
    document.getElementById("input-busca").addEventListener("input", (e) => filtrarConteudo(normalizarTexto(e.target.value)));
}

function filtrarConteudo(termo) {
    const feed = document.getElementById("feed-infinito");
    if (!termo) { renderizarFeedCompleto(); return; }
    feed.innerHTML = '<div class="flash-grid" id="search-results"></div>';
    const grid = document.getElementById("search-results");
    categoriasData.forEach(c => c.produtos.forEach(p => {
        if (normalizarTexto(p.nome).includes(termo)) grid.appendChild(criarCardHTML(p));
    }));
}

function dispararBuscaDireta(termo) {
    document.getElementById("input-busca").value = termo;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    filtrarConteudo(normalizarTexto(termo));
}

function gerarTagsFooter() {
    const container = document.getElementById("container-tags-dinamicas");
    termosProcurados.forEach((t, i) => {
        const span = document.createElement("span");
        span.className = "tag-link";
        span.innerText = t;
        span.onclick = () => dispararBuscaDireta(t);
        container.appendChild(span);
        if (i < termosProcurados.length - 1) container.appendChild(document.createTextNode(" • "));
    });
}

function gerarAlfabeto() {
    const container = document.getElementById("alfabeto-container");
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => {
        const span = document.createElement("span");
        span.innerText = l;
        span.onclick = () => dispararBuscaDireta(l);
        container.appendChild(span);
    });
}

function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${p.imagem}"><div class="card-info"><h4>${p.nome}</h4><div class="preco">R$ ${p.preco}</div><div class="btn-comprar">Comprar agora</div></div>`;
    return div;
}

function mostrarModal() {
    const m = document.getElementById('redirectModal');
    m.classList.add('visible');
    setTimeout(() => m.classList.remove('visible'), 3000);
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        a.onclick = () => nav.classList.remove("show");
        nav.appendChild(a);
    });
    document.querySelector(".dropbtn").onclick = (e) => { e.stopPropagation(); nav.classList.toggle("show"); };
}

// Funções de suporte (Timer, Scroll, etc) seguem o padrão original...
function iniciarTimer() { /* Lógica do timer */ }
function renderizarIconesHome() { /* Lógica ícones */ }
function renderizarExpirando() { /* Lógica expirando */ }
function renderizarFeedCompleto() { /* Lógica feed */ }

init();
