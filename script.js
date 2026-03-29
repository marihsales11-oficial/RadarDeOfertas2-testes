/* script.js */
// Mantendo a lógica anterior, adicionando carrossel e links de âncora

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
        
        // Renderizar todas as categorias como seções (necessário para o scroll e carrossel)
        renderizarFeedCompleto();
        
    } catch (e) { console.error("Erro ao carregar produtos:", e); }
}

function renderizarMenus() {
    const navDT = document.getElementById("menu-categorias-dt");
    navDT.innerHTML = "";
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`; // Link de âncora
        a.innerText = c.nome;
        navDT.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`; // Link de âncora
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    grid.innerHTML = "";
    if (categoriasData.length > 0) {
        categoriasData[0].produtos.forEach(p => grid.appendChild(criarCard(p)));
    }
}

// Renderiza todas as categorias em seções separadas
function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return; // Pula a primeira que já está no topo (Expirando)
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`; // ID importante para a âncora
        section.className = "category-section";
        section.style.margin = "60px 0";
        
        section.innerHTML = `
            <h2 class="section-title" style="text-align:left; margin-bottom:15px; border-bottom:1px solid #ccc; padding-bottom:10px">
                ${cat.nome}
            </h2>
            <div class="category-carousel-container">
                <button class="carousel-btn prev"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track"></div>
                <button class="carousel-btn next"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => track.appendChild(criarCard(p)));
        
        feed.appendChild(section);
        
        // Inicializa a lógica do carrossel para esta seção
        initCarrossel(section);
    });
    
    // Esconde o loader após carregar tudo
    document.getElementById("loader").style.display = "none";
}

function criarCard(p) {
    const a = document.createElement("a");
    a.className = "card-link";
    a.href = "#"; // Substituir pelo link real do produto se houver
    
    a.innerHTML = `
        <div class="card">
            <img src="${p.imagem}" loading="lazy">
            <div class="card-info">
                <h3>${p.nome}</h3>
                <div class="preco">R$ ${p.preco}</div>
                <div class="frete-gratis">Frete grátis</div>
            </div>
        </div>
    `;
    return a;
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

// Lógica nativa do carrossel (sem bibliotecas externas)
function initCarrossel(section) {
    const track = section.querySelector('.category-carousel-track');
    const prevBtn = section.querySelector('.carousel-btn.prev');
    const nextBtn = section.querySelector('.carousel-btn.next');
    
    // Verifica se precisa de carrossel (se o conteúdo transborda)
    function checkOverflow() {
        if (track.scrollWidth > track.clientWidth) {
            // Mostra os botões se houver transbordo
            if (track.scrollLeft > 0) prevBtn.style.display = 'flex';
            else prevBtn.style.display = 'none';
            
            if (track.scrollLeft < track.scrollWidth - track.clientWidth) nextBtn.style.display = 'flex';
            else nextBtn.style.display = 'none';
        } else {
            // Esconde os botões se não houver transbordo
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    }

    // Define o valor do scroll (largura visível do track)
    function getScrollAmount() {
        return track.clientWidth;
    }

    nextBtn.addEventListener('click', () => {
        track.scrollLeft += getScrollAmount();
    });

    prevBtn.addEventListener('click', () => {
        track.scrollLeft -= getScrollAmount();
    });

    // Escuta o evento de scroll para atualizar os botões
    track.addEventListener('scroll', checkOverflow);
    
    // Escuta o redimensionamento da janela
    window.addEventListener('resize', checkOverflow);
    
    // Verificação inicial
    checkOverflow();
}

init();
iniciarTimer();
