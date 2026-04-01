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

def obter_preco_via_busca(ml_id):
    """Busca o preço usando a API de pesquisa (mais difícil de bloquear)"""
    try:
        # Usamos a API de busca pelo ID do item, que é mais aberta
        url_busca = f"https://api.mercadolibre.com/sites/MLB/search?q={ml_id}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0 Safari/537.36'
        }
        
        response = requests.get(url_busca, headers=headers, timeout=20)
        
        if response.status_code == 200:
            dados = response.json()
            # A API de busca retorna uma lista de resultados
            if dados.get('results'):
                item = dados['results'][0]
                preco = item.get('price')
                if preco:
                    # Formata para o padrão 650,32
                    return f"{float(preco):,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')
        
        print(f"   ⚠️ Falha na busca para {ml_id}. Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro técnico: {e}")
    return None

def processar_json():
    caminho_json = 'produtos.json'
    if not os.path.exists(caminho_json): return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    houve_alteracao = False
    print(f"🚀 RADAR: Tentando contornar bloqueio 403...")

    for categoria in data.get('categorias', []):
        for produto in categoria.get('produtos', []):
            ml_id = extrair_id_ml(produto.get('link', ''))
            if ml_id:
                print(f"🔎 Buscando item {ml_id}...")
                novo_preco = obter_preco_via_busca(ml_id)
                
                if novo_preco:
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ PREÇO ENCONTRADO: {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já atualizado.")
                time.sleep(3) # Pausa maior para segurança

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("💾 ARQUIVO ATUALIZADO!")
    else:
        print("ℹ️ NADA FOI ALTERADO.")

if __name__ == "__main__":
    processar_json()
