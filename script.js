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
    } catch (e) { console.error(e); }
}

function criarCardHTML(p) {
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";
    wrapper.innerHTML = `
        <div class="card">
            <img src="${p.imagem}" loading="lazy">
            <div class="card-info">
                <h4>${p.nome}</h4>
                <div class="preco">R$ ${p.preco}</div>
                <div style="color:#00a650; font-size:11px; font-weight:bold">Frete grátis</div>
                <a href="#" class="btn-comprar">Comprar agora</a>
            </div>
        </div>
    `;
    return wrapper;
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            grid.appendChild(criarCardHTML(p));
        });
    }
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.innerHTML = `
            <h3 style="margin:30px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container" style="position:relative">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}" style="overflow-x:hidden; display:flex"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => track.appendChild(criarCardHTML(p)));
        feed.appendChild(section);
    });
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = track.clientWidth; 
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        // Uso do icone do JSON ou ícone padrão do Mercado Livre se falhar
        const iconUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${iconUrl}" style="width:45px"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos" : "Ver mais categorias";
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

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const el = document.getElementById("timer");
        if(el) el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
