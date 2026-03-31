import json
import requests
import re
import os
import time
import urllib3

# Desabilita avisos de certificados SSL para evitar erros no macOS
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extrair_id_ml(url):
    """Extrai o código MLB de qualquer formato de link do Mercado Livre"""
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_atualizado(ml_id):
    """Captura o menor preço real disponível na página (Pix, Promoção ou Normal)"""
    try:
        url_produto = f"https://www.mercadolivre.com.br/p/{ml_id}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Referer': 'https://www.google.com/'
        }
        
        response = requests.get(url_produto, headers=headers, timeout=15, verify=False)
        
        if response.status_code == 200:
            html = response.text
            
            # Buscamos todos os valores que seguem o padrão de 'amount': 000.00 ou 'price': 000.00
            # Isso captura promotion_price, sale_price, regular_price, etc.
            padroes = [
                r'\"amount\":(\d+\.\d+)',
                r'\"price\":(\d+\.\d+)',
                r'\"price\":(\d+)',
                r'property=\"product:price:amount\" content=\"(\d+\.?\d*)\"'
            ]
            
            valores_encontrados = []
            for padrao in padroes:
                encontrados = re.findall(padrao, html)
                for val in encontrados:
                    try:
                        num = float(val)
                        if num > 5: # Filtro para evitar pegar centavos de parcelas ou IDs
                            valores_encontrados.append(num)
                    except:
                        continue
            
            if valores_encontrados:
                # O menor valor encontrado será sempre o preço final com o maior desconto aplicado
                menor_preco = min(valores_encontrados)
                return f"{menor_preco:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')

        print(f"   ❌ Erro de Acesso: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro de Conexão: {e}")
    return None

def processar_json():
    diretorio = os.path.dirname(os.path.abspath(__file__))
    caminho_json = os.path.join(diretorio, 'produtos.json')
    
    if not os.path.exists(caminho_json):
        print(f"❌ ERRO: Arquivo {caminho_json} não encontrado.")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*65)
    print("🚀 RADAR DE OFERTAS: ATUALIZAÇÃO MULTI-INFORMAÇÕES ATIVADA")
    print("="*65)
    
    houve_alteracao = False

    for categoria in data.get('categorias', []):
        print(f"\n📂 Categoria: {categoria['nome']}")
        for produto in categoria.get('produtos', []):
            url = produto.get('link', '')
            ml_id = extrair_id_ml(url)
            
            if ml_id:
                print(f"🔎 Analisando: {produto['nome']}...")
                novo_preco = obter_preco_atualizado(ml_id)
                
                if novo_preco:
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ PREÇO ATUALIZADO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já é o menor disponível (R$ {novo_preco})")
                
                time.sleep(1.2) # Pausa técnica para evitar bloqueios
            else:
                print(f"   ⚠️ Pulo: {produto['nome']} (Link sem MLB)")

    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n" + "="*65)
        print("✅ SUCESSO! O produtos.json foi sincronizado com os menores valores.")
        print("="*65)
    else:
        print("\n" + "="*65)
        print("ℹ️ TUDO EM DIA: Não houve alterações de preços nos links.")
        print("="*65)

if __name__ == "__main__":
    processar_json()