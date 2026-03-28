let categoriasData = [];
let filtroAtivo = "todos";

const containerCategorias = document.getElementById("container-categorias");
const gridExpirando = document.getElementById("grid-expirando");
const secaoExpirando = document.getElementById("secao-expirando");
const menuTopo = document.getElementById("menu-topo");
const sidebarMenu = document.getElementById("sidebar-cats");
const footerCats = document.getElementById("footer-cats");

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar:", e); }
}

function desenharInterface() {
    const criarOpcaoTodas = (parent, className) => {
        const el = document.createElement("div");
        el.className = className; el.innerHTML = "<strong>⭐ TODAS</strong>";
        el.onclick = () => { filtroAtivo = "todos"; renderizar(); window.scrollTo(0,0); };
        parent.appendChild(el);
    };

    criarOpcaoTodas(menuTopo, "nav-link");
    criarOpcaoTodas(sidebarMenu, "cat-item");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Nav Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome;
        t.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        menuTopo.appendChild(t);

        // Sidebar
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = cat.nome;
        s.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        sidebarMenu.appendChild(s);

        // Footer
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<div class="cat-card-img-box"><img src="${cat.icone}"></div><div class="cat-card-text-box"><p>${cat.nome}</p></div>`;
        c.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerCats.appendChild(c);
    });
}

function renderizar() {
    containerCategorias.innerHTML = "";
    gridExpirando.innerHTML = "";
    const sortValue = document.getElementById("sort-price").value;

    // Lógica para Ofertas Expirando
    if (filtroAtivo === "todos") {
        secaoExpirando.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        if (exp) exp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    // Renderização Organizada por Categorias
    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        if (filtroAtivo !== "todos" && filtroAtivo !== cat.id) return;

        let produtosParaExibir = [...cat.produtos];

        // Ordenação
        if(sortValue === "low") produtosParaExibir.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
        if(sortValue === "high") produtosParaExibir.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

        if (produtosParaExibir.length > 0) {
            const section = document.createElement("section");
            section.className = "category-section";
            section.innerHTML = `<h2 class="category-title">${cat.nome}</h2>`;
            
            const grid = document.createElement("div");
            grid.className = "grid-layout";
            
            produtosParaExibir.forEach(p => grid.appendChild(criarCard(p)));
            
            section.appendChild(grid);
            containerCategorias.appendChild(section);
        }
    });
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <h3>${p.nome}</h3>
        <p class="preco">R$ ${p.preco}</p>
        <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
    `;
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
        const t = document.getElementById("timer");
        if(t) t.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

document.getElementById("sort-price").onchange = renderizar;

document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    if(val === "") { renderizar(); return; }
    
    secaoExpirando.style.display = "none";
    containerCategorias.innerHTML = `<h2 class="category-title">Resultados para: "${val}"</h2>`;
    const gridBusca = document.createElement("div");
    gridBusca.className = "grid-layout";
    
    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            if(p.nome.toLowerCase().includes(val)) gridBusca.appendChild(criarCard(p));
        });
    });
    containerCategorias.appendChild(gridBusca);
});

carregarSite();
