import json
import requests
import re
import os
import time

def extrair_id_ml(url):
    """Extrai apenas os números do ID MLB para usar na API"""
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_api(ml_id):
    """Consulta a API de Itens do Mercado Livre (Invisível e Precisa)"""
    try:
        # Usamos a API que retorna dados puros (JSON) em vez de HTML
        url_api = f"https://api.mercadolibre.com/items/{ml_id}"
        
        response = requests.get(url_api, timeout=20)
        
        if response.status_code == 200:
            dados = response.json()
            
            # 'price' é o valor atual com descontos aplicados
            preco = dados.get('price')
            
            if preco is not None:
                # Formata o número (ex: 650.32) para o padrão brasileiro (650,32)
                valor_formatado = f"{float(preco):,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')
                return valor_formatado
        
        print(f"   ⚠️ API não retornou preço para {ml_id}. Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro na API: {e}")
    return None
def processar_json():
    caminho_json = 'produtos.json'
    
    # FORÇA O ERRO SE NÃO ACHAR O ARQUIVO
    if not os.path.exists(caminho_json):
        raise FileNotFoundError(f"O ARQUIVO {caminho_json} NÃO EXISTE NA RAIZ DO GITHUB!")

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    houve_alteracao = False
    print(f"DEBUG: Iniciando busca para {len(data['categorias'])} categorias")

    for categoria in data.get('categorias', []):
        for produto in categoria.get('produtos', []):
            ml_id = extrair_id_ml(produto.get('link', ''))
            if ml_id:
                novo_preco = obter_preco_api(ml_id)
                if novo_preco:
                    print(f"DEBUG: Preço API para {ml_id} é {novo_preco}")
                    if produto['preco'] != novo_preco:
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                else:
                    print(f"DEBUG: API FALHOU PARA {ml_id}")

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("✅ MUDANÇAS APLICADAS NO ARQUIVO LOCAL DA ACTION")
    else:
        print("⚠️ NADA FOI ALTERADO NO SCRIPT")

if __name__ == "__main__":
    processar_json()
