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
        
    } catch (e) { console.error(e); }
}

function renderizarMenus() {
    const navDT = document.getElementById("menu-categorias-dt");
    navDT.innerHTML = "";
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        navDT.appendChild(a);
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
            <h3 class="section-title" style="margin:40px 0 10px; font-weight:300; text-align:left">${cat.nome}</h3>
            <div class="category-carousel-container">
                <div class="category-carousel-track"></div>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const cardLink = document.createElement("a");
            cardLink.className = "card-link";
            cardLink.href = p.link || "#"; // Link original restaurado
            cardLink.innerHTML = `
                <div class="card">
                    <img src="${p.imagem}" loading="lazy">
                    <div class="card-info">
                        <h3>${p.nome}</h3>
                        <div class="preco">R$ ${p.preco}</div>
                        <div class="frete-gratis">Frete grátis</div>
                    </div>
                </div>
            `;
            track.appendChild(cardLink);
        });
        feed.appendChild(section);
    });
    
    document.getElementById("loader").style.display = "none";
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

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Mostrar menos" : "Ver mais categorias";
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    categoriasData[0].produtos.forEach(p => {
        const cardLink = document.createElement("a");
        cardLink.className = "card-link";
        cardLink.href = p.link || "#";
        cardLink.innerHTML = `
            <div class="card">
                <img src="${p.imagem}">
                <div class="card-info">
                    <h3>${p.nome}</h3>
                    <div class="preco">R$ ${p.preco}</div>
                    <div class="frete-gratis">Frete grátis</div>
                </div>
            </div>
        `;
        grid.appendChild(cardLink);
    });
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
