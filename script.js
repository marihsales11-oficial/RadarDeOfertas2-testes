let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;

        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                p.catId = cat.id;
                p.catNome = cat.nome;
                if(cat.id !== "expirando") todosProdutos.push(p);
            });
        });

        desenharMenus();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar:", e); }
}

function desenharMenus() {
    const menuTopo = document.getElementById("menu-topo");
    const sidebarMenu = document.getElementById("sidebar-cats");
    const footerLinks = document.getElementById("footer-links");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;
        
        const linkHTML = `<a class="nav-link" onclick="setFiltro('${cat.id}')">${cat.nome}</a>`;
        menuTopo.insertAdjacentHTML('beforeend', linkHTML);
        
        const sideHTML = `<div class="cat-item" onclick="setFiltro('${cat.id}')">${cat.nome}</div>`;
        sidebarMenu.insertAdjacentHTML('beforeend', sideHTML);

        const footHTML = `<li onclick="setFiltro('${cat.id}')">${cat.nome}</li>`;
        footerLinks.insertAdjacentHTML('beforeend', footHTML);
    });
}

function setFiltro(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderizar() {
    const container = document.getElementById("secoes-categorias");
    const buscaRes = document.getElementById("busca-resultado");
    const secExpirando = document.getElementById("secao-expirando");
    
    container.innerHTML = "";
    buscaRes.style.display = "none";
    secExpirando.style.display = filtroAtivo === "todos" ? "block" : "none";

    if (filtroAtivo === "todos") {
        // Renderiza Ofertas Expirando
        const expData = categoriasData.find(c => c.id === "expirando");
        renderizarLinha("grid-expirando", expData.produtos);

        // Renderiza uma linha para cada categoria
        categoriasData.forEach(cat => {
            if(cat.id === "expirando") return;
            const section = document.createElement("section");
            section.className = "category-row";
            const rowId = `row-${cat.id}`;
            section.innerHTML = `
                <div class="section-header">
                    <h3>Mais vendidos em ${cat.nome} <a href="#">Ir para categoria</a></h3>
                </div>
                <div class="carousel-container">
                    <button class="arrow-btn prev" onclick="scrollCarousel('${rowId}', -1)"><i class="fas fa-chevron-left"></i></button>
                    <div class="grid-carrossel" id="${rowId}"></div>
                    <button class="arrow-btn next" onclick="scrollCarousel('${rowId}', 1)"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
            container.appendChild(section);
            renderizarLinha(rowId, cat.produtos);
        });
    } else {
        // Renderiza apenas a categoria selecionada (em grid aberto ou carrossel)
        const cat = categoriasData.find(c => c.id === filtroAtivo);
        const section = document.createElement("section");
        section.className = "category-row";
        section.innerHTML = `<h2>${cat.nome}</h2><div class="grid-carrossel search-grid" id="grid-foco"></div>`;
        container.appendChild(section);
        renderizarLinha("grid-foco", cat.produtos);
    }
}

function renderizarLinha(containerId, produtos) {
    const el = document.getElementById(containerId);
    const sort = document.getElementById("sort-price").value;
    let lista = [...produtos];

    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

    lista.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="img-container"><img src="${p.imagem}" loading="lazy"></div>
            <div class="info">
                <h3>${p.nome}</h3>
                <p class="preco">R$ ${parseFloat(p.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p class="envio">Chegará grátis amanhã</p>
                <span class="tag-full">FULL</span>
            </div>
        `;
        el.appendChild(card);
    });
    
    // Monitorar scroll para mostrar/esconder setas
    el.addEventListener('scroll', () => toggleArrows(containerId));
    setTimeout(() => toggleArrows(containerId), 100);
}

function scrollCarousel(id, direcao) {
    const el = document.getElementById(id);
    const scrollAmount = el.offsetWidth * 0.8;
    el.scrollBy({ left: direcao * scrollAmount, behavior: 'smooth' });
}

function toggleArrows(id) {
    const el = document.getElementById(id);
    const parent = el.parentElement;
    const prevBtn = parent.querySelector('.prev');
    const nextBtn = parent.querySelector('.next');
    
    if(prevBtn) prevBtn.style.display = el.scrollLeft > 10 ? "flex" : "none";
    if(nextBtn) nextBtn.style.display = (el.scrollLeft + el.offsetWidth < el.scrollWidth - 10) ? "flex" : "none";
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

document.getElementById("sort-price").onchange = renderizar;
document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    if(val.length > 2) {
        document.getElementById("secoes-categorias").innerHTML = "";
        document.getElementById("secao-expirando").style.display = "none";
        const resCont = document.getElementById("busca-resultado");
        const grid = document.getElementById("grid-busca");
        resCont.style.display = "block";
        grid.innerHTML = "";
        const filtrados = todosProdutos.filter(p => p.nome.toLowerCase().includes(val));
        renderizarLinha("grid-busca", filtrados);
    } else if (val.length === 0) {
        renderizar();
    }
});

carregarSite();
