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

grid.appendChild(card);

});

});

});
