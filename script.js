let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        if (!res.ok) throw new Error('Falha ao carregar JSON');
        const data = await res.json();
        categoriasData = data.categorias;

        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                p.catId = cat.id;
                if(cat.id !== "expirando") todosProdutos.push(p);
            });
        });

        desenharInterface();
        renderizar();
        iniciarTimer();
        // Inicializa as setas após um pequeno delay para o DOM carregar
        setTimeout(() => updateArrows('footer-cats'), 300);
    } catch (e) { console.error("Erro ao carregar o site:", e); }
}

function desenharInterface() {
    const menuTopo = document.getElementById("menu-topo");
    const sidebarMenu = document.getElementById("sidebar-cats");
    const footerCats = document.getElementById("footer-cats");

    if (!menuTopo || !footerCats) return;

    menuTopo.innerHTML = `<a class="nav-link" onclick="filtrar('todos')"><strong>⭐ TODAS</strong></a>`;
    sidebarMenu.innerHTML = "";
    footerCats.innerHTML = "";

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        menuTopo.insertAdjacentHTML('beforeend', `<a class="nav-link" onclick="filtrar('${cat.id}')">${cat.nome}</a>`);
        sidebarMenu.insertAdjacentHTML('beforeend', `<div class="cat-item" onclick="filtrar('${cat.id}')">${cat.nome}</div>`);

        const card = `
            <div class="cat-card" onclick="filtrar('${cat.id}')">
                <div class="cat-card-img"><img src="${cat.icone}" alt="${cat.nome}"></div>
                <div class="cat-card-text"><p>${cat.nome}</p></div>
            </div>`;
        footerCats.insertAdjacentHTML('beforeend', card);
    });
}

function filtrar(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderizar() {
    const grid = document.getElementById("lista-produtos");
    const gridExp = document.getElementById("grid-expirando");
    const sort = document.getElementById("sort-price").value;
    
    grid.innerHTML = "";
    gridExp.innerHTML = "";

    if(filtroAtivo === "todos") {
        document.getElementById("secao-expirando").style.display = "block";
        const catExp = categoriasData.find(c => c.id === "expirando");
        if(catExp) catExp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));
    } else {
        document.getElementById("secao-expirando").style.display = "none";
    }

    let lista = (filtroAtivo === "todos") ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo);
    
    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

    document.getElementById("titulo-pagina").innerText = filtroAtivo === "todos" ? "Todos os Produtos" : `Categoria: ${filtroAtivo.toUpperCase()}`;
    lista.forEach(p => grid.appendChild(criarCard(p)));
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}" loading="lazy"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>`;
    return d;
}

function scrollCarousel(id, dir) {
    const el = document.getElementById(id);
    const scrollAmount = el.offsetWidth * 0.7;
    el.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    setTimeout(() => updateArrows(id), 500);
}

function updateArrows(id) {
    const el = document.getElementById(id);
    const leftBtn = document.getElementById('btn-prev');
    const rightBtn = document.getElementById('btn-next');
    if(!el || !leftBtn || !rightBtn) return;
    
    leftBtn.style.visibility = el.scrollLeft > 10 ? "visible" : "hidden";
    rightBtn.style.visibility = (el.scrollLeft + el.offsetWidth < el.scrollWidth - 10) ? "visible" : "hidden";
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
const footerCatsEl = document.getElementById('footer-cats');
if(footerCatsEl) footerCatsEl.addEventListener('scroll', () => updateArrows('footer-cats'));

carregarSite();
