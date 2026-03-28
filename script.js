let categoriasData = [];
let rodapéExpandido = false;
let produtosInfinito = []; // Lista para scroll infinito
let proximaPaginaInfinito = 0;
let carregandoInfinito = false;

// Configurações
const PRODUTOS_POR_PAGINA_INFINITO = 8; 

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        // Preparar lista unificada para scroll infinito (excluindo os já mostrados no hero)
        produtosInfinito = categoriasData.flatMap(cat => cat.produtos);

        preencherMenus();
        renderizarProdutosIniciais();
        iniciarTimer();
        
        // Ativar Scroll Infinito
        window.addEventListener('scroll', checarScrollInfinito);
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

function preencherMenus() {
    const dropdownDt = document.getElementById("menu-categorias-dt");
    const mobileBar = document.getElementById("mobile-category-filter");
    const footerCats = document.getElementById("footer-cats-grid");

    // Mapeamento de ícones fictícios para o footer (conforme imagem)
    const iconesMap = {
        "expirando": "fas fa-bolt",
        "casa_moveis": "fas fa-couch",
        "ferramentas": "fas fa-tools",
        "tecnologia": "fas fa-mobile-alt",
        "veiculos": "fas fa-car",
        "decoracao": "fas fa-paint-roller",
        "esportes": "fas fa-running",
        "acessorios": "fas fa-watch-circle",
        "outras": "fas fa-ellipsis-h"
    };

    categoriasData.forEach((cat, index) => {
        // Desktop Dropdown
        const dLink = document.createElement("a");
        dLink.href = `#${cat.id}`;
        dLink.innerText = cat.nome;
        dLink.onclick = (e) => filtrar(e, cat.id);
        dropdownDt.appendChild(dLink);

        // Mobile Bar
        const mLink = document.createElement("a");
        mLink.className = "mob-item";
        mLink.innerText = cat.nome;
        mLink.onclick = (e) => filtrar(e, cat.id);
        mobileBar.appendChild(mLink);

        // Footer Grid (Idêntico ao ML)
        const fCard = document.createElement("a");
        fCard.className = `cat-card-ml ${index > 5 ? 'hidden' : ''}`; // Mostra os 6 primeiros
        const iconeClass = iconesMap[cat.id] || "fas fa-tag";
        fCard.innerHTML = `<i class="${iconeClass}"></i><span>${cat.nome}</span>`;
        fCard.onclick = (e) => filtrar(e, cat.id);
        footerCats.appendChild(fCard);
    });
}

function renderizarProdutosIniciais() {
    const container = document.getElementById("container-categorias");
    const gridExp = document.getElementById("grid-expirando");
    
    // Limpar
    container.innerHTML = "";
    gridExp.innerHTML = "";

    // 1. Renderizar Hero Destaques (Expirando - apenas os 4 primeiros)
    const exp = categoriasData.find(c => c.id === "expirando");
    if(exp) {
        exp.produtos.slice(0, 4).forEach(p => gridExp.appendChild(criarCard(p, true)));
    }

    // 2. Renderizar Seções de Categorias
    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        
        const section = document.createElement("section");
        section.className = "category-section";
        section.id = cat.id;
        section.innerHTML = `
            <h2 class="category-title" style="margin: 60px 0 30px; font-size: 26px; color: #666; font-weight: 300;">
                ${cat.nome}
            </h2>
            <div id="grid-${cat.id}" class="flash-grid" style="background:none;"></div>
            <div class="category-show-more-container">
                <button class="btn-category-show-more" onclick="carregarMaisCategoria('${cat.id}')">Ver mais ${cat.nome}</button>
            </div>
        `;
        
        const grid = section.querySelector(".flash-grid");
        // Mostra os 4 primeiros da categoria inicialmente
        cat.produtos.slice(0, 4).forEach(p => grid.appendChild(criarCard(p, false)));
        container.appendChild(section);
    });
}

// Botão "Ver Mais" para Categorias Específicas
function carregarMaisCategoria(id) {
    const grid = document.getElementById(`grid-${id}`);
    const categoria = categoriasData.find(c => c.id === id);
    const produtosMostradosCount = grid.querySelectorAll('.card').length;
    
    if(categoria && produtosMostradosCount < categoria.produtos.length) {
        // Carrega mais 4
        categoria.produtos.slice(produtosMostradosCount, produtosMostradosCount + 4).forEach(p => {
            grid.appendChild(criarCard(p, false));
        });
    }

    // Esconde o botão se todos foram mostrados
    if(grid.querySelectorAll('.card').length >= categoria.produtos.length) {
        event.target.parentElement.style.display = 'none';
    }
}

// Scroll Infinito - Lógica
function checarScrollInfinito() {
    if (carregandoInfinito) return;

    // Detecta fim da página (300px antes)
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
        carregarMaisProdutosInfinito();
    }
}

function carregarMaisProdutosInfinito() {
    carregandoInfinito = true;
    const loading = document.getElementById("loading");
    loading.style.display = 'block';

    setTimeout(() => { // Simula delay de rede
        const grid = document.getElementById("grid-produtos-infinito");
        
        const inicio = proximaPaginaInfinito * PRODUTOS_POR_PAGINA_INFINITO;
        const fim = inicio + PRODUTOS_POR_PAGINA_INFINITO;
        
        const novosProdutos = produtosInfinito.slice(inicio, fim);
        
        novosProdutos.forEach(p => {
            grid.appendChild(criarCard(p, false));
        });

        proximaPaginaInfinito++;
        loading.style.display = 'none';
        carregandoInfinito = novosProdutos.length === PRODUTOS_POR_PAGINA_INFINITO; // Desativa se não houver mais
    }, 800);
}

function filtrar(e, id) {
    e.preventDefault();
    const element = document.getElementById(id);
    if(element) {
        const offset = 160; // Ajustado para novo header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
}

function criarCard(p, isFlash) {
    const a = document.createElement("a");
    a.href = p.link;
    a.className = "card";
    a.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}">
        <div class="card-info">
            <h3>${p.nome}</h3>
            <div class="preco">R$ ${p.preco}</div>
            ${isFlash ? '<span style="color: #00a650; font-size: 13px; font-weight: bold; margin-top: auto;">OFERTA RELÂMPAGO</span>' : ''}
        </div>
    `;
    return a;
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

// Expandir/Colapsar Rodapé
function toggleFooterCategorias() {
    rodapéExpandido = !rodapéExpandido;
    const grid = document.getElementById("footer-cats-grid");
    const cardsHidden = grid.querySelectorAll(".cat-card-ml.hidden");
    const cardsVisible = grid.querySelectorAll(".cat-card-ml:not(.hidden)");

    if(rodapéExpandido) {
        grid.querySelectorAll(".cat-card-ml").forEach(c => c.classList.remove("hidden"));
        document.getElementById("btn-mostrar-mais-footer").innerHTML = 'Mostrar menos <i class="fas fa-chevron-up"></i>';
    } else {
        // Esconde a partir do 6º
        grid.querySelectorAll(".cat-card-ml").forEach((c, index) => {
            if(index > 5) c.classList.add("hidden");
        });
        document.getElementById("btn-mostrar-mais-footer").innerHTML = 'Mostrar mais <i class="fas fa-chevron-down"></i>';
    }
}

carregarSite();
