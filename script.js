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
        
    } catch (e) { console.error("Erro ao carregar dados:", e); }
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
                <button class="carousel-btn btn-prev"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track"></div>
                <button class="carousel-btn btn-next"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const cardLink = document.createElement("a");
            cardLink.className = "card-link";
            cardLink.style.textDecoration = "none";
            cardLink.href = p.link || "#";
            cardLink.innerHTML = `
                <div class="card">
                    <img src="${p.imagem}" loading="lazy">
                    <div class="card-info">
                        <h3 style="font-size: 13px; font-weight: 300; color: #333; margin: 0;">${p.nome}</h3>
                        <div class="preco">R$ ${p.preco}</div>
                        <div class="frete-gratis">Frete grátis</div>
                    </div>
                </div>
            `;
            track.appendChild(cardLink);
        });
        
        feed.appendChild(section);
        setupCarousel(section);
    });
}

function setupCarousel(section) {
    const track = section.querySelector('.category-carousel-track');
    const btnNext = section.querySelector('.btn-next');
    const btnPrev = section.querySelector('.btn-prev');
    
    // Scroll Manual
    btnNext.onclick = () => track.scrollBy({ left: track.offsetWidth / 2, behavior: 'smooth' });
    btnPrev.onclick = () => track.scrollBy({ left: -track.offsetWidth / 2, behavior: 'smooth' });

    // Auto Scroll Lento
    let isPaused = false;
    track.onmouseenter = () => isPaused = true;
    track.onmouseleave = () => isPaused = false;

    setInterval(() => {
        if (!isPaused) {
            if (track.scrollLeft + track.offsetWidth >= track.scrollWidth) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: 1, behavior: 'auto' });
            }
        }
    }, 40); // Velocidade do auto-scroll
}

function renderizarMenus() {
    const navDT = document.getElementById("menu-categorias-dt");
    if (!navDT) return;
    navDT.innerHTML = "";
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        navDT.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    if (!grid) return;
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
    if (!grid || !categoriasData[0]) return;
    grid.innerHTML = "";
    categoriasData[0].produtos.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${p.imagem}">
            <div class="card-info">
                <h3 style="font-size: 13px; font-weight: 300; color: #333; margin: 0;">${p.nome}</h3>
                <div class="preco">R$ ${p.preco}</div>
                <div class="frete-gratis">Frete grátis</div>
            </div>
        `;
        grid.appendChild(div);
    });
}

function iniciarTimer() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        if (diff <= 0) return;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
