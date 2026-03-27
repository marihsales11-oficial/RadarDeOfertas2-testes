let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridPrincipal = document.getElementById("lista-produtos");
const gridExpirando = document.getElementById("grid-expirando");
const secaoExpirando = document.getElementById("secao-expirando");
const menuTopo = document.getElementById("menu-topo");
const sidebarMenu = document.getElementById("sidebar-cats");
const footerCats = document.getElementById("footer-cats");
const footerLinks = document.getElementById("footer-links");

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
    } catch (e) { console.error("Erro:", e); }
}

function desenharInterface() {
    // Botão "TUDAS"
    const addAll = (parent, type) => {
        const el = document.createElement("div");
        el.className = type; el.innerHTML = "<strong>⭐ TODAS</strong>";
        el.onclick = () => { filtroAtivo = "todos"; renderizar(); window.scrollTo(0,0); };
        parent.appendChild(el);
    };

    addAll(menuTopo, "nav-link");
    addAll(sidebarMenu, "cat-item");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Topo
        const t = document.createElement("a");
        t.className = "nav-link"; t.innerText = cat.nome;
        t.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        menuTopo.appendChild(t);

        // Lateral
        const s = document.createElement("div");
        s.className = "cat-item"; s.innerText = cat.nome;
        s.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        sidebarMenu.appendChild(s);

        // Rodapé (Carousel)
        const c = document.createElement("div");
        c.className = "cat-card";
        c.innerHTML = `<img src="${cat.icone}"><p>${cat.nome.split(',')[0]}</p>`;
        c.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerCats.appendChild(c);

        // Footer Links
        const l = document.createElement("li");
        l.innerText = cat.nome;
        l.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerLinks.appendChild(l);
    });
}

function renderizar() {
    gridPrincipal.innerHTML = "";
    gridExpirando.innerHTML = "";
    const sort = document.getElementById("sort-price").value;

    // Seção Expirando
    if(filtroAtivo === "todos") {
        secaoExpirando.style.display = "block";
        categoriasData.find(c => c.id === "expirando").produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    let lista = filtroAtivo === "todos" ? [...todosProdutos] : todosProdutos.filter(p => p.catId === filtroAtivo);

    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));

    document.getElementById("titulo-pagina").innerText = filtroAtivo === "todos" ? "Todos os Produtos" : `Categoria: ${filtroAtivo.toUpperCase()}`;
    lista.forEach(p => gridPrincipal.appendChild(criarCard(p)));
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}" loading="lazy"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>`;
    return d;
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

function scrollCarousel(id) { document.getElementById(id).scrollBy({ left: 300, behavior: 'smooth' }); }

document.getElementById("sort-price").onchange = renderizar;
document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(val));
    gridPrincipal.innerHTML = "";
    res.forEach(p => gridPrincipal.appendChild(criarCard(p)));
});

carregarSite();
