import json
import requests
import os
import time
import re

SERPER_API_KEY = "ab8c4a1c75f51f9a2109b0798c2134367bcae114"

def buscar_dados_completos_serper(nome_atual, url_produto):
    url_serper = "https://google.serper.dev/search"
    # Buscamos pelo link para pegar os dados daquela página específica
    payload = json.dumps({
        "q": url_produto,
        "gl": "br",
        "hl": "pt-br"
    })
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}

    dados_capturados = {
        "preco": "Consultar",
        "nome": nome_atual,
        "imagem": None
    }

    try:
        response = requests.post(url_serper, headers=headers, data=payload, timeout=15)
        res_data = response.json()

        if "organic" in res_data and len(res_data["organic"]) > 0:
            resultado = res_data["organic"][0]
            
            # 1. Captura o Nome Real (se o atual for genérico ou curto)
            if "Mercado Livre" in nome_atual or len(nome_atual) < 10:
                dados_capturados["nome"] = resultado.get("title", nome_atual).split("|")[0].strip()

            # 2. Captura a Imagem (Thumbnail que o Google já processou)
            if "imageUrl" in resultado:
                dados_capturados["imagem"] = resultado["imageUrl"]

            # 3. Captura o Preço (Lógica refinada)
            if "attributes" in resultado:
                for key, val in resultado["attributes"].items():
                    if "Preço" in key or "Price" in key:
                        dados_capturados["preco"] = val.replace("R$", "").strip()
                        break
            
            # Fallback de preço no snippet se não achou nos atributos
            if dados_capturados["preco"] == "Consultar":
                snippet = resultado.get("snippet", "")
                match = re.search(r"R\$\s?(\d{1,3}(\.\d{3})*,\d{2})", snippet)
                if match:
                    dados_capturados["preco"] = match.group(1)

        return dados_capturados
    except Exception as e:
        print(f"   ❌ Erro na API: {e}")
        return dados_capturados

def rodar_atualizacao():
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    caminho_json = os.path.join(diretorio_atual, 'json', 'produtos.json')
    if not os.path.exists(caminho_json):
        caminho_json = os.path.join(diretorio_atual, 'produtos.json')

    print(f"🚀 Iniciando Super-Sincronização (Preço + Nome + Imagem)...")

    with open(caminho_json, 'r', encoding='utf-8') as f:
        dados = json.load(f)

    for categoria in dados.get('categorias', []):
        print(f"\n📦 Categoria: {categoria.get('nome')}")
        for produto in categoria.get('produtos', []):
            link = produto.get('link', '')
            if "mercadolivre.com.br" in link:
                print(f"🔎 Processando: {produto['nome'][:30]}...")
                
                info = buscar_dados_completos_serper(produto['nome'], link)
                
                # Atualiza os campos apenas se encontrar dados válidos
                produto['nome'] = info['nome']
                if info['preco'] != "Consultar":
                    produto['preco'] = info['preco']
                if info['imagem']:
                    produto['imagem'] = info['imagem']
                
                print(f"   ✅ Nome: {info['nome'][:40]}")
                print(f"   ✅ Preço: R$ {produto['preco']}")
                
                time.sleep(1.2) # Evita estourar limite da API

    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    
    print("\n✅ RADAR TOTALMENTE SINCRONIZADO!")

if __name__ == "__main__":
    rodar_atualizacao()
