let categoriasData = [];
let filtroAtivo = "todos";
let expandido = false;

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error(e); }
}

function desenharInterface() {
    const filtrar = (id) => {
        filtroAtivo = id;
        renderizar();
        window.scrollTo(0, 0);
    };

    // Preencher menus e filtros
    categoriasData.forEach((cat, index) => {
        if(cat.id === "expirando") return;

        // Nav Topo & Mobile Filter
        const mobLink = document.createElement("a");
        mobLink.className = "mob-filter-item";
        mobLink.innerText = cat.nome;
        mobLink.onclick = () => filtrar(cat.id);
        document.getElementById("mobile-category-filter").appendChild(mobLink);

        // Grade do Footer (Estilo ML)
        const c = document.createElement("a");
        c.href = "javascript:void(0)";
        c.className = `cat-card-ml ${index > 6 ? 'hidden' : ''}`; // Esconde após o 6º item
        c.innerHTML = `<img src="${cat.icone}"><span>${cat.nome}</span>`;
        c.onclick = () => filtrar(cat.id);
        document.getElementById("footer-cats").appendChild(c);
    });
}

function toggleCategorias() {
    expandido = !expandido;
    const cards = document.querySelectorAll('.cat-card-ml');
    const btn = document.getElementById('btn-mostrar-mais');
    
    cards.forEach((card, index) => {
        if (index > 6) {
            card.classList.toggle('hidden', !expandido);
        }
    });

    btn.innerHTML = expandido ? 
        'Mostrar menos categorias <i class="fas fa-chevron-up"></i>' : 
        'Mostrar mais categorias <i class="fas fa-chevron-down"></i>';
}

function renderizar() {
    const container = document.getElementById("container-categorias");
    container.innerHTML = "";
    
    // Ofertas Expirando
    const secaoExp = document.getElementById("secao-expirando");
    const gridExp = document.getElementById("grid-expirando");
    gridExp.innerHTML = "";
    
    if (filtroAtivo === "todos") {
        secaoExp.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));
    } else {
        secaoExp.style.display = "none";
    }

    // Categorias com Títulos Clicáveis
    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        if (filtroAtivo !== "todos" && filtroAtivo !== cat.id) return;

        const section = document.createElement("section");
        section.className = "category-section";
        
        // Título como Link
        section.innerHTML = `
            <a href="javascript:void(0)" class="category-title-link" onclick="ativarFiltro('${cat.id}')">
                <h2 class="category-title">${cat.nome}</h2>
            </a>
        `;
        
        const grid = document.createElement("div");
        grid.className = "grid-layout";
        cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
        
        section.appendChild(grid);
        container.appendChild(section);
    });
}

// Função global para ser chamada pelo clique no título
window.ativarFiltro = (id) => {
    filtroAtivo = id;
    renderizar();
    window.scrollTo(0,0);
};

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" class="btn-comprar">VER OFERTA</a>`;
    return d;
}

// ... (iniciarTimer e busca permanecem iguais) ...
carregarSite();
