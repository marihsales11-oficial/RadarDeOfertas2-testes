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
        configurarBuscaInteligente();
    } catch (e) { console.error("Erro:", e); }
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
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.innerHTML = `
                <div class="card">
                    <img src="${p.imagem}" loading="lazy">
                    <div class="card-info">
                        <h4 style="font-size:13px; font-weight:300; margin:0 0 8px; color:#666; height:38px; overflow:hidden;">${p.nome}</h4>
                        <div class="preco">R$ ${p.preco}</div>
                        <div style="color:#00a650; font-size:11px; font-weight:bold">Frete grátis</div>
                        <a href="#" class="btn-comprar">Comprar agora</a>
                    </div>
                </div>
            `;
            track.appendChild(wrapper);
        });
        feed.appendChild(section);
    });
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = window.innerWidth < 768 ? track.clientWidth : track.clientWidth / 2;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            const wrapper = document.createElement("div");
            wrapper.className = "card-wrapper";
            wrapper.innerHTML = `
                <div class="card">
                    <img src="${p.imagem}">
                    <div class="card-info">
                        <div class="preco">R$ ${p.preco}</div>
                        <h4 style="font-size:13px; font-weight:300; margin:5px 0; color:#666;">${p.nome}</h4>
                        <a href="#" class="btn-comprar">Comprar agora</a>
                    </div>
                </div>
            `;
            grid.appendChild(wrapper);
        });
    }
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        // Fallback para ícone que deu erro
        const iconUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${iconUrl}" style="width:45px"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
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

function configurarBuscaInteligente() {
    const input = document.getElementById('input-busca');
    const resultados = document.getElementById('busca-resultados');
    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        resultados.innerHTML = "";
        if (termo.length < 1) { resultados.style.display = 'none'; return; }
        let matches = [];
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                if (p.nome.toLowerCase().includes(termo)) matches.push(p);
            });
        });
        if (matches.length > 0) {
            resultados.style.display = 'block';
            matches.slice(0, 6).forEach(p => {
                const item = document.createElement('a');
                item.className = 'sugestao-item';
                item.href = "#";
                item.innerHTML = `<img src="${p.imagem}"><div><strong>${p.nome}</strong><br>R$ ${p.preco}</div>`;
                resultados.appendChild(item);
            });
        } else { resultados.style.display = 'none'; }
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) resultados.style.display = 'none';
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
