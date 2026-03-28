let categoriasData = [];
let filtroAtivo = "todos";

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro:", e); }
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobile-dropdown");
    menu.classList.toggle("active");
}

function desenharInterface() {
    const menuTopo = document.getElementById("menu-topo");
    const sidebarMenu = document.getElementById("sidebar-cats");
    const footerCats = document.getElementById("footer-cats");
    const mobileDropdown = document.getElementById("mobile-dropdown");

    const criarLink = (cat) => {
        const link = document.createElement("a");
        link.innerText = cat.nome;
        link.onclick = () => {
            filtrar(cat.id);
            document.getElementById("mobile-dropdown").classList.remove("active");
        };
        return link;
    };

    // Link "Todas" para Mobile e Desktop
    const todasCat = { nome: "⭐ TODAS AS CATEGORIAS", id: "todos" };
    mobileDropdown.appendChild(criarLink(todasCat));

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Desktop Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome;
        t.onclick = () => filtrar(cat.id);
        menuTopo.appendChild(t);

        // Sidebar
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = cat.nome;
        s.onclick = () => filtrar(cat.id);
        sidebarMenu.appendChild(s);

        // Mobile Dropdown
        mobileDropdown.appendChild(criarLink(cat));

        // Footer
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<div class="cat-card-img-box"><img src="${cat.icone}"></div>
                       <div class="cat-card-text-box"><p>${cat.nome}</p></div>`;
        c.onclick = () => filtrar(cat.id);
        footerCats.appendChild(c);
    });
}

function filtrar(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderizar() {
    const secoesCont = document.getElementById("secoes-por-categoria");
    const gridEsp = document.getElementById("grid-especifico");
    const gridExp = document.getElementById("grid-expirando");
    const secExp = document.getElementById("secao-expirando");

    secoesCont.innerHTML = "";
    gridEsp.innerHTML = "";
    gridExp.innerHTML = "";

    if (filtroAtivo === "todos") {
        gridEsp.style.display = "none";
        secoesCont.style.display = "block";
        secExp.style.display = "block";

        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));

        categoriasData.forEach(cat => {
            if (cat.id === "expirando" || cat.produtos.length === 0) return;
            
            const row = document.createElement("section");
            row.className = "category-row";
            const rowId = `row-${cat.id}`;
            row.innerHTML = `
                <div class="row-header">
                    <h3>${cat.nome}</h3>
                    <a onclick="filtrar('${cat.id}')">Ver mais</a>
                </div>
                <div class="row-inner responsive-row" id="${rowId}"></div>`;
            secoesCont.appendChild(row);
            const inner = document.getElementById(rowId);
            cat.produtos.forEach(p => inner.appendChild(criarCard(p)));
        });
    } else {
        secoesCont.style.display = "none";
        secExp.style.display = "none";
        gridEsp.style.display = "grid";
        const cat = categoriasData.find(c => c.id === filtroAtivo);
        cat.produtos.forEach(p => gridEsp.appendChild(criarCard(p)));
    }
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `
        <div class="tag-radar">OFERTA</div>
        <img src="${p.imagem}" loading="lazy">
        <div class="card-info">
            <h3>${p.nome}</h3>
            <p class="preco">R$ ${p.preco}</p>
            <p class="envio-fake">Chegará grátis amanhã</p>
            <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
        </div>`;
    return d;
}

function scrollCarousel(id, dir) {
    const el = document.getElementById(id);
    el.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const timer = document.getElementById("timer");
        if(timer) timer.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

carregarSite();
