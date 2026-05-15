import json
import requests
import re
import time
import os
import random
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def obter_header_aleatorio():
    # Lista de navegadores reais para enganar o sistema anti-bot
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    ]
    return {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site'
    }

def capturar_detalhes_mercadolivre(url):
    try:
        # Cada requisição agora usa uma identidade visual diferente
        res = requests.get(url, headers=obter_header_aleatorio(), timeout=25, verify=False)
        
        if res.status_code != 200:
            return None, None, "Consultar"

        html = res.text
        
        # 1. NOME
        nome = None
        match_og = re.search(r'property="og:title" content="(.*?)"', html)
        if match_og:
            nome = match_og.group(1).split('|')[0].strip()

        # 2. IMAGEM
        imagem = None
        match_img = re.search(r'property="og:image" content="(.*?)"', html)
        if match_img:
            imagem = match_img.group(1)

        # 3. PREÇO (Multi-captura)
        preco_final = "Consultar"
        
        # Tentativa 1: Dados Estruturados JSON (Mais estável)
        match_json = re.search(r'\"price\":\s*(\d+\.?\d*)', html)
        # Tentativa 2: Meta tags
        match_meta = re.search(r'property="product:price:amount" content="(.*?)"', html)
        
        val = None
        if match_json: val = match_json.group(1)
        elif match_meta: val = match_meta.group(1)

        if val:
            preco_final = "{:,.2f}".format(float(val)).replace(',', 'X').replace('.', ',').replace('X', '.')
        
        return nome, imagem, preco_final

    except Exception:
        return None, None, "Consultar"


def rodar_atualizacao():
    # Pega o caminho de onde o script está rodando
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    
    # Aponta para a pasta 'json' e depois para o arquivo
    caminho_json = os.path.join(diretorio_atual, 'json', 'produtos.json')

    if not os.path.exists(caminho_json):
        print(f"❌ Arquivo não encontrado em: {caminho_json}")
        return        


    
    with open(caminho_json, 'r', encoding='utf-8') as f:
        dados = json.load(f)

    print(f"🚀 Iniciando Radar com Proteção Anti-Bloqueio...")

    for categoria in dados['categorias']:
        for produto in categoria['produtos']:
            link = produto.get('link', '')
            if "mercadolivre.com.br" in link:
                print(f"   🔎 Processando: {produto.get('nome', 'Produto')[:30]}...")
                
                n, i, p = capturar_detalhes_mercadolivre(link)
                
                if n and p != "Consultar":
                    produto['nome'] = n
                    produto['preco'] = p
                    if i: produto['imagem'] = i
                    print(f"      ✅ R$ {p}")
                else:
                    print(f"      ⚠️ Bloqueio detectado. Pulando para evitar ban...")
                    # Se houver bloqueio, esperamos mais tempo
                    time.sleep(10)
                
                # O SEGREDO: Intervalo randômico para parecer humano
                time.sleep(random.uniform(3.0, 7.0))

    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    
    print("\n✅ BASE DE DADOS ATUALIZADA!")

if __name__ == "__main__":
    rodar_atualizacao()
