let todosProdutos = [];
let categoriasData = [];
let filtroAtual = "todos";

const produtosContainer = document.getElementById("produtos-container");
const containerUrgente = document.getElementById("sessao-urgente");
const filterCategoriesList = document.getElementById("filter-categories-list");
const sortSelect = document.getElementById("sort-price");

fetch("produtos.json")
    .then(res => res.json())
    .then(data => {
        categoriasData = data.categorias;
        
        // Preparar Dados
        const listSide = document.createElement("a");
        listSide.className = "category-filter-item";
        listSide.innerText = "Ver Tudo";
        listSide.href = "#";
        listSide.onclick = () => filtrarPorCategoria("todos");
        filterCategoriesList.appendChild(listSide);

        data.categorias.forEach(cat => {
            // Preencher Sidebar
            const item = document.createElement("a");
            item.className = "category-filter-item";
            item.innerText = cat.nome;
            item.onclick = () => filtrarPorCategoria(cat.id);
            filterCategoriesList.appendChild(item);

            cat.produtos.forEach(p => {
                p.catId = cat.id;
                todosProdutos.push(p);
            });
        });
        
        renderizar();
        iniciarTimer();
    });

function filtrarPorCategoria(id) {
    filtroAtual = id;
    renderizar();
}

sortSelect.onchange = renderizar;

function renderizar() {
    produtosContainer.innerHTML = "";
    containerUrgente.innerHTML = "";
    
    let listaFiltrada = filtroAtual === "todos" ? todosProdutos : todosProdutos.filter(p => p.catId === filtroAtual);

    // Ordenação
    if (sortSelect.value === "low") {
        listaFiltrada.sort((a, b) => parseFloat(a.preco.replace('.','').replace(',','.')) - parseFloat(b.preco.replace('.','').replace(',','.')));
    } else if (sortSelect.value === "high") {
        listaFiltrada.sort((a, b) => parseFloat(b.preco.replace('.','').replace(',','.')) - parseFloat(a.preco.replace('.','').replace(',','.')));
    }

    // Se estiver em "Ver Tudo", mantém a separação visual por categoria
    if (filtroAtual === "todos" && sortSelect.value === "default") {
        categoriasData.forEach(cat => {
            const section = criarSecao(cat.nome, cat.produtos);
            if(cat.id === "expirando") containerUrgente.appendChild(section);
            else produtosContainer.appendChild(section);
        });
    } else {
        // Se houver filtro ou ordenação ativa, mostra grid único
        const section = criarSecao("Resultados", listaFiltrada);
        produtosContainer.appendChild(section);
    }
}

function criarSecao(titulo, prods) {
    const sec = document.createElement("section");
    sec.innerHTML = `<h2 class="categoria-titulo">${titulo}</h2><div class="grid"></div>`;
    const grid = sec.querySelector(".grid");
    prods.forEach(p => grid.appendChild(criarCard(p)));
    return sec;
}

function criarCard(prod) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <div class="badge">OFERTA</div>
        <img src="${prod.imagem}" alt="${prod.nome}">
        <h3>${prod.nome}</h3>
        <p class="preco-por">R$ ${prod.preco}</p>
        <a href="${prod.link}" target="_blank" class="btn-comprar">COMPRAR AGORA</a>
    `;
    return div;
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

// Busca
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    if (termo === "") { renderizar(); return; }
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    produtosContainer.innerHTML = "";
    containerUrgente.innerHTML = "";
    produtosContainer.appendChild(criarSecao(`Busca: ${termo}`, res));
});
