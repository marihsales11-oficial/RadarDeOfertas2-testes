let categoriasData = [];
let expandidoHome = false;
let carregando = false;
let indiceCategoriaAtual = 1; // Começa após 'expirando'

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        
        // Carrega as primeiras 2 categorias do feed
        carregarMaisCategoriasFeed();

        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800 && !carregando) {
                carregarMaisCategoriasFeed();
            }
        });
    } catch (e) { console.error(e); }
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = "#"; a.innerText = c.nome;
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

function carregarMaisCategoriasFeed() {
    if (indiceCategoriaAtual >= categoriasData.length) return;
    
    carregando = true;
    document.getElementById("loader").style.display = "block";

    // Simula delay para "mental do usuário"
    setTimeout(() => {
        const feed = document.getElementById("feed-infinito");
        for(let i=0; i<2; i++) { // Carrega 2 categorias por vez
            if (categoriasData[indiceCategoriaAtual]) {
                const cat = categoriasData[indiceCategoriaAtual];
                const section = document.createElement("section");
                section.innerHTML = `<h2 style="margin:40px 0 20px; font-weight:300; color:#666">${cat.nome}</h2><div class="category-grid"></div>`;
                const grid = section.querySelector(".category-grid");
                cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
                feed.appendChild(section);
                indiceCategoriaAtual++;
            }
        }
        carregando = false;
        document.getElementById("loader").style.display = "none";
    }, 800);
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
iniciarTimer();
