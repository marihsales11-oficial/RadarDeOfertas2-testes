let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridPrincipal = document.getElementById("lista-produtos");
const gridExpirando = document.getElementById("grid-expirando");
const secaoExpirando = document.getElementById("secao-expirando");
const menuTopo = document.getElementById("menu-topo");
const sidebarMenu = document.getElementById("sidebar-cats");
const footerCats = document.getElementById("footer-cats");

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;

        // Processa produtos
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                p.catId = cat.id;
                if(cat.id !== "expirando") todosProdutos.push(p);
            });
        });

        montarMenus();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar:", e); }
}

function montarMenus() {
    const addBotaoTodos = (container, classe) => {
        const btn = document.createElement("div");
        btn.className = classe; btn.innerHTML = "<strong>⭐ TODAS</strong>";
        btn.onclick = () => { filtroAtivo = "todos"; renderizar(); };
        container.appendChild(btn);
    };

    addBotaoTodos(menuTopo, "nav-link");
    addBotaoTodos(sidebarMenu, "cat-item");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome;
        t.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        menuTopo.appendChild(t);

        // Sidebar
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = cat.nome;
        s.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        sidebarMenu.appendChild(s);

        // Footer
        const f = document.createElement("div");
        f.className = "cat-card";
        f.innerHTML = `<img src="${cat.icone}"><p>${cat.nome.split(',')[0]}</p>`;
        f.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerCats.appendChild(f);
    });
}

function renderizar() {
    gridPrincipal.innerHTML = "";
    gridExpirando.innerHTML = "";
    const sort = document.getElementById("sort-price").value;

    // 1. Lógica Ofertas Expirando (Sempre visível se filtro for 'todos')
    const catExp = categoriasData.find(c => c.id === "expirando");
    if(filtroAtivo === "todos" && catExp) {
        secaoExpirando.style.display = "block";
        catExp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    // 2. Lógica Grid Principal
    let lista = filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo);
    
    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

    document.getElementById("titulo-pagina").innerText = filtroAtivo === "todos" ? "Todos os Produtos" : `Categoria: ${filtroAtivo}`;
    lista.forEach(p => gridPrincipal.appendChild(criarCard(p)));
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

function iniciarTimer() {
    setInterval(() => {
        const agora = new Date();
        const fim = new Date(); fim.setHours(23, 59, 59);
        const diff = fim - agora;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function scrollCarousel(id) { document.getElementById(id).scrollBy({ left: 300, behavior: 'smooth' }); }

document.getElementById("sort-price").onchange = renderizar;
document.getElementById("busca").oninput = (e) => {
    const t = e.target.value.toLowerCase();
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(t));
    gridPrincipal.innerHTML = "";
    res.forEach(p => gridPrincipal.appendChild(criarCard(p)));
};

init();
