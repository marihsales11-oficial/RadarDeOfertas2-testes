// Adicione estas funções ao seu script.js

// Escutador para a tecla "Enter" e clique no botão
document.getElementById('input-busca').addEventListener('keyup', (e) => {
    executarBusca(e.target.value);
});

document.getElementById('btn-busca').addEventListener('click', () => {
    const termo = document.getElementById('input-busca').value;
    executarBusca(termo);
});

function executarBusca(termo) {
    const query = termo.toLowerCase().trim();
    const feed = document.getElementById("feed-infinito");
    const flashSection = document.querySelector(".flash-deals-hero");

    if (query.length === 0) {
        // Se vazio, restaura o feed original
        renderizarExpirando();
        renderizarFeedCompleto();
        flashSection.style.display = "block";
        return;
    }

    // Esconde ofertas relâmpago durante a busca para focar nos resultados
    flashSection.style.display = "none";
    feed.innerHTML = `<h2 class="section-title">Resultados para: "${termo}"</h2><div class="search-results-grid"></div>`;
    const resultsGrid = feed.querySelector(".search-results-grid");
    resultsGrid.style.display = "grid";
    resultsGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    resultsGrid.style.gap = "20px";

    let encontrou = false;

    categoriasData.forEach(cat => {
        cat.produtos.forEach(p => {
            if (p.nome.toLowerCase().includes(query) || cat.nome.toLowerCase().includes(query)) {
                const wrapper = document.createElement("div");
                wrapper.appendChild(criarCardHTML(p));
                resultsGrid.appendChild(wrapper);
                encontrou = true;
            }
        });
    });

    if (!encontrou) {
        feed.innerHTML = `<div style="text-align:center; padding: 50px;">
            <h3>Nenhum produto encontrado para "${termo}"</h3>
            <p>Tente palavras mais genéricas ou verifique a ortografia.</p>
        </div>`;
    }
}
