let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

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

        desenharMenus();
        renderizar();
        iniciarTimer();
    } catch (e) { console.error("Erro ao carregar site:", e); }
}

function renderizar() {
    const mainGrid = document.getElementById("lista-produtos");
    const expGrid = document.getElementById("grid-expirando");
    const sort = document.getElementById("sort-price").value;
    mainGrid.innerHTML = "";
    expGrid.innerHTML = "";

    if (filtroAtivo === "todos") {
        document.getElementById("secao-expirando").style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        if(exp) exp.produtos.forEach(p => expGrid.appendChild(criarCard(p)));

        // Agrupa por categoria
        categoriasData.forEach(cat => {
            if(cat.id === "expirando") return;
            const bloco = document.createElement("div");
            bloco.className = "category-block";
            bloco.innerHTML = `
                <div class="category-header">
                    <h2>${cat.nome}</h2>
                    <a href="#" class="btn-ver-mais" onclick="setFiltro('${cat.id}')">Ver mais</a>
                </div>
                <div class="grid-layout" id="grid-${cat.id}"></div>
            `;
            mainGrid.appendChild(bloco);
            
            let produtos = [...cat.produtos];
            ordenar(produtos, sort);
            produtos.forEach(p => document.getElementById(`grid-${cat.id}`).appendChild(criarCard(p)));
        });
    } else {
        document.getElementById("secao-expirando").style.display = "none";
        const container = document.createElement("div");
        container.className = "grid-layout";
        let lista = todosProdutos.filter(p => p.catId === filtroAtivo);
        ordenar(lista, sort);
        lista.forEach(p => container.appendChild(criarCard(p)));
        mainGrid.appendChild(container);
    }
}

function criarCard(p) {
    const a = document.createElement("a");
    a.className = "card";
    a.href = p.link;
    a.target = "_blank";
    a.innerHTML = `
        <img src="${p.imagem}" loading="lazy">
        <h3>${p.nome}</h3>
        <p class="preco">R$ ${p.preco}</p>
        <div class="btn-cta">IR PARA SITE OFICIAL</div>
    `;
    return a;
}

function setFiltro(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function ordenar(lista, critério) {
    if(critério === "low") lista.sort((a,b) => a.preco - b.preco);
    if(critério === "high") lista.sort((a,b) => b.preco - a.preco);
}

// BUSCA COM LOCALIZAÇÃO EXATA
document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    if(val.length === 0) { renderizar(); return; }

    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(val));
    const mainGrid = document.getElementById("lista-produtos");
    mainGrid.innerHTML = `<div class="grid-layout" id="busca-grid"></div>`;
    
    res.forEach(p => {
        const card = criarCard(p);
        if(p.nome.toLowerCase() === val) {
            card.classList.add("highlight-search");
            setTimeout(() => card.scrollIntoView({behavior: 'smooth', block: 'center'}), 100);
        }
        document.getElementById("busca-grid").appendChild(card);
    });
});

// Funções de menu e timer seguem a lógica anterior...
carregarSite();
