let categoriasData = [];
let expandidoHome = false;

// CORREÇÃO DOS ÍCONES (Imagem 2) - Inserindo imagens corretas do ML
const iconesCorrigidos = {
    expirando: 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/deals.svg',
    informatica: 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/computing.svg',
    celulares: 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/telephony.svg',
    eletrodomesticos: 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/appliances.svg',
    eletronicos: 'https://http2.mlstatic.com/storage/homes-node/navigation/desktop/electronics.svg'
};

async function init() {
    try {
        const res = await fetch('produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        // Aplica os ícones corretos do Mercado Livre
        categoriasData.forEach(c => {
            if (iconesCorrigidos[c.id]) c.icone = iconesCorrigidos[c.id];
        });

        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        
        configurarBuscaInteligente();
    } catch (e) { console.error(e); }
}

// FUNCIONALIDADE DO FILTRO: Busca preditiva em tempo real
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
                if (p.nome.toLowerCase().includes(termo)) matches.push(p);
            });
        });

        if (matches.length > 0) {
            resultados.style.display = 'block';
            matches.slice(0, 5).forEach(p => { // Mostra as primeiras 5 sugestões
                const item = document.createElement('a');
                item.className = 'sugestao-item';
                item.href = '#'; // Link para o produto real
                item.innerHTML = `
                    <img src="${p.imagem}">
                    <div>
                        <strong style="color:var(--ml-blue)">${p.nome}</strong><br>
                        R$ ${p.preco}
                    </div>
                `;
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
            <h3 style="margin:40px 0 10px; font-weight:300; color:#666">${cat.nome}</h3>
            <div class="category-carousel-container">
                <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                <div class="category-carousel-track" id="track-${cat.id}"></div>
                <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        
        const track = section.querySelector(".category-carousel-track");
        cat.produtos.forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${p.imagem}">
                <div style="padding:10px">
                    <h4 style="font-size:13px; font-weight:300; margin:0 0 10px">${p.nome}</h4>
                    <div class="preco">R$ ${p.preco}</div>
                    <div style="color:#00a650; font-size:12px; font-weight:bold">Frete grátis</div>
                </div>
            `;
            track.appendChild(card);
        });
        feed.appendChild(section);
    });
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    const amount = track.clientWidth * 0.7;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    grid.innerHTML = "";
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, 8);
    lista.forEach(c => {
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
        div.innerHTML = `<img src="${p.imagem}"><div style="padding:10px"><div class="preco">R$ ${p.preco}</div></div>`;
        grid.appendChild(div);
    });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos categorias" : "Ver mais categorias";
}

init();
