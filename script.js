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

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return; // Pula a categoria 'expirando' pois já tem seção própria
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.innerHTML = `
            <h3 class="section-title">${cat.nome}</h3>
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
    const amount = track.clientWidth * 0.8;
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
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.appendChild(criarCardHTML(p));
            grid.appendChild(wrapper);
        });
    }
}

function configurarBusca() {
    const input = document.getElementById('input-busca');
    const btn = document.getElementById('btn-busca');

    const dispararBusca = () => {
        const termo = input.value.toLowerCase().trim();
        const feed = document.getElementById("feed-infinito");
        const secaoExpirando = document.getElementById("secao-expirando");
        const secaoIcones = document.getElementById("secao-categorias-icones");

        if (termo === "") {
            secaoExpirando.style.display = "block";
            secaoIcones.style.display = "block";
            renderizarFeedCompleto();
            return;
        }

        // Esconder seções fixas para mostrar apenas resultados
        secaoExpirando.style.display = "none";
        secaoIcones.style.display = "none";
        
        feed.innerHTML = `<h2 class="section-title">Resultados para "${input.value}"</h2><div class="search-results-grid" id="grid-busca"></div>`;
        const gridBusca = document.getElementById("grid-busca");

        let encontrou = false;
        categoriasData.forEach(cat => {
            cat.produtos.forEach(prod => {
                if (prod.nome.toLowerCase().includes(termo) || cat.nome.toLowerCase().includes(termo)) {
                    gridBusca.appendChild(criarCardHTML(prod));
                    encontrou = true;
                }
            });
        });

        if (!encontrou) {
            feed.innerHTML = `<div style="text-align:center; padding: 100px 20px;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Não encontramos resultados para "${input.value}"</h3>
                <p>Verifique a ortografia ou use termos mais genéricos.</p>
            </div>`;
        }
    };

    btn.addEventListener('click', dispararBusca);
    input.addEventListener('keypress', (e) => { if(e.key === 'Enter') dispararBusca(); });
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
