let todosProdutos = [];
let categoriasOriginais = []; // Guardamos a estrutura original aqui

const container = document.getElementById("produtos");
const busca = document.getElementById("busca");

// 1. Carregamento dos dados
fetch("produtos.json")
    .then(res => res.json())
    .then(data => {
        categoriasOriginais = data.categorias;
        // Mapeia todos os produtos para o array global de busca
        data.categorias.forEach(cat => {
            cat.produtos.forEach(prod => todosProdutos.push(prod));
        });
        
        renderizarHome(); // Mostra as categorias inicialmente
    });

// 2. Função para renderizar o estado inicial (Categorias)
function renderizarHome() {
    container.innerHTML = ""; // Limpa o container
    categoriasOriginais.forEach(cat => {
        const section = document.createElement("div");
        section.classList.add("categoria");
        section.innerHTML = `
            <h2>${cat.nome}</h2>
            <div class="grid" id="grid-${cat.id}"></div>
        `;
        container.appendChild(section);

        const grid = document.getElementById(`grid-${cat.id}`);
        cat.produtos.forEach(prod => {
            grid.appendChild(criarCard(prod));
        });
    });
}

// 3. Função auxiliar para criar o card (se mantem igual)
function criarCard(prod) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <img src="${prod.imagem}">
        <div class="card-body">
            <h3>${prod.nome}</h3>
            <p>${prod.descricao}</p>
            <a class="btn" href="${prod.link}" target="_blank">Ver Oferta</a>
        </div>
    `;
    return card;
}

// 4. Lógica de BUSCA
busca.addEventListener("input", function() {
    const termo = this.value.toLowerCase().trim();

    if (termo === "") {
        renderizarHome(); // Volta ao normal sem dar reload na página
        return;
    }

    const resultados = todosProdutos.filter(prod =>
        prod.nome.toLowerCase().includes(termo) ||
        prod.descricao.toLowerCase().includes(termo)
    );

    exibirResultados(resultados);
});

// 5. Função para mostrar apenas os resultados da busca
function exibirResultados(produtos) {
    container.innerHTML = "<h2>Resultados da busca</h2>";
    
    if (produtos.length === 0) {
        container.innerHTML += "<p>Nenhum produto encontrado.</p>";
        return;
    }

    const grid = document.createElement("div");
    grid.classList.add("grid");

    produtos.forEach(prod => {
        grid.appendChild(criarCard(prod));
    });

    container.appendChild(grid);
}
