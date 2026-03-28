let categoriasData = [];
let filtroAtivo = "todos";
let expandido = false;

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

function desenharInterface() {
    const filtrar = (id) => {
        filtroAtivo = id;
        renderizar();
        window.scrollTo(0, 0);
    };

    // Preencher Menus
    categoriasData.forEach((cat, index) => {
        if(cat.id === "expirando") return;

        // Mobile Filter & Nav Topo
        const mobLink = document.createElement("a");
        mobLink.className = "mob-filter-item";
        mobLink.innerText = cat.nome;
        mobLink.onclick = () => filtrar(cat.id);
        document.getElementById("mobile-category-filter").appendChild(mobLink);

        const navLink = document.createElement("a");
        navLink.className = "nav-link";
        navLink.innerText = cat.nome;
        navLink.onclick = () => filtrar(cat.id);
        document.getElementById("menu-topo").appendChild(navLink);

        // Sidebar
        const sideLink = document.createElement("div");
        sideLink.className = "cat-item";
        sideLink.innerText = cat.nome;
        sideLink.onclick = () => filtrar(cat.id);
        document.getElementById("sidebar-cats").appendChild(sideLink);

        // Grade Footer (ML) - Exibe 6 no desktop / 3 no mobile inicialmente
        const c = document.createElement("a");
        c.href = "javascript:void(0)";
        c.className = `cat-card-ml ${index > 6 ? 'hidden' : ''}`;
        c.innerHTML = `<img src="${cat.icone}"><span>${cat.nome}</span>`;
        c.onclick = () => filtrar(cat.id);
        document.getElementById("footer-cats").appendChild(c);
    });
}

function toggleCategorias() {
    expandido = !expandido;
    const cards = document.querySelectorAll('.cat-card-ml');
    cards.forEach((card, index) => {
        if (index > 6) card.classList.toggle('hidden', !expandido);
    });
    document.getElementById('btn-mostrar-mais').innerHTML = expandido ? 
        'Mostrar menos categorias <i class="fas fa-chevron-up"></i>' : 
        'Mostrar mais categorias <i class="fas fa-chevron-down"></i>';
}

function renderizar() {
    const container = document.getElementById("container-categorias");
    const gridExp = document.getElementById("grid-expirando");
    const secaoExp = document.getElementById("secao-expirando");
    container.innerHTML = "";
    gridExp.innerHTML = "";

    if (filtroAtivo === "todos") {
        secaoExp.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));
    } else {
        secaoExp.style.display = "none";
    }

    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        if (filtroAtivo !== "todos" && filtroAtivo !== cat.id) return;

        const section = document.createElement("section");
        section.className = "category-section";
        section.innerHTML = `
            <a href="javascript:void(0)" class="category-title-link" onclick="ativarFiltro('${cat.id}')">
                <h2 class="category-title">${cat.nome}</h2>
            </a>
            <div class="grid-layout"></div>
        `;
        
        const grid = section.querySelector(".grid-layout");
        cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
        container.appendChild(section);
    });
}

window.ativarFiltro = (id) => {
    filtroAtivo = id;
    renderizar();
    window.scrollTo(0,0);
};

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}" loading="lazy"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" class="btn-comprar">VER OFERTA</a>`;
    return d;
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

document.getElementById("sort-price").onchange = renderizar;
carregarSite();
