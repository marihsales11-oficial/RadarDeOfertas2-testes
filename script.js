let categoriasData = [];

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        
        configurarBuscaInteligente();
    } catch (e) { console.error(e); }
}

function configurarBuscaInteligente() {
    const input = document.getElementById('input-busca');
    const resultados = document.getElementById('busca-resultados');

    input.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        resultados.innerHTML = "";

        if (termo.length < 1) {
            resultados.style.display = 'none';
            return;
        }

        // Busca em todos os produtos de todas as categorias
        let matches = [];
        categoriasData.forEach(cat => {
            cat.produtos.forEach(p => {
                if (p.nome.toLowerCase().includes(termo)) {
                    matches.push({...p, catId: cat.id});
                }
            });
        });

        if (matches.length > 0) {
            resultados.style.display = 'block';
            matches.slice(0, 6).forEach(p => {
                const item = document.createElement('a');
                item.className = 'sugestao-item';
                item.href = `#cat-${p.catId}`; // Vai direto para a categoria
                item.innerHTML = `
                    <img src="${p.imagem}">
                    <div>
                        <strong>${p.nome}</strong><br>
                        <span style="color:#00a650">R$ ${p.preco}</span>
                    </div>
                `;
                item.onclick = () => { resultados.style.display = 'none'; };
                resultados.appendChild(item);
            });
        } else {
            resultados.style.display = 'none';
        }
    });

    // Fecha sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) resultados.style.display = 'none';
    });
}

function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    categoriasData.forEach((cat, index) => {
        if (index === 0) return;
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        
        section.innerHTML = `
            <h3 class="section-title">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollCarousel('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollCarousel('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${p.imagem}">
                <div class="card-info">
                    <h3>${p.nome}</h3>
                    <div class="preco-card">R$ ${p.preco}</div>
                    <div class="frete-label">Frete grátis</div>
                </div>
            `;
            track.appendChild(card);
        });
        feed.appendChild(section);
    });
}

function scrollCarousel(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const scrollAmount = track.clientWidth * 0.8;
    track.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

// Outras funções de renderização mantidas...
function renderizarMenus() {
    const navDT = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        navDT.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    categoriasData.slice(0, 8).forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        card.innerHTML = `<img src="${c.icone}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    categoriasData[0].produtos.forEach(p => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <img src="${p.imagem}">
            <div class="preco-card">R$ ${p.preco}</div>
            <p style="font-size:13px">${p.nome}</p>
        `;
        grid.appendChild(div);
    });
}

function iniciarTimer() {
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        document.getElementById("timer").innerText = `${h}:${m}:${s}`;
    }, 1000);
}

init();
iniciarTimer();
