import json
import requests
import os
import time
import re

# SUA CHAVE DO SERPER
SERPER_API_KEY = "ab8c4a1c75f51f9a2109b0798c2134367bcae114"

def buscar_dados_completos_serper(nome_atual, url_produto):
    url_serper = "https://google.serper.dev/search"
    
    # O "location" é o segredo para o GitHub Actions funcionar como se estivesse no Brasil
    payload = json.dumps({
        "q": url_produto,
        "gl": "br",       # Geocalização: Brasil
        "hl": "pt-br",    # Idioma: Português
        "location": "Sao Paulo, State of Sao Paulo, Brazil" # Força a busca de SP
    })
    
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }

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
            
            # 1. Captura o Nome Real (Limpa nomes genéricos como "Mercado Livre")
            if "Mercado Livre" in nome_atual or len(nome_atual) < 12:
                # Pega o título do Google e remove o sufixo do Mercado Livre
                titulo_limpo = resultado.get("title", nome_atual).split("|")[0].split("-")[0].strip()
                dados_capturados["nome"] = titulo_limpo

            # 2. Captura a Imagem (Thumbnail indexada pelo Google)
            if "imageUrl" in resultado:
                dados_capturados["imagem"] = resultado["imageUrl"]

            # 3. Captura o Preço (Lógica de busca profunda)
            # Tenta nos atributos estruturados primeiro
            if "attributes" in resultado:
                for key, val in resultado["attributes"].items():
                    if any(x in key for x in ["Preço", "Price", "Valor"]):
                        # Limpa o R$ e espaços
                        dados_capturados["preco"] = val.replace("R$", "").strip()
                        break
            
            # Fallback: Se ainda estiver "Consultar", tenta extrair do snippet usando Regex
            if dados_capturados["preco"] == "Consultar":
                snippet = resultado.get("snippet", "")
                # Procura por padrões como R$ 1.250,00 ou 1250,00
                match = re.search(r"(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})", snippet)
                if match:
                    dados_capturados["preco"] = match.group(1)

        return dados_capturados
    except Exception as e:
        print(f"   ❌ Erro na API Serper: {e}")
        return dados_capturados

def rodar_atualizacao():
    # Detecta diretórios para funcionar tanto local quanto no GitHub
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    caminho_json = os.path.join(diretorio_atual, 'json', 'produtos.json')
    
    if not os.path.exists(caminho_json):
        caminho_json = os.path.join(diretorio_atual, 'produtos.json')

    print(f"🚀 Iniciando Super-Sincronização (Localização: Brasil)...")
    print(f"📂 Arquivo alvo: {caminho_json}")

    if not os.path.exists(caminho_json):
        print("❌ ERRO: Arquivo produtos.json não encontrado!")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        dados = json.load(f)

    for categoria in dados.get('categorias', []):
        print(f"\n📦 Categoria: {categoria.get('nome', 'Sem Nome')}")
        for produto in categoria.get('produtos', []):
            link = produto.get('link', '')
            
            if "mercadolivre.com.br" in link:
                print(f"🔎 Sincronizando: {produto['nome'][:35]}...")
                
                info = buscar_dados_completos_serper(produto['nome'], link)
                
                # Atualiza os campos no JSON
                produto['nome'] = info['nome']
                if info['preco'] != "Consultar":
                    produto['preco'] = info['preco']
                if info['imagem']:
                    # Só atualiza a imagem se não for o logo genérico do ML
                    if "logo" not in info['imagem'].lower():
                        produto['imagem'] = info['imagem']
                
                print(f"   ✅ OK: {info['nome'][:30]} | R$ {produto['preco']}")
                
                # Delay para evitar limites da API e simular navegação humana
                time.sleep(1.2)

    # Salva o arquivo com as novas informações
    with open(caminho_json, 'w', encoding='utf-8') as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)
    
    print("\n✅ RADAR TOTALMENTE SINCRONIZADO E SALVO!")

if __name__ == "__main__":
    rodar_atualizacao()
