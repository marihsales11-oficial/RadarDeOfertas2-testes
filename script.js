let categoriasData = [];
let expandidoHome = false;

async function init() {
    try {
        const res = await fetch('produtos.json');
        if (!res.ok) throw new Error('Não foi possível carregar os produtos.');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        iniciarTimer();
        configurarBuscaInteligente();
    } catch (e) { 
        console.error("Erro fatal:", e);
        document.getElementById("feed-infinito").innerHTML = "<p style='text-align:center; padding:50px;'>Erro ao carregar ofertas. Por favor, tente novamente mais tarde.</p>";
    }
}

// Renderiza o feed padrão (carrosséis no desktop)
function renderizarFeedCompleto() {
    const feed = document.getElementById("feed-infinito");
    feed.innerHTML = "";
    
    // Detecta se é mobile para decidir como renderizar o feed padrão
    const isMobile = window.innerWidth <= 768;

    categoriasData.forEach((cat, index) => {
        if (index === 0) return; // Pula 'expirando'
        
        const section = document.createElement("section");
        section.id = `cat-${cat.id}`;
        section.className = "category-section";
        
        if (isMobile) {
            // No mobile padrão, renderiza como grid simples abaixo dos ícones
            section.innerHTML = `
                <h3 class="section-title">${cat.nome}</h3>
                <div class="flash-grid mobile-two-columns"></div>
            `;
            const grid = section.querySelector(".flash-grid");
            cat.produtos.forEach(p => grid.appendChild(criarCardHTML(p)));
        } else {
            // No desktop, mantém o carrossel
            section.innerHTML = `
                <h3 class="section-title">${cat.nome}</h3>
                <div class="category-carousel-container">
                    <button class="carousel-arrow arrow-left" onclick="scrollManual('${cat.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                    <div class="category-carousel-track" id="track-${cat.id}"></div>
                    <button class="carousel-arrow arrow-right" onclick="scrollManual('${cat.id}', 1)"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
            const track = section.querySelector(".category-carousel-track");
            cat.produtos.forEach(p => {
                const wrapper = document.createElement("div");
                wrapper.className = "card-wrapper";
                wrapper.appendChild(criarCardHTML(p));
                track.appendChild(wrapper);
            });
        }
        feed.appendChild(section);
    });
}

// Cria a estrutura HTML do card (incluindo o botão com loading)
function criarCardHTML(p) {
    const div = document.createElement("div");
    div.className = "card";
    
    // O card todo não é mais um link para podermos clicar no botão separadamente
    div.innerHTML = `
        <img src="${p.imagem}" loading="lazy" alt="${p.nome}">
        <div class="card-info">
            <h4>${p.nome}</h4>
            <div class="preco">R$ ${p.preco}</div>
            <div class="frete-gratis">Frete grátis</div>
            <button class="btn-comprar" onclick="redirecionarComLoading(this, '${p.linkAffiliate || '#'}')">Comprar agora</button>
        </div>
    `;
    return div;
}

// Função que ativa o loading e mostra a mensagem
function redirecionarComLoading(botao, link) {
    if (botao.classList.contains('loading')) return; // Evita múltiplos cliques

    // 1. Ativa o estado de loading no botão (CSS gerencia o spinner)
    botao.classList.add('loading');
    botao.innerText = ""; // Remove o texto para o spinner aparecer centralizado

    // 2. Mostra o alerta nativo
    // Usamos setTimeout bem curto para garantir que o navegador renderize o estado de loading antes do alerta bloquear a thread.
    setTimeout(() => {
        alert("Você está sendo redirecionado para a página de Afiliados do Mercado Livre, sua compra é segura.");
        
        // 3. Redireciona após o OK do usuário
        window.location.href = link;

        // Opcional: Reseta o botão caso o usuário volte (para SPAs isso é importante)
        // setTimeout(() => { botao.classList.remove('loading'); botao.innerText = "Comprar agora"; }, 1000);
    }, 50);
}

// Scroll manual dos carrosséis (Desktop)
function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: 'smooth' });
}

// Ícones da Home
function renderizarIconesHome() {
    const grid = document.getElementById("grid-icones-home");
    if (!grid) return;
    grid.innerHTML = "";
    // No mobile, mostra menos ícones inicialmente se não expandido
    const limiar = window.innerWidth <= 768 ? 6 : 8;
    const lista = expandidoHome ? categoriasData : categoriasData.slice(0, limiar);
    
    lista.forEach(c => {
        const card = document.createElement("a");
        card.className = "cat-icon-card";
        card.href = `#cat-${c.id}`;
        card.innerHTML = `<img src="${c.icone}" alt="${c.nome}"><span>${c.nome}</span>`;
        grid.appendChild(card);
    });
}

function renderizarExpirando() {
    const grid = document.getElementById("grid-expirando");
    if (!grid) return;
    grid.innerHTML = "";
    if(categoriasData[0] && categoriasData[0].produtos) {
        categoriasData[0].produtos.forEach(p => {
            grid.appendChild(criarCardHTML(p));
        });
    }
}

// BUSCA INTELIGENTE REAL
function configurarBuscaInteligente() {
    const input = document.getElementById('input-busca');
    const btn = document.getElementById('btn-busca');
    const feed = document.getElementById("feed-infinito");
    const secaoExpirando = document.getElementById("secao-expirando");
    const secaoIcones = document.getElementById("secao-categorias-icones");

    if (!input || !btn) return;

    const executarBusca = () => {
        const termo = input.value.toLowerCase().trim();

        if (termo === "") {
            // Restaura o estado inicial
            secaoExpirando.style.display = "block";
            secaoIcones.style.display = "block";
            renderizarFeedCompleto();
            return;
        }

        // Esconde as seções fixas
        secaoExpirando.style.display = "none";
        secaoIcones.style.display = "none";
        
        // Prepara o container de resultados (usando a classe de 2 colunas mobile)
        feed.innerHTML = `
            <h2 class="section-title">Resultados para "${input.value}"</h2>
            <div class="search-results-grid mobile-two-columns" id="grid-busca"></div>
        `;
        const gridBusca = document.getElementById("grid-busca");

        let encontrou = false;
        
        // Itera sobre o JSON procurando matches
        categoriasData.forEach(cat => {
            cat.produtos.forEach(prod => {
                // Busca no nome do produto OU no nome da categoria
                if (prod.nome.toLowerCase().includes(termo) || cat.nome.toLowerCase().includes(termo)) {
                    gridBusca.appendChild(criarCardHTML(prod));
                    encontrou = true;
                }
            });
        });

        if (!encontrou) {
            feed.innerHTML = `
                <div style="text-align:center; padding: 80px 20px; color: #666;">
                    <i class="fas fa-search" style="font-size: 40px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Nenhum resultado para "${input.value}"</h3>
                    <p style="font-size:14px;">Verifique a ortografia ou tente termos mais genéricos.</p>
                </div>`;
        }
    };

    // Ativa ao clicar no botão ou pressionar Enter
    btn.addEventListener('click', executarBusca);
    input.addEventListener('keypress', (e) => { if(e.key === 'Enter') executarBusca(); });
}

function toggleHomeCategorias() {
    expandidoHome = !expandidoHome;
    renderizarIconesHome();
    document.getElementById("btn-expandir-home").innerText = expandidoHome ? "Ver menos" : "Ver mais categorias";
}

function renderizarMenus() {
    const nav = document.getElementById("menu-categorias-dt");
    if (!nav) return;
    categoriasData.forEach(c => {
        const a = document.createElement("a");
        a.href = `#cat-${c.id}`;
        a.innerText = c.nome;
        nav.appendChild(a);
    });
}

function iniciarTimer() {
    const timerEl = document.getElementById("timer");
    if(!timerEl) return;
    
    setInterval(() => {
        const now = new Date();
        const end = new Date(); end.setHours(23, 59, 59);
        const diff = end - now;
        
        if (diff <= 0) {
            timerEl.innerText = "00:00:00";
            return;
        }

        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        timerEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// Escuta redimensionamento para ajustar o feed
window.addEventListener('resize', () => {
    const input = document.getElementById('input-busca');
    if (input && input.value.trim() === "") {
        renderizarFeedCompleto();
        renderizarIconesHome();
    }
});

init();
