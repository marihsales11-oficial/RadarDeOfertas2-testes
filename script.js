let categoriasData = [];

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        
        iniciarCarrosseisLentos();
    } catch (e) { console.error(e); }
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if(categoriasData[0]) {
        // Renderiza os primeiros 6 itens (ajustável)
        categoriasData[0].produtos.forEach(p => {
            grid.appendChild(criarCardHTML(p));
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
            <h3 style="margin:30px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
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
            track.appendChild(criarCardHTML(p));
        });
        feed.appendChild(section);
    });
}

function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <div class="preco">R$ ${p.preco}</div>
            <h4>${p.nome}</h4>
            <div class="frete-gratis">Frete grátis</div>
        </div>
    `;
    return div;
}

// Navegação por clique nas setas (Desktop e Mobile)
function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const cardWidth = track.querySelector('.card').offsetWidth + 10; // largura + gap
    track.scrollBy({ left: cardWidth * direction * 2, behavior: 'smooth' });
}

// Carrossel Lento Automático
function iniciarCarrosseisLentos() {
    const tracks = document.querySelectorAll('.category-carousel-track');
    tracks.forEach(track => {
        let isMoving = true;
        let interval = setInterval(() => {
            if (!isMoving) return;
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
                track.scrollLeft = 0;
            } else {
                track.scrollLeft += 1;
            }
        }, 50);

        // Para ao tocar ou passar o mouse
        track.addEventListener('mouseenter', () => isMoving = false);
        track.addEventListener('mouseleave', () => isMoving = true);
        track.addEventListener('touchstart', () => isMoving = false);
        track.addEventListener('touchend', () => {
            setTimeout(() => isMoving = true, 2000);
        });
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

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    categoriasData.slice(0, 8).forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

init();
