let categoriasData = [];
let expandidoHome = false;
let carregando = false;
let indiceCategoriaAtual = 1;

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarDropdown();
        renderizarIconesHome();
        renderizarExpirando();
        
        // Inicia com as categorias principais no feed para garantir que as âncoras existam
        while(indiceCategoriaAtual < 8) { carregarCategoriaNoFeed(); }

        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 900 && !carregando) {
                carregarCategoriaNoFeed();
            }
        });
    } catch (e) { console.error(e); }
}

function renderizarDropdown() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 9);
    
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#${c.id}`; // CORREÇÃO IMAGEM 3: Funciona como link
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
    categoriasData[0].produtos.forEach(p => grid.appendChild(criarCard(p)));
}

function carregarCategoriaNoFeed() {
    if (indiceCategoriaAtual >= categoriasData.length) return;
    
    const feed = document.getElementById("feed-infinito");
    const cat = categoriasData[indiceCategoriaAtual];
    
    const section = document.createElement("section");
    section.id = cat.id; // ID para a âncora do link funcionar
    section.innerHTML = `<h2 style="margin:60px 0 20px; font-weight:300; color:#666">${cat.nome}</h2><div class="category-grid"></div>`;
    const grid = section.querySelector(".category-grid");
    cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
    
    feed.appendChild(section);
    indiceCategoriaAtual++;
}

function criarCard(p) {
    const a = document.createElement("a");
    a.className = "card"; a.href = "#";
    a.innerHTML = `
        <img src="${p.imagem}">
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
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - new Date();
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
iniciarTimer();
