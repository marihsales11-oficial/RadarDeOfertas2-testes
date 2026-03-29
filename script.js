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
        renderizarTodoFeed(); // Renderiza tudo para que os links de âncora funcionem
        
    } catch (e) { console.error("Erro ao carregar produtos:", e); }
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    nav.innerHTML = "";
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        // Link para ID da seção
        a.href = `#cat-${c.id}`; 
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`; // Link para a seção
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerHTML = expandidoHome ? 
        'Mostrar menos categorias <i class="fas fa-chevron-up"></i>' : 
        'Mostrar mais categorias <i class="fas fa-chevron-down"></i>';
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    categoriasData[0].produtos.forEach(p => grid.appendChild(criarCard(p)));
}

function renderizarTodoFeed() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    // Começa do 1 pois o 0 é o "Expirando" que já está no topo
    for(let i = 1; i < categoriasData.length; i++) {
        const cat = categoriasData[i];
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`; // ID importante para o scroll
        section.innerHTML = `
            <h2 style="margin:60px 0 20px; font-weight:300; color:#333; border-bottom:1px solid #ccc; padding-bottom:10px">
                ${cat.nome}
            </h2>
            <div class="category-grid"></div>
        `;
        const grid = section.querySelector(".category-grid");
        cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
        feed.appendChild(section);
    }
}

function criarCard(p) {
    const a = document.createElement("a");
    a.className = "card"; a.href = "#";
    a.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h3>${p.nome}</h3>
            <div class="preco">R$ ${p.preco}</div>
            <div style="color:#00a650; font-size:12px; font-weight:bold; margin-top:5px">Frete grátis</div>
        </div>
    `;
    return a;
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        if (diff <= 0) return;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
iniciarTimer();
