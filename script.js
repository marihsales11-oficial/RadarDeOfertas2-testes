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
        
        iniciarCarrosseisAutomaticos();
    } catch (e) { console.error(e); }
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    // Se não expandido, mostra 8. Se expandido, mostra todas.
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        // Fallback para ícone caso a URL falhe
        const imgUrl = c.icone || 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg';
        card.innerHTML = `<img src="${imgUrl}"><span>${c.nome}</span>`;
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
    // Renderiza todos os produtos da primeira categoria (Ofertas Expirando)
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.flex = "0 0 224px";
            div.innerHTML = `
                <img src="${p.imagem}">
                <div class="card-info">
                    <div class="preco">R$ ${p.preco}</div>
                    <h4>${p.nome}</h4>
                </div>
            `;
            grid.appendChild(div);
        });
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
            <h3 style="margin:40px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${p.imagem}">
                <div class="card-info">
                    <h4>${p.nome}</h4>
                    <div class="preco">R$ ${p.preco}</div>
                    <div class="frete-gratis">Frete grátis</div>
                </div>
            `;
            track.appendChild(card);
        });
        feed.appendChild(section);
    });
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = 236; // largura do card (224) + gap (12)
    track.scrollBy({ left: amount * direction * 2, behavior: 'smooth' });
}

function iniciarCarrosseisAutomaticos() {
    const tracks = document.querySelectorAll('.category-carousel-track');
    tracks.forEach(track => {
        let interval = setInterval(() => {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) {
                track.scrollTo({left: 0, behavior: 'smooth'});
            } else {
                track.scrollBy({left: 1, behavior: 'auto'});
            }
        }, 40);
        track.addEventListener('mouseenter', () => clearInterval(interval));
    });
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
iniciarTimer();
