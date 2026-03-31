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
        
        configurarBusca();
    } catch (e) { console.error("Erro ao carregar dados:", e); }
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function configurarBusca() {
    const inputBusca = document.getElementById("input-busca");
    inputBusca.addEventListener("input", (e) => {
        const termo = normalizarTexto(e.target.value);
        filtrarConteudo(termo);
    });
}

function filtrarConteudo(termo) {
    const feed = document.getElementById("feed-infinito");
    const heroSection = document.querySelector(".flash-deals-hero");
    const categoriasPopulares = document.querySelector(".home-categories");

    if (termo === "") {
        heroSection.style.display = "block";
        categoriasPopulares.style.display = "block";
        renderizarExpirando();
        renderizarFeedCompleto();
        return;
    }

    heroSection.style.display = "none";
    categoriasPopulares.style.display = "none";

    feed.innerHTML = `<h2 class="section-title">Resultados da busca</h2><div class="flash-grid" id="search-results-grid"></div>`;
    const resultsGrid = document.getElementById("search-results-grid");

    let encontrouAlgo = false;

    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            const nomeProdutoNormalizado = normalizarTexto(p.nome);
            if (nomeProdutoNormalizado.includes(termo)) {
                resultsGrid.appendChild(criarCardHTML(p));
                encontrouAlgo = true;
            }
        });
    });

    if (!encontrouAlgo) {
        resultsGrid.innerHTML = "<p style='grid-column: 1/-1; padding: 20px; color: #666;'>Nenhum produto encontrado para sua busca.</p>";
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
            <h3 style="margin:40px 0 15px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.appendChild(criarCardHTML(p));
            track.appendChild(wrapper);
        });
        feed.appendChild(section);
    });
}

function criarCardHTML(p) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = "#";
    
    // Adicionado o redirecionamento com mensagem de segurança solicitado
    a.onclick = (e) => {
        e.preventDefault();
        alert("Direcionando para a página do ML para que você realize sua compra com total segurança.");
    };

    a.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h4>${p.nome}</h4>
            <div class="preco">R$ ${p.preco}</div>
            <div style="color:#00a650; font-size:12px; font-weight:bold; margin-bottom:15px">Frete grátis</div>
            <div class="btn-comprar">Comprar agora</div>
        </div>
    `;
    return a;
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = window.innerWidth < 768 ? track.clientWidth : track.clientWidth / 2;
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
        const iconUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${iconUrl}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.style.padding = "5px";
            wrapper.appendChild(criarCardHTML(p));
            grid.appendChild(wrapper);
        });
    }
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
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
        const timerEl = document.getElementById("timer");
        if(timerEl) timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
