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
        
        // Inicializa a Busca Inteligente
        configurarBusca();
        
    } catch (e) { console.error(e); }
}

function configurarBusca() {
    const input = document.getElementById('input-busca');
    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const secoes = document.querySelectorAll('.category-section');
        const homeIcons = document.getElementById('secao-icones');

        if (termo.length > 0) {
            homeIcons.style.display = 'none'; // Esconde ícones populares ao buscar
            secoes.forEach(secao => {
                const nomeCat = secao.dataset.nome.toLowerCase();
                const temProduto = Array.from(secao.querySelectorAll('h3')).some(h => h.innerText.toLowerCase().includes(termo));
                
                // Se a categoria ou algum produto nela der match, mantém a seção
                if (nomeCat.includes(termo) || temProduto) {
                    secao.style.display = 'block';
                } else {
                    secao.style.display = 'none';
                }
            });
        } else {
            homeIcons.style.display = 'block';
            secoes.forEach(s => s.style.display = 'block');
        }
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

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.className = "category-section";
        section.dataset.nome = cat.nome;
        
        section.innerHTML = `
            <h3 style="margin:40px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container">
                <div class="category-carousel-track"></div>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${p.imagem}" loading="lazy">
                <h3>${p.nome}</h3>
                <div class="preco">R$ ${p.preco}</div>
                <div style="color:#00a650; font-size:12px; font-weight:bold">Frete grátis</div>
            `;
            track.appendChild(card);
        });
        feed.appendChild(section);
    });
    document.getElementById("loader").style.display = "none";
}

// Funções de timer e ícones mantidas com ajustes de ID
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
    categoriasData[0].produtos.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${p.imagem}"><div class="preco">R$ ${p.preco}</div><h3>${p.nome}</h3>`;
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
