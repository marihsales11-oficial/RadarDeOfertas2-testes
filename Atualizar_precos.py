import json
import requests
import re
import os
import time
import urllib3

# Desabilita avisos de certificados SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extrair_id_ml(url):
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_atualizado(ml_id):
    """Busca o menor preço com centavos (Pix/Oferta)"""
    try:
        # Link de catálogo/produto que o ML usa internamente
        url_produto = f"https://www.mercadolivre.com.br/p/{ml_id}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9'
        }
        
        response = requests.get(url_produto, headers=headers, timeout=20, verify=False)
        
        if response.status_code == 200:
            html = response.text
            
            # Lista de padrões para buscar preços com centavos (ex: 650.32)
            padroes = [
                r'\"promotion_price\":\{\"amount\":(\d+\.\d+)', # Preço Pix/Oferta
                r'\"sale_price\":(\d+\.\d+)',                  # Preço de venda atual
                r'\"price\":(\d+\.\d+)',                       # Preço genérico
                r'content=\"(\d+\.\d+)\" property=\"product:price:amount\"' # Meta tag
            ]
            
            encontrados = []
            for p in padroes:
                matches = re.findall(p, html)
                for m in matches:
                    encontrados.append(float(m))
            
            if encontrados:
                menor_valor = min(encontrados)
                # Formata para padrão brasileiro: 650.32 -> 650,32
                return f"{menor_valor:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')

        print(f"   ⚠️ Status {response.status_code} mas preço não localizado no HTML.")
    except Exception as e:
        print(f"   ❌ Erro de Conexão: {e}")
    return None

def processar_json():
    caminho_json = 'produtos.json'
    
    if not os.path.exists(caminho_json):
        print(f"❌ ERRO: {caminho_json} não encontrado.")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*60)
    print("🚀 BUSCANDO PREÇOS REAIS (COM CENTAVOS)")
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
                        print(f"   ✅ ATUALIZADO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já é o menor (R$ {novo_preco})")
                
                time.sleep(2)
            else:
                print(f"   ⚠️ Pulo: {produto['nome']} (Link s/ MLB)")

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ ARQUIVO produtos.json ATUALIZADO NO SERVIDOR.")
    else:
        print("\nℹ️ NADA A ALTERAR.")

if __name__ == "__main__":
    processar_json()
