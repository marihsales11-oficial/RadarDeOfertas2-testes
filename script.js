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

function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <h4>${p.nome}</h4>
        <div class="preco">R$ ${p.preco}</div>
        <div class="frete">Frete grátis</div>
        <button class="btn-comprar" onclick="comprar(this)">Comprar agora</button>
    `;
    return div;
}

function comprar(btn) {
    btn.classList.add('loading');
    setTimeout(() => {
        alert("Você está sendo redirecionado para a página de Afiliados do Mercado Livre, sua compra é segura.");
        btn.classList.remove('loading');
        window.open("https://www.mercadolivre.com.br", "_blank");
    }, 1200);
}

function scrollManual(id, direction) {
    const el = document.getElementById(id);
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if(categoriasData[0]) {
        categoriasData[0].produtos.forEach(p => grid.appendChild(criarCardHTML(p)));
    }
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    categoriasData.slice(1).forEach(cat => {
        const section = document.createElement("section");
        section.innerHTML = `
            <h3 class="section-title">${cat.nome}</h3>
            <div class="carousel-container-global">
                <button class="btn-scroll left" onclick="scrollManual('track-${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="products-grid-scroll" id="track-${cat.id}"></div>
                <button class="btn-scroll right" onclick="scrollManual('track-${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        const track = section.querySelector(".products-grid-scroll");
        cat.produtos.forEach(p => track.appendChild(criarCardHTML(p)));
        feed.appendChild(section);
    });
}

function renderizarMenus() {
    const menu = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#track-${c.id}`;
        a.innerText = c.nome;
        menu.appendChild(a);
    });
}

function configurarBusca() {
    const input = document.getElementById('input-busca');
    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const nome = card.querySelector('h4').innerText.toLowerCase();
            card.style.display = nome.includes(termo) ? "flex" : "none";
        });
    });
}

// ... manter funções auxiliares (Timer, IconesHome) ...

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
