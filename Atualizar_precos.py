import json
import requests
import re
import os
import time

def extrair_id_ml(url):
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_api(ml_id):
    """Consulta a API simulando um navegador real para evitar o Erro 403"""
    try:
        url_api = f"https://api.mercadolibre.com/items/{ml_id}"
        
        # Cabeçalhos mágicos para convencer o ML que somos um humano
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.mercadolivre.com.br/',
            'Origin': 'https://www.mercadolivre.com.br'
        }
        
        response = requests.get(url_api, headers=headers, timeout=20)
        
        if response.status_code == 200:
            dados = response.json()
            preco = dados.get('price')
            if preco is not None:
                return f"{float(preco):,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')
        
        print(f"   ⚠️ API negou acesso (Status {response.status_code}) para {ml_id}")
    except Exception as e:
        print(f"   ❌ Erro na conexão: {e}")
    return None

def processar_json():
    caminho_json = 'produtos.json'
    if not os.path.exists(caminho_json):
        print("❌ Arquivo não encontrado!")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    houve_alteracao = False
    print(f"🚀 Iniciando Radar para {len(data['categorias'])} categorias")

    for categoria in data.get('categorias', []):
        for produto in categoria.get('produtos', []):
            ml_id = extrair_id_ml(produto.get('link', ''))
            if ml_id:
                print(f"🔎 Analisando {ml_id}...")
                novo_preco = obter_preco_api(ml_id)
                if novo_preco:
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ Novo preço encontrado: {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                time.sleep(2) # Pausa maior para não parecer robô

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("💾 MUDANÇAS SALVAS!")
    else:
        print("ℹ️ NADA MUDOU")

if __name__ == "__main__":
    processar_json()
