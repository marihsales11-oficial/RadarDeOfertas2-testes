let categoriasData = [];
let filtroAtivo = "todos";

// Elementos do DOM
const containerCategorias = document.getElementById("container-categorias");
const gridExpirando = document.getElementById("grid-expirando");
const secaoExpirando = document.getElementById("secao-expirando");
const menuTopo = document.getElementById("menu-topo");
const sidebarMenu = document.getElementById("sidebar-cats");
const footerCats = document.getElementById("footer-cats");
const mobileFilter = document.getElementById("mobile-category-filter"); // Novo

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        if (!res.ok) throw new Error('Erro ao carregar JSON');
        const data = await res.json();
        categoriasData = data.categorias;
        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { 
        console.error("Erro Crítico:", e);
        containerCategorias.innerHTML = "<p style='text-align:center; padding:50px;'>Erro ao carregar produtos. Por favor, tente novamente mais tarde.</p>";
    }
}

function desenharInterface() {
    // Função auxiliar para gerenciar clique e scroll
    const definirFiltro = (id) => {
        filtroAtivo = id;
        renderizar();
        window.scrollTo(0,0);
    };

    // 1. Criar opção "TODAS" nos 4 menus
    const criarOpcaoTodas = (parent, className) => {
        const el = document.createElement(parent.tagName === 'NAV' ? 'a' : 'div');
        el.className = className; 
        el.innerHTML = "<strong>⭐ TODAS</strong>";
        if(parent.tagName === 'NAV') el.href = "#";
        el.onclick = (e) => { e.preventDefault(); definirFiltro("todos"); };
        parent.appendChild(el);
    };

    criarOpcaoTodas(menuTopo, "nav-link");
    criarOpcaoTodas(sidebarMenu, "cat-item");
    
    // Todas para Mobile (Link simples)
    const mTodas = document.createElement("a");
    mTodas.href = "#"; mTodas.innerText = "Todas"; mTodas.id = "mob-all";
    mTodas.onclick = (e) => { e.preventDefault(); definirFiltro("todos"); };
    mobileFilter.appendChild(mTodas);

    // 2. Preencher categorias
    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Nav Topo (Desktop)
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome; t.href = "#";
        t.onclick = (e) => { e.preventDefault(); definirFiltro(cat.id); };
        menuTopo.appendChild(t);

        // Sidebar (Desktop Médio)
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = cat.nome;
        s.onclick = () => definirFiltro(cat.id);
        sidebarMenu.appendChild(s);

        // Mobile Filter (Novo)
        const m = document.createElement("a");
        m.href = "#"; m.innerText = cat.nome; m.id = `mob-${cat.id}`;
        m.onclick = (e) => { e.preventDefault(); definirFiltro(cat.id); };
        mobileFilter.appendChild(m);

        // Footer Carousel (Corrigido CSS no style.css)
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `
            <div class="cat-card-img-box">
                <img src="${cat.icone}" alt="${cat.nome}" loading="lazy">
            </div>
            <div class="cat-card-text-box">
                <p>${cat.nome}</p>
            </div>
        `;
        c.onclick = () => definirFiltro(cat.id);
        footerCats.appendChild(c);
    });
}

function renderizar() {
    containerCategorias.innerHTML = "";
    gridExpirando.innerHTML = "";
    const sortValue = document.getElementById("sort-price").value;

    // Lógica Destaque Mobile Activo
    const linksMobile = mobileFilter.querySelectorAll('a');
    linksMobile.forEach(l => l.classList.remove('active'));
    const linkAtivoId = filtroAtivo === 'todos' ? 'mob-all' : `mob-${filtroAtivo}`;
    const linkAtivo = document.getElementById(linkAtivoId);
    if(linkAtivo) linkAtivo.classList.add('active');


    // Lógica para Ofertas Expirando (Apenas em "Todas")
    if (filtroAtivo === "todos") {
        secaoExpirando.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        if (exp && exp.produtos) exp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    // Renderização Organizada por Categorias
    let produtosEncontrados = false;

    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        if (filtroAtivo !== "todos" && filtroAtivo !== cat.id) return;

        let produtosParaExibir = [...cat.produtos];

        // Ordenação
        if(sortValue === "low") produtosParaExibir.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
        if(sortValue === "high") produtosParaExibir.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

        if (produtosParaExibir.length > 0) {
            produtosEncontrados = true;
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

    if(!produtosEncontrados) {
        containerCategorias.innerHTML = "<p style='text-align:center; padding:40px; color:#666;'>Nenhum produto encontrado nesta categoria.</p>";
    }
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    // Tratamento básico de preço para garantir 2 casas decimais
    const precoFormatado = parseFloat(p.preco).toFixed(2).replace('.', ',');
    
    d.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
        <h3>${p.nome}</h3>
        <p class="preco">R$ ${precoFormatado}</p>
        <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
    `;
    return d;
}

// Funções Utilitárias mantidas
function scrollCarousel(id, dir) {
    const el = document.getElementById(id);
    el.scrollBy({ left: dir * 300, behavior: 'smooth' });
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        if (diff <= 0) { document.getElementById("timer").innerText = "00:00:00"; return; }
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        const t = document.getElementById("timer");
        if(t) t.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// Eventos
document.getElementById("sort-price").onchange = renderizar;

document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase().trim();
    if(val === "") { renderizar(); return; }
    
    // Esconder tudo e mostrar busca
    secaoExpirando.style.display = "none";
    // Resetar destaques mobile
    mobileFilter.querySelectorAll('a').forEach(l => l.classList.remove('active'));

    containerCategorias.innerHTML = `<h2 class="category-title">Resultados para: "${val}"</h2>`;
    const gridBusca = document.createElement("div");
    gridBusca.className = "grid-layout";
    
    let achou = false;
    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            if(p.nome.toLowerCase().includes(val)) {
                gridBusca.appendChild(criarCard(p));
                achou = true;
            }
        });
    });

    if(achou) {
        containerCategorias.appendChild(gridBusca);
    } else {
        containerCategorias.innerHTML += "<p style='padding:20px; color:#666;'>Nenhum produto corresponde à sua busca.</p>";
    }
});

// Inicialização
carregarSite();
