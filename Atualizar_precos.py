import json
import requests
import re
import os
import time

def extrair_id_ml(url):
    """Extrai apenas os números do ID MLB"""
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_api(ml_id):
    """Consulta a API direta do Mercado Livre (Mais estável para GitHub)"""
    try:
        # A API de 'items' é pública e retorna o preço exato com centavos
        url_api = f"https://api.mercadolibre.com/items/{ml_id}"
        
        response = requests.get(url_api, timeout=20)
        
        if response.status_code == 200:
            dados = response.json()
            
            # O 'price' na API é o preço atual (com desconto aplicado, se houver)
            preco = dados.get('price')
            
            if preco:
                # Formata 650.32 para 650,32
                return f"{float(preco):,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')
        
        print(f"   ⚠️ API Status {response.status_code} para o ID {ml_id}")
    except Exception as e:
        print(f"   ❌ Erro na API: {e}")
    return None

def processar_json():
    caminho_json = 'produtos.json'
    if not os.path.exists(caminho_json):
        print("❌ Arquivo produtos.json não encontrado.")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*60)
    print("🚀 ATUALIZANDO VIA API MERCADO LIVRE (PRECISÃO TOTAL)")
    print("="*60)
    
    houve_alteracao = False

    for categoria in data.get('categorias', []):
        print(f"\n📂 Categoria: {categoria['nome']}")
        for produto in categoria.get('produtos', []):
            ml_id = extrair_id_ml(produto.get('link', ''))
            
            if ml_id:
                print(f"🔎 Consultando: {produto['nome']}...")
                novo_preco = obter_preco_api(ml_id)
                
                if novo_preco:
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ SUCESSO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já está atualizado (R$ {novo_preco})")
                
                # A API é rápida, mas 1 segundo de pausa é bom para evitar limites
                time.sleep(1)
            else:
                if produto.get('link') and "mercadolivre" in produto.get('link'):
                    print(f"   ⚠️ Link inválido: {produto['nome']}")

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ produtos.json ATUALIZADO COM SUCESSO!")
    else:
        print("\nℹ️ NENHUMA ALTERAÇÃO NECESSÁRIA.")

if __name__ == "__main__":
    processar_json()
