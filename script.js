let categoriasData = [];
let filtroAtivo = "todos";

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro:", e); }
}

function desenharInterface() {
    const menuTopo = document.getElementById("menu-topo");
    const sidebarMenu = document.getElementById("sidebar-cats");
    const footerCats = document.getElementById("footer-cats");

    // Botão Todas
    const addNav = (name, id) => {
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = name;
        t.onclick = () => filtrar(id);
        menuTopo.appendChild(t);

        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = name;
        s.onclick = () => filtrar(id);
        sidebarMenu.appendChild(s);
    };

    addNav("⭐ TODAS", "todos");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;
        addNav(cat.nome, cat.id);

        // Footer Carousel
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<div class="cat-card-img-box"><img src="${cat.icone}"></div>
                       <div class="cat-card-text-box"><p>${cat.nome}</p></div>`;
        c.onclick = () => filtrar(cat.id);
        footerCats.appendChild(c);
    });
}

function filtrar(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderizar() {
    const secoesCont = document.getElementById("secoes-por-categoria");
    const gridEsp = document.getElementById("grid-especifico");
    const gridExp = document.getElementById("grid-expirando");
    const secExp = document.getElementById("secao-expirando");

    secoesCont.innerHTML = "";
    gridEsp.innerHTML = "";
    gridExp.innerHTML = "";

    if (filtroAtivo === "todos") {
        gridEsp.style.display = "none";
        secoesCont.style.display = "block";
        secExp.style.display = "block";

        // Expirando
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));

        // Uma fileira por categoria (Estilo Mercado Livre)
        categoriasData.forEach(cat => {
            if (cat.id === "expirando" || cat.produtos.length === 0) return;
            
            const row = document.createElement("section");
            row.className = "category-row";
            const rowId = `row-${cat.id}`;
            row.innerHTML = `
                <div class="row-header">
                    <h3>Mais vendidos em ${cat.nome}</h3>
                    <a onclick="filtrar('${cat.id}')">Ver todos</a>
                </div>
                <div class="carousel-container">
                    <button class="arrow-btn left" onclick="scrollCarousel('${rowId}', -1)"><i class="fas fa-chevron-left"></i></button>
                    <div class="row-inner" id="${rowId}"></div>
                    <button class="arrow-btn right" onclick="scrollCarousel('${rowId}', 1)"><i class="fas fa-chevron-right"></i></button>
                </div>`;
            secoesCont.appendChild(row);
            const inner = document.getElementById(rowId);
            cat.produtos.forEach(p => inner.appendChild(criarCard(p)));
        });
    } else {
        secoesCont.style.display = "none";
        secExp.style.display = "none";
        gridEsp.style.display = "grid";
        const cat = categoriasData.find(c => c.id === filtroAtivo);
        cat.produtos.forEach(p => gridEsp.appendChild(criarCard(p)));
    }
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `
        <div class="tag-radar">OFERTA</div>
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h3>${p.nome}</h3>
            <p class="preco">R$ ${p.preco}</p>
            <p class="envio-fake">Chegará grátis amanhã</p>
            <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
        </div>`;
    return d;
}

function scrollCarousel(id, dir) {
    const el = document.getElementById(id);
    el.scrollBy({ left: dir * 400, behavior: 'smooth' });
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

carregarSite();
