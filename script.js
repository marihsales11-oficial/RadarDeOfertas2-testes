let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridPrincipal = document.getElementById("lista-produtos");
const areaExpirando = document.getElementById("area-expirando");
const sidebarMenu = document.getElementById("sidebar-cats");
const menuTopo = document.getElementById("menu-categorias");

fetch("produtos.json")
    .then(res => res.json())
    .then(data => {
        categoriasData = data.categorias;
        
        // Lógica de interesse aleatório: Embaralha os produtos da categoria "recomendados"
        const recomendados = categoriasData.find(c => c.id === 'recomendados');
        if(recomendados) recomendados.produtos.sort(() => Math.random() - 0.5);

        setupInterface();
        renderizar();
        iniciarTimer();
    });

function setupInterface() {
    categoriasData.forEach(cat => {
        // Menu Lateral
        const itemSide = document.createElement("div");
        itemSide.className = "cat-item"; itemSide.innerText = cat.nome;
        itemSide.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        sidebarMenu.appendChild(itemSide);

        // Menu Topo (Shopee Style)
        const linkTop = document.createElement("a");
        linkTop.className = "nav-link"; linkTop.innerText = cat.nome;
        linkTop.href = `#${cat.id}`;
        menuTopo.appendChild(linkTop);

        cat.produtos.forEach(p => { p.catId = cat.id; todosProdutos.push(p); });
    });
}

function renderizar() {
    gridPrincipal.innerHTML = "";
    areaExpirando.innerHTML = "";

    let lista = filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo);
    
    // Ordenação
    const sort = document.getElementById("sort-price").value;
    if(sort === "low") lista.sort((a,b) => a.preco - b.preco);
    if(sort === "high") lista.sort((a,b) => b.preco - a.preco);

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
                    <div class="grid" id="grid-expirando"></div>
                `;
                areaExpirando.appendChild(wrapper);
                const grid = wrapper.querySelector("#grid-expirando");
                cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
            } else {
                const sec = document.createElement("section");
                sec.id = cat.id;
                sec.innerHTML = `<h2 style="margin: 20px 0; border-left: 5px solid #2d3277; padding-left: 10px;">${cat.nome}</h2><div class="grid"></div>`;
                const grid = sec.querySelector(".grid");
                cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
                gridPrincipal.appendChild(sec);
            }
        });
    } else {
        const sec = document.createElement("section");
        sec.innerHTML = `<h2 style="margin: 20px 0;">Resultados</h2><div class="grid"></div>`;
        const grid = sec.querySelector(".grid");
        lista.forEach(p => grid.appendChild(criarCard(p)));
        gridPrincipal.appendChild(sec);
    }
}

function criarCard(p) {
    const div = document.createElement("div"); div.className = "card";
    div.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" class="btn-comprar">VER OFERTA</a>`;
    return div;
}

function iniciarTimer() {
    setInterval(() => {
        const agora = new Date();
        const fim = new Date(); fim.setHours(23, 59, 59);
        const diff = fim - agora;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const el = document.getElementById("timer");
        if(el) el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

document.getElementById("sort-price").onchange = renderizar;
document.getElementById("busca").oninput = (e) => {
    const t = e.target.value.toLowerCase();
    if(!t) { renderizar(); return; }
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(t));
    areaExpirando.innerHTML = ""; gridPrincipal.innerHTML = "";
    gridPrincipal.appendChild(criarSecao(`Busca: ${t}`, res));
};
