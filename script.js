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
                if(cat.id !== "expirando") todosProdutos.push(p);
            });
        });

        desenharInterface();
        renderizar();
        iniciarTimer();
        updateArrows('footer-cats');
    } catch (e) { console.error("Erro:", e); }
}

function desenharInterface() {
    const menuTopo = document.getElementById("menu-topo");
    const sidebarMenu = document.getElementById("sidebar-cats");
    const footerCats = document.getElementById("footer-cats");

    // Botão "TODAS"
    const todasBtn = `<a class="nav-link" onclick="filtrar('todos')"><strong>⭐ TODAS</strong></a>`;
    menuTopo.insertAdjacentHTML('beforeend', todasBtn);

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Menu Topo
        menuTopo.insertAdjacentHTML('beforeend', `<a class="nav-link" onclick="filtrar('${cat.id}')">${cat.nome}</a>`);

        // Sidebar
        sidebarMenu.insertAdjacentHTML('beforeend', `<div class="cat-item" onclick="filtrar('${cat.id}')">${cat.nome}</div>`);

        // Footer Carousel (22 categorias aqui)
        const card = `
            <div class="cat-card" onclick="filtrar('${cat.id}')">
                <div class="cat-card-img"><img src="${cat.icone}"></div>
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
        categoriasData.find(c => c.id === "expirando").produtos.forEach(p => gridExp.appendChild(criarCard(p)));
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
    const leftBtn = el.parentElement.querySelector('.left');
    const rightBtn = el.parentElement.querySelector('.right');
    leftBtn.style.display = el.scrollLeft > 10 ? "flex" : "none";
    rightBtn.style.display = (el.scrollLeft + el.offsetWidth < el.scrollWidth - 10) ? "flex" : "none";
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

document.getElementById("sort-price").onchange = renderizar;
document.getElementById('footer-cats').addEventListener('scroll', () => updateArrows('footer-cats'));
carregarSite();
