let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridPrincipal = document.getElementById("lista-produtos");
const areaExpirando = document.getElementById("area-expirando");
const sidebarMenu = document.getElementById("sidebar-cats");
const menuTopo = document.getElementById("menu-categorias");

// 1. Carregar dados do JSON
fetch("produtos.json")
    .then(res => {
        if (!res.ok) throw new Error("Erro ao carregar JSON");
        return res.json();
    })
    .then(data => {
        categoriasData = data.categorias;
        
        // Interesse aleatório
        const rec = categoriasData.find(c => c.id === 'recomendados');
        if(rec) rec.produtos.sort(() => Math.random() - 0.5);

        setupInterface();
        renderizar();
        iniciarTimer();
    })
    .catch(err => {
        gridPrincipal.innerHTML = "<p style='padding:20px;'>Erro ao carregar ofertas. Verifique o arquivo produtos.json.</p>";
        console.error(err);
    });

// 2. Montar menus
function setupInterface() {
    sidebarMenu.innerHTML = "";
    menuTopo.innerHTML = "";
    
    categoriasData.forEach(cat => {
        // Sidebar
        const itemSide = document.createElement("div");
        itemSide.className = "cat-item"; itemSide.innerText = cat.nome;
        itemSide.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        sidebarMenu.appendChild(itemSide);

        // Menu Topo
        const linkTop = document.createElement("a");
        linkTop.className = "nav-link"; linkTop.innerText = cat.nome;
        linkTop.href = `#${cat.id}`;
        linkTop.onclick = (e) => { e.preventDefault(); filtroAtivo = cat.id; renderizar(); };
        menuTopo.appendChild(linkTop);

        cat.produtos.forEach(p => { p.catId = cat.id; todosProdutos.push(p); });
    });
}

// 3. Renderizar Grids e Carrosséis
function renderizar() {
    gridPrincipal.innerHTML = "";
    areaExpirando.innerHTML = "";

    let lista = filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo);
    const sort = document.getElementById("sort-price").value;
    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

    if(filtroAtivo === "todos" && sort === "default") {
        categoriasData.forEach(cat => {
            if(cat.id === "expirando") {
                const wrapper = document.createElement("div");
                wrapper.className = "expirando-wrapper";
                wrapper.innerHTML = `
                    <div class="expirando-header">
                        <h2><i class="fas fa-bolt"></i> ${cat.nome}</h2>
                        <div class="countdown-box" id="timer">00:00:00</div>
                    </div>
                    <div class="carousel-container">
                        <div class="grid" id="grid-expirando"></div>
                        <div class="nav-arrow" onclick="scrollGrid('grid-expirando')"><i class="fas fa-chevron-right"></i></div>
                    </div>
                `;
                areaExpirando.appendChild(wrapper);
                const grid = wrapper.querySelector("#grid-expirando");
                cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
            } else {
                const sec = document.createElement("section");
                sec.id = cat.id;
                sec.innerHTML = `
                    <h2 style="margin: 30px 0 15px 0; border-left: 5px solid #2d3277; padding-left: 10px; font-size: 1.4rem;">${cat.nome}</h2>
                    <div class="carousel-container">
                        <div class="grid" id="grid-${cat.id}"></div>
                        <div class="nav-arrow" onclick="scrollGrid('grid-${cat.id}')"><i class="fas fa-chevron-right"></i></div>
                    </div>
                `;
                const grid = sec.querySelector(".grid");
                cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
                gridPrincipal.appendChild(sec);
            }
        });
    } else {
        const sec = document.createElement("section");
        sec.innerHTML = `<h2 style="margin: 20px 0;">Exibindo ${filtroAtivo}</h2><div class="grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));"></div>`;
        const grid = sec.querySelector(".grid");
        lista.forEach(p => grid.appendChild(criarCard(p)));
        gridPrincipal.appendChild(sec);
    }
}

function scrollGrid(id) {
    const grid = document.getElementById(id);
    grid.scrollBy({ left: 400, behavior: 'smooth' });
}

function criarCard(p) {
    const div = document.createElement("div"); div.className = "card";
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <h3>${p.nome}</h3>
        <p class="preco">R$ ${p.preco}</p>
        <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
    `;
    return div;
}

function iniciarTimer() {
    setInterval(() => {
        const d = new Date(); const f = new Date(); f.setHours(23, 59, 59);
        const diff = f - d;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const el = document.getElementById("timer");
        if(el) el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

document.getElementById("sort-price").onchange = renderizar;
document.getElementById("busca").addEventListener("input", (e) => {
    const t = e.target.value.toLowerCase();
    if(!t) { renderizar(); return; }
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(t));
    areaExpirando.innerHTML = ""; gridPrincipal.innerHTML = "";
    const sec = document.createElement("section");
    sec.innerHTML = `<h2 style="margin: 20px 0;">Busca por: ${t}</h2><div class="grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));"></div>`;
    const grid = sec.querySelector(".grid");
    res.forEach(p => grid.appendChild(criarCard(p)));
    gridPrincipal.appendChild(sec);
});
