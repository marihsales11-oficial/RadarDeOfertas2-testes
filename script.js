function renderizar() {
    gridPrincipal.innerHTML = "";
    gridExpirando.innerHTML = "";
    const sort = document.getElementById("sort-price").value;

    // 1. Lógica da Seção Expirando
    if(filtroAtivo === "todos") {
        secaoExpirando.style.display = "block";
        const exp = categoriasData.find(c => c.id === "expirando");
        if(exp) exp.produtos.forEach(p => gridExpirando.appendChild(criarCard(p)));
    } else {
        secaoExpirando.style.display = "none";
    }

    // 2. Organização dos Produtos (Agrupado por Categoria)
    if(filtroAtivo === "todos") {
        categoriasData.forEach(cat => {
            if(cat.id === "expirando") return;
            
            // Cria uma seção para cada categoria
            const section = document.createElement("section");
            section.className = "category-section";
            section.innerHTML = `
                <div class="category-title">
                    ${cat.nome}
                    <a href="#" onclick="setFiltro('${cat.id}')">Ver mais</a>
                </div>
                <div class="grid-layout" id="grid-${cat.id}"></div>
            `;
            gridPrincipal.appendChild(section);

            let produtosCat = [...cat.produtos];
            ordenarLista(produtosCat, sort);

            const container = document.getElementById(`grid-${cat.id}`);
            produtosCat.forEach(p => container.appendChild(criarCard(p)));
        });
        document.getElementById("titulo-pagina").innerText = "Destaques por Categoria";
    } else {
        // Visualização de Categoria Única
        let lista = todosProdutos.filter(p => p.catId === filtroAtivo);
        ordenarLista(lista, sort);
        
        const wrapper = document.createElement("div");
        wrapper.className = "grid-layout";
        document.getElementById("titulo-pagina").innerText = `Categoria: ${filtroAtivo}`;
        lista.forEach(p => wrapper.appendChild(criarCard(p)));
        gridPrincipal.appendChild(wrapper);
    }
}

// Função auxiliar de ordenação
function ordenarLista(lista, sort) {
    if(sort === "low") lista.sort((a,b) => parseFloat(a.preco) - parseFloat(b.preco));
    if(sort === "high") lista.sort((a,b) => parseFloat(b.preco) - parseFloat(a.preco));
}

// Facilitador para os links internos
function setFiltro(id) {
    filtroAtivo = id;
    renderizar();
    window.scrollTo(0,0);
}

// --- BUSCA AVANÇADA ---
document.getElementById("busca").addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase();
    if(val.length === 0) { renderizar(); return; }

    // Remove destaques anteriores
    document.querySelectorAll('.card').forEach(c => c.classList.remove('highlight'));

    // Filtra e Renderiza apenas os resultados da busca de forma linear para facilitar achados
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(val));
    
    gridPrincipal.innerHTML = `<div class="grid-layout" id="busca-container"></div>`;
    const container = document.getElementById("busca-container");
    
    res.forEach(p => {
        const card = criarCard(p);
        // Se for o nome exato, destaca e rola até ele
        if(p.nome.toLowerCase() === val) {
            card.classList.add('highlight');
            setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
        container.appendChild(card);
    });
});
