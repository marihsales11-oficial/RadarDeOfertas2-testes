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
    # No GitHub, o arquivo está na raiz
    caminho_json = 'produtos.json'
    
    if not os.path.exists(caminho_json):
        print(f"❌ Erro: {caminho_json} não encontrado.")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*60)
    print("🚀 ATUALIZAÇÃO VIA API (PRECISÃO DE CENTAVOS ATIVADA)")
    print("="*60)
    
    houve_alteracao = False

    for categoria in data.get('categorias', []):
        print(f"\n📂 Categoria: {categoria['nome']}")
        for produto in categoria.get('produtos', []):
            url = produto.get('link', '')
            ml_id = extrair_id_ml(url)
            
            if ml_id:
                print(f"🔎 Consultando: {produto['nome']}...")
                novo_preco = obter_preco_api(ml_id)
                
                if novo_preco:
                    # Se o preço for diferente do atual (ex: os R$ 7.000 de teste)
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ SUCESSO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já está atualizado (R$ {novo_preco})")
                
                time.sleep(1) # Pausa curta entre requisições
            else:
                if "mercadolivre" in str(url):
                    print(f"   ⚠️ Link inválido ou sem MLB: {produto['nome']}")

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ O arquivo produtos.json foi atualizado com os novos preços!")
    else:
        print("\nℹ️ Nenhuma mudança de preço detectada.")

if __name__ == "__main__":
    processar_json()
