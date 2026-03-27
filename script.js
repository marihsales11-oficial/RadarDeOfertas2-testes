let todosProdutos = [];
let categoriasData = [];
let filtroAtivo = "todos";

const gridProdutos = document.getElementById("lista-produtos");
const sidebarMenu = document.getElementById("sidebar-cats");
const menuTopo = document.getElementById("menu-topo");
const footerCats = document.getElementById("footer-cats");

fetch("produtos.json")
    .then(res => res.json())
    .then(data => {
        categoriasData = data.categorias;
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => { p.catId = cat.id; todosProdutos.push(p); });
        });
        setupInterface();
        renderizar();
    });

function setupInterface() {
    // Botão Todas as Categorias no Topo e Sidebar
    const btnTodos = document.createElement("a");
    btnTodos.className = "nav-link"; btnTodos.innerText = "⭐ Todas as Categorias";
    btnTodos.onclick = () => { filtroAtivo = "todos"; renderizar(); };
    menuTopo.appendChild(btnTodos);

    const sideTodos = document.createElement("div");
    sideTodos.className = "cat-item"; sideTodos.innerHTML = "<strong>⭐ Todas as Categorias</strong>";
    sideTodos.onclick = () => { filtroAtivo = "todos"; renderizar(); };
    sidebarMenu.appendChild(sideTodos);

    categoriasData.forEach(cat => {
        // Menu Topo
        const link = document.createElement("a");
        link.className = "nav-link"; link.innerText = cat.nome;
        link.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        menuTopo.appendChild(link);

        // Sidebar
        const sideItem = document.createElement("div");
        sideItem.className = "cat-item"; sideItem.innerText = cat.nome;
        sideItem.onclick = () => { filtroAtivo = cat.id; renderizar(); };
        sidebarMenu.appendChild(sideItem);

        // Carrossel Rodapé (Ícones)
        const catCard = document.createElement("div");
        catCard.className = "cat-card";
        catCard.innerHTML = `<img src="${cat.icone}"><p>${cat.nome}</p>`;
        catCard.onclick = () => { filtroAtivo = cat.id; renderizar(); window.scrollTo(0,0); };
        footerCats.appendChild(catCard);
    });
}

function renderizar() {
    gridProdutos.innerHTML = "";
    let lista = filtroAtivo === "todos" ? todosProdutos : todosProdutos.filter(p => p.catId === filtroAtivo);
    
    lista.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${p.imagem}" loading="lazy">
            <h3>${p.nome}</h3>
            <p class="preco">R$ ${p.preco}</p>
            <a href="${p.link}" target="_blank" class="btn-comprar">VER OFERTA</a>
        `;
        gridProdutos.appendChild(div);
    });
}

function scrollCarousel(id) {
    document.getElementById(id).scrollBy({ left: 200, behavior: 'smooth' });
}

document.getElementById("busca").oninput = (e) => {
    const t = e.target.value.toLowerCase();
    const res = todosProdutos.filter(p => p.nome.toLowerCase().includes(t));
    gridProdutos.innerHTML = "";
    res.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${p.imagem}"><h3>${p.nome}</h3><p class="preco">R$ ${p.preco}</p><a href="${p.link}" class="btn-comprar">VER OFERTA</a>`;
        gridProdutos.appendChild(div);
    });
};
