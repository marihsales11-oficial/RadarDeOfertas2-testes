import json
import requests
import re
import os
import time
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extrair_id_ml(url):
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_atualizado(ml_id):
    """Busca o menor preço com centavos usando técnica de fallback"""
    try:
        # TENTATIVA 1: Link mobile (mais difícil de bloquear)
        url_produto = f"https://produto.mercadolivre.com.br/p/{ml_id}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
        
        response = requests.get(url_produto, headers=headers, timeout=25, verify=False)
        
        if response.status_code == 200:
            html = response.text
            
            # Padrão 1: JSON de oferta (650.32)
            match_promo = re.search(r'\"promotion_price\":\{\"amount\":(\d+\.\d+)', html)
            if match_promo:
                preco = float(match_promo.group(1))
                return f"{preco:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')

            # Padrão 2: Meta tag oficial
            match_meta = re.search(r'property=\"product:price:amount\" content=\"(\d+\.\d+)\"', html)
            if match_meta:
                preco = float(match_meta.group(1))
                return f"{preco:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')

            # Padrão 3: Qualquer "amount" seguido de decimal
            match_generic = re.search(r'\"amount\":(\d+\.\d+)', html)
            if match_generic:
                preco = float(match_generic.group(1))
                return f"{preco:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')

        print(f"   ⚠️ Falha na captura do ID {ml_id}. Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    return None

def processar_json():
    caminho_json = 'produtos.json'
    if not os.path.exists(caminho_json): return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*60)
    print("🚀 RADAR: BUSCA DE PREÇOS REAL (PIX/OFERTA)")
    print("="*60)
    
    houve_alteracao = False

    for categoria in data.get('categorias', []):
        print(f"\n📂 Categoria: {categoria['nome']}")
        for produto in categoria.get('produtos', []):
            ml_id = extrair_id_ml(produto.get('link', ''))
            
            if ml_id:
                print(f"🔎 Analisando: {produto['nome']}...")
                novo_preco = obter_preco_atualizado(ml_id)
                
                if novo_preco:
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ SUCESSO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Valor já é o menor (R$ {novo_preco})")
                time.sleep(2)

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ PREÇOS SALVOS NO JSON.")
    else:
        print("\nℹ️ NADA A ATUALIZAR.")

if __name__ == "__main__":
    processar_json()
