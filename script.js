let categoriasData = [];
let expandido = false;

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        preencherMenus();
        renderizarProdutos();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

function preencherMenus() {
    const dropdownDt = document.getElementById("menu-categorias-dt");
    const mobileBar = document.getElementById("mobile-category-filter");
    const footerCats = document.getElementById("footer-cats");

    categoriasData.forEach((cat, index) => {
        if(cat.id === "expirando") return;

        // Desktop Dropdown
        const dLink = document.createElement("a");
        dLink.href = `#${cat.id}`;
        dLink.innerText = cat.nome;
        dLink.onclick = (e) => filtrar(e, cat.id);
        dropdownDt.appendChild(dLink);

        // Mobile Bar
        const mLink = document.createElement("a");
        mLink.className = "mob-item";
        mLink.innerText = cat.nome;
        mLink.onclick = (e) => filtrar(e, cat.id);
        mobileBar.appendChild(mLink);

        // Footer Grid
        const fCard = document.createElement("a");
        fCard.className = `cat-card-ml ${index > 8 ? 'hidden' : ''}`;
        fCard.innerHTML = `<i class="fas fa-tag"></i><span>${cat.nome}</span>`;
        fCard.onclick = (e) => filtrar(e, cat.id);
        footerCats.appendChild(fCard);
    });
}

function renderizarProdutos() {
    const container = document.getElementById("container-categorias");
    const gridExp = document.getElementById("grid-expirando");
    
    // Limpar
    container.innerHTML = "";
    gridExp.innerHTML = "";

    // 1. Renderizar Destaques (Expirando)
    const exp = categoriasData.find(c => c.id === "expirando");
    exp.produtos.forEach(p => gridExp.appendChild(criarCard(p, true)));

    // 2. Renderizar Outras Seções
    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        
        const section = document.createElement("section");
        section.className = "category-section";
        section.id = cat.id;
        section.innerHTML = `
            <h2 class="category-title" style="margin: 40px 0 20px; font-size: 24px; color: #666; font-weight: 300;">
                ${cat.nome}
            </h2>
            <div class="flash-grid" style="background:none;"></div>
        `;
        
        const grid = section.querySelector(".flash-grid");
        cat.produtos.forEach(p => grid.appendChild(criarCard(p, false)));
        container.appendChild(section);
    });
}

function filtrar(e, id) {
    e.preventDefault();
    const element = document.getElementById(id);
    if(element) {
        const offset = 140; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

function criarCard(p, isFlash) {
    const a = document.createElement("a");
    a.href = p.link;
    a.className = "card";
    a.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}">
        <div class="card-info">
            <h3>${p.nome}</h3>
            <div class="preco">R$ ${p.preco}</div>
            ${isFlash ? '<span style="color: #00a650; font-size: 12px; font-weight: bold;">OFERTA DO DIA</span>' : ''}
        </div>
    `;
    return a;
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
