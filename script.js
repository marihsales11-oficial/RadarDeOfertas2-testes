let todosProdutos = [];

fetch("produtos.json")
.then(res => res.json())
.then(data => {

const container = document.getElementById("produtos");

data.categorias.forEach(cat => {

const section = document.createElement("div");
section.classList.add("categoria");

section.innerHTML = `
<h2>${cat.nome}</h2>
<div class="grid" id="${cat.id}"></div>
`;

container.appendChild(section);

const grid = document.getElementById(cat.id);

cat.produtos.forEach(prod => {

todosProdutos.push(prod);

const card = criarCard(prod);
grid.appendChild(card);

});

});

});

// função que cria o card
function criarCard(prod){

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

// BUSCA DE PRODUTOS
const busca = document.getElementById("busca");

busca.addEventListener("input", function(){

const termo = this.value.toLowerCase();
const container = document.getElementById("produtos");

if(termo === ""){
location.reload();
return;
}

container.innerHTML = "<h2>Resultados da busca</h2>";

const grid = document.createElement("div");
grid.classList.add("grid");

const resultados = todosProdutos.filter(prod =>
prod.nome.toLowerCase().includes(termo) ||
prod.descricao.toLowerCase().includes(termo)
);

resultados.forEach(prod => {
grid.appendChild(criarCard(prod));
});

container.appendChild(grid);

});
