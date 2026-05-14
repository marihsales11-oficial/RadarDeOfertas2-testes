let categoriasData = [];
let expandidoHome = false;
let limiteExpirando = 8; // Controle de paginação para Ofertas Expirando

async function init() {
    try {
        const res = await fetch('json/produtos.json');
        const data = await res.json();
        categoriasData = data.categorias;
        
        renderizarMenus();
        renderizarIconesHome();
        renderizarExpirando();
        renderizarFeedCompleto();
        iniciarTimer();
        configurarBusca();
        
        // Redirecionamento compatível com Android/iOS
        document.body.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn-comprar');
            if (btn) {
                e.preventDefault();
                const urlAfiliado = btn.getAttribute('data-url');
                if (urlAfiliado && urlAfiliado !== "#") {
                    mostrarModalRedirecionamento(urlAfiliado);
                }
            }
        });

        // Força verificação de setas em todos os dispositivos após carregar
        setTimeout(() => {
            categoriasData.forEach(cat => gerenciarSetas(cat.id));
        }, 1000);

    } catch (e) { 
        console.error("Erro ao carregar dados:", e); 
    }
}

// --- LÓGICA DAS SETAS (ATIVAS EM TODOS OS SISTEMAS) ---
function gerenciarSetas(trackId) {
    const track = document.getElementById(`track-${trackId}`);
    if (!track) return;
    
    const container = track.parentElement;
    const btnLeft = container.querySelector('.arrow-left');
    const btnRight = container.querySelector('.arrow-right');

    // Em dispositivos touch, as setas ajudam na navegação visual
    if (btnLeft) {
        btnLeft.style.display = track.scrollLeft <= 10 ? 'none' : 'flex';
    }
    if (btnRight) {
        const fimDoScroll = track.scrollLeft + track.clientWidth >= track.scrollWidth - 15;
        btnRight.style.display = fimDoScroll ? 'none' : 'flex';
    }
}

function scrollManual(id, direction) {
    const track = document.getElementById(`track-${id}`);
    if (!track) return;
