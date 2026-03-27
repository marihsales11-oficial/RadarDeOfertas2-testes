fetch("produtos.json")
.then(response => response.json())
.then(data => {

const container = document.getElementById("produtos");

data.categorias.forEach(categoria => {

const bloco = document.createElement("div");

bloco.innerHTML = `
<h2>${categoria.nome}</h2>
<div class="grid" id="${categoria.id}"></div>
`;

container.appendChild(bloco);

const grid = document.getElementById(categoria.id);

categoria.produtos.forEach(produto => {

grid.innerHTML += `
<div class="card">
<img src="${produto.imagem}">
<div class="card-body">
<h3>${produto.nome}</h3>
<p>${produto.descricao}</p>

<a class="btn" href="${produto.link}" target="_blank">
Ver oferta segura
</a>

<div class="seguro">
Compra protegida no marketplace oficial.
</div>
</div>
</div>
`;

});

});

});