let categoriasData = [];
let todosProdutos = [];
let filtroAtivo = "todos";

async function carregarSite() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        // Achata todos os produtos para busca rápida
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                p.catId = cat.id;
                p.catNome = cat.nome;
                todosProdutos.push(p);
            });
        });

        desenharInterface();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error(e); }
}

function desenharInterface() {
    const megaMenu = document.getElementById("mega-menu");
    const mobileFilter = document.getElementById("mobile-category-filter");
    const sidebar = document.getElementById("sidebar-cats");

    categoriasData.forEach(cat => {
        if(cat.id === "expirando") return;

        // Mega Menu Desktop
        const link = document.createElement("a");
        link.innerText = cat.nome;
        link.onclick = () => ativarFiltro(cat.id);
        megaMenu.appendChild(link);

        // Mobile Filter
        const mobLink = document.createElement("a");
        mobLink.className = "mob-filter-item";
        mobLink.innerText = cat.nome;
        mobLink.onclick = () => ativarFiltro(cat.id);
        mobileFilter.appendChild(mobLink);

        // Sidebar
        const sideItem = document.createElement("div");
        sideItem.className = "cat-item";
        sideItem.innerText = cat.nome;
        sideItem.onclick = () => ativarFiltro(cat.id);
        sidebar.appendChild(sideItem);
    });
}

// BUSCA INTELIGENTE COM HIGHLIGHT
const inputBusca = document.getElementById("busca");
const suggestionsBox = document.getElementById("search-suggestions");

inputBusca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    suggestionsBox.innerHTML = "";

    if (termo.length > 0) {
        const matches = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 8);
        
        if (matches.length > 0) {
            suggestionsBox.style.display = "block";
            matches.forEach(p => {
                const div = document.createElement("div");
                div.className = "suggestion-item";
                
                // Sublinha a letra correspondente
                const regex = new RegExp(`(${termo})`, "gi");
                const textoHighlight = p.nome.replace(regex, `<span class="highlight">$1</span>`);
                
                div.innerHTML = `<i class="fas fa-search" style="margin-right:10px; color:#ccc;"></i> ${textoHighlight}`;
                
                // Se clicar ou se for o nome exato, vai direto ao produto
                div.onclick = () => {
                    inputBusca.value = p.nome;
                    irParaProduto(p);
                };
                suggestionsBox.appendChild(div);
            });
        } else {
            suggestionsBox.style.display = "none";
        }
    } else {
        suggestionsBox.style.display = "none";
    }
});

function irParaProduto(produto) {
    suggestionsBox.style.display = "none";
    // Filtra a categoria do produto e faz scroll até ele
    ativarFiltro(produto.catId);
    setTimeout(() => {
        const cards = document.querySelectorAll('.card h3');
        cards.forEach(h3 => {
            if(h3.innerText === produto.nome) {
                h3.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                h3.parentElement.style.boxShadow = "0 0 20px var(--accent)";
            }
        });
    }, 300);
}

function ativarFiltro(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizar() {
    const container = document.getElementById("container-categorias");
    const gridExp = document.getElementById("grid-expirando");
    const secaoExp = document.getElementById("secao-expirando");
    container.innerHTML = "";
    gridExp.innerHTML = "";

    if (filtroAtivo === "todos") {
        secaoExp.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        exp.produtos.forEach(p => gridExp.appendChild(criarCard(p)));
    } else {
        secaoExp.style.display = "none";
    }

    categoriasData.forEach(cat => {
        if (cat.id === "expirando") return;
        if (filtroAtivo !== "todos" && filtroAtivo !== cat.id) return;

        const section = document.createElement("section");
        section.className = "category-section";
        section.innerHTML = `<h2 class="category-title">${cat.nome}</h2><div class="grid-layout"></div>`;
        const grid = section.querySelector(".grid-layout");
        cat.produtos.forEach(p => grid.appendChild(criarCard(p)));
        container.appendChild(section);
    });
}

function criarCard(p) {
    const d = document.createElement("div"); d.className = "card";
    d.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>`;
    return d;
}

// Fecha sugestões ao clicar fora
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-row")) suggestionsBox.style.display = "none";
});

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

carregarSite();
