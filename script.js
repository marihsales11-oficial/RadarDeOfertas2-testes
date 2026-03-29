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

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.className = "category-section";
        
        section.innerHTML = `
            <h3 style="margin:40px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container" data-cat="${cat.id}">
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
                <div style="padding:10px">
                    <h4 style="font-size:13px; font-weight:300; margin:0 0 10px">${p.nome}</h4>
                    <div style="font-size:22px">R$ ${p.preco}</div>
                    <div style="color:#00a650; font-size:12px; font-weight:bold">Frete grátis</div>
                </div>
            `;
            track.appendChild(card);
        });
        feed.appendChild(section);
    });
}

// LOGICA CARROSSEL AUTOMATICO
function iniciarCarrosseisAutomaticos() {
    const tracks = document.querySelectorAll('.category-carousel-track');
    
    tracks.forEach(track => {
        let autoScroll = setInterval(() => {
            if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
                track.scrollLeft = 0;
            } else {
                track.scrollLeft += 1; // Velocidade lenta
            }
        }, 30);

        // Para o carrossel quando o usuário interage
        track.addEventListener('mouseenter', () => clearInterval(autoScroll));
        track.addEventListener('mouseleave', () => {
            autoScroll = setInterval(() => {
                if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
                    track.scrollLeft = 0;
                } else {
                    track.scrollLeft += 1;
                }
            }, 30);
        });
    });
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = track.clientWidth * 0.7;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

// Demais funções (Timer e Menus)
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
    categoriasData[0].produtos.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${p.imagem}"><div style="padding:10px"><div style="font-size:20px">R$ ${p.preco}</div></div>`;
        grid.appendChild(div);
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
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
iniciarTimer();
