let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridProdutos = document.getElementById("lista-produtos");
const sidebarMenu = document.getElementById("sidebar-cats");
const menuTopo = document.getElementById("menu-topo");
const footerCats = document.getElementById("footer-cats");

// Carregamento de dados com tratamento de erro
async function carregarDados() {
    try {
        const response = await fetch('produtos.json');
        if (!response.ok) throw new Error("Erro ao carregar JSON");
        const data = await response.json();
        
        categoriasData = data.categorias;
        
        // Achata todos os produtos em uma lista única
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                p.catId = cat.id;
                todosProdutos.push(p);
            });
        });

        setupInterface();
        renderizar();
    } catch (error) {
        console.error("Erro crítico:", error);
        gridProdutos.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding:50px;'>Ops! Não foi possível carregar os produtos. Verifique se o arquivo 'produtos.json' está na mesma pasta.</p>";
    }
}

function setupInterface() {
    // Botão "Todas as Categorias"
    const criarBtnTodos = (container, classe) => {
        const btn = document.createElement("div");
        btn.className = classe;
        btn.innerHTML = "<strong>⭐ TODAS</strong>";
        btn.onclick = () => { filtroAtivo = "todos"; renderizar(); window.scrollTo(0,0); };
        container.appendChild(btn);
    };

    criarBtnTodos(menuTopo, "nav-link");
    criarBtnTodos(sidebarMenu, "cat-item");

    categoriasData.forEach(cat => {
        // Menu Topo
        const link = document.createElement("a");
        link.className = "nav-link";
        link.innerText = cat.nome;
        link.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        menuTopo.appendChild(link);

        // Sidebar
        const sideItem = document.createElement("div");
        sideItem.className = "cat-item";
        sideItem.innerText = cat.nome;
        sideItem.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        sidebarMenu.appendChild(sideItem);

        // Carrossel Rodapé
        const catCard = document.createElement("div");
        catCard.className = "cat-card";
        catCard.innerHTML = `<img src="${cat.icone}"><p>${cat.nome.split(' ')[1] || cat.nome}</p>`;
        catCard.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerCats.appendChild(catCard);
    });
}

function renderizar() {
    gridProdutos.innerHTML = "";
    const listaFiltrada = filtroAtivo === "todos" 
        ? todosProdutos 
        : todosProdutos.filter(p => p.catId === filtroAtivo);

    listaFiltrada.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
            <h3>${p.nome}</h3>
            <p class="preco">R$ ${p.preco}</p>
            <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
        `;
        gridProdutos.appendChild(card);
    });
}

function scrollCarousel(id) {
    document.getElementById(id).scrollBy({ left: 300, behavior: 'smooth' });
}

// Busca em Tempo Real
document.getElementById("busca").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const resultados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    
    gridProdutos.innerHTML = "";
    resultados.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" class="btn-comprar">VER OFERTA</a>`;
        gridProdutos.appendChild(card);
    });
});

// Inicializa
carregarDados();
