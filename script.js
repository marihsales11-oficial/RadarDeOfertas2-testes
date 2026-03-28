let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridPrincipal = document.getElementById("lista-produtos");
const gridExpirando = document.getElementById("grid-expirando");
const secaoExpirando = document.getElementById("secao-expirando");
const menuTopo = document.getElementById("menu-topo");
const sidebarMenu = document.getElementById("sidebar-cats");
const footerCats = document.getElementById("footer-cats");
const campoBusca = document.getElementById("busca");
const btnBusca = document.getElementById("btn-busca");

async function carregarDados() {
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

        gerarMenus();
        renderizarGrid();
        iniciarTimer();
    } catch (e) { console.error("Erro crítico:", e); }
}

function gerarMenus() {
    // Botão Início
    const btnHome = document.createElement("a");
    btnHome.className = "nav-link"; btnHome.innerHTML = "<strong>🔥 TODAS</strong>";
    btnHome.onclick = () => aplicarFiltro("todos");
    menuTopo.appendChild(btnHome);

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Nav Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome.split(',')[0];
        t.onclick = () => aplicarFiltro(cat.id);
        menuTopo.appendChild(t);

        // Sidebar
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerHTML = `<i class="fas fa-chevron-right" style="font-size:10px"></i> ${cat.nome}`;
        s.onclick = () => aplicarFiltro(cat.id);
        sidebarMenu.appendChild(s);

        // Carousel Footer
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<i class="${cat.icone}"></i><p>${cat.nome.split(' ')[0]}</p>`;
        c.onclick = () => aplicarFiltro(cat.id);
        footerCats.appendChild(c);
    });
}

function aplicarFiltro(id) {
    filtroAtivo = id;
    renderizarGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarGrid(customList = null) {
    gridPrincipal.innerHTML = "";
    gridExpirando.innerHTML = "";
    
    // Ofertas Expirando (Sempre visíveis na home)
    if(filtroAtivo === "todos" && !customList) {
        secaoExpirando.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    let lista = customList || (filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo));

    // Ordenação
    const sort = document.getElementById("sort-price").value;
    if(sort === "low") lista.sort((a,b) => a.preco - b.preco);
    if(sort === "high") lista.sort((a,b) => b.preco - a.preco);

    document.getElementById("titulo-pagina").innerText = customList ? "Resultados da Busca" : (filtroAtivo === "todos" ? "Ofertas em Destaque" : "Categoria Selecionada");
    
    lista.forEach(p => gridPrincipal.appendChild(criarCard(p)));
    
    if(lista.length === 0) gridPrincipal.innerHTML = "<p style='padding:20px'>Nenhum produto encontrado.</p>";
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}" loading="lazy"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>`;
    return d;
}

// Busca Robusta
function realizarBusca() {
    const termo = campoBusca.value.toLowerCase().trim();
    if(!termo) { renderizarGrid(); return; }
    
    const resultados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarGrid(resultados);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

btnBusca.onclick = realizarBusca;
campoBusca.onkeypress = (e) => { if(e.key === "Enter") realizarBusca(); };

function scrollCarousel(id, dir) {
    const container = document.getElementById(id);
    const scrollAmount = 300;
    container.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
}

function iniciarTimer() {
    setInterval(() => {
        const agora = new Date();
        const fim = new Date(); fim.setHours(23, 59, 59);
        const d = fim - agora;
        const h = Math.floor(d/3600000).toString().padStart(2,'0');
        const m = Math.floor((d%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((d%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

document.getElementById("sort-price").onchange = () => renderizarGrid();

carregarDados();        el.className = "cat-item"; el.innerHTML = `<i class="fas fa-tag"></i> ${nome}`;
        el.onclick = () => filtrar(id);
        sidebarMenu.appendChild(el);
    };

    // Botão Geral
    const btnHome = document.createElement("a");
    btnHome.className = "nav-link"; btnHome.innerHTML = "<strong>INÍCIO</strong>";
    btnHome.onclick = () => filtrar("todos");
    menuTopo.appendChild(btnHome);

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Menu Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome.split(',')[0];
        t.onclick = () => filtrar(cat.id);
        menuTopo.appendChild(t);

        // Sidebar
        criarOpcao(cat.nome, cat.id);

        // Carousel Rodapé com ícones FontAwesome
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<i class="${cat.icone} fa-2x" style="color:var(--secondary); margin-bottom:10px; display:block;"></i><p>${cat.nome.split(' ')[0]}</p>`;
        c.onclick = () => filtrar(cat.id);
        footerCats.appendChild(c);
    });
}

function filtrar(id) {
    filtroAtivo = id;
    renderizarGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarGrid(listaCustom = null) {
    gridPrincipal.innerHTML = "";
    gridExpirando.innerHTML = "";
    
    // Ofertas Expirando
    if(filtroAtivo === "todos") {
        secaoExpirando.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    let lista = listaCustom || (filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo));

    const sort = document.getElementById("sort-price").value;
    if(sort === "low") lista.sort((a,b) => a.preco - b.preco);
    if(sort === "high") lista.sort((a,b) => b.preco - a.preco);

    lista.forEach(p => gridPrincipal.appendChild(criarCard(p)));
    
    if(lista.length === 0) gridPrincipal.innerHTML = "<p>Nenhum produto encontrado nesta busca.</p>";
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" target="_blank" class="btn-comprar">VER NO SITE</a>`;
    return d;
}

// Lógica de Busca Melhorada
function executarBusca() {
    const termo = campoBusca.value.toLowerCase();
    if(!termo) { renderizarGrid(); return; }
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    filtroAtivo = "busca";
    renderizarGrid(res);
}

btnBusca.onclick = executarBusca;
campoBusca.onkeyup = (e) => { if(e.key === "Enter") executarBusca(); };

function scrollCarousel(id, dir) {
    const c = document.getElementById(id);
    c.scrollBy({ left: dir * 250, behavior: 'smooth' });
}

function iniciarCronometro() {
    setInterval(() => {
        const n = new Date(); const e = new Date(); e.setHours(23, 59, 59);
        const d = e - n;
        const h = Math.floor(d/3600000).toString().padStart(2,'0');
        const m = Math.floor((d%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((d%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

document.getElementById("sort-price").onchange = () => renderizarGrid();

iniciarSite();
