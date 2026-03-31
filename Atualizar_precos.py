import json
import requests
import re
import os
import time
import urllib3

# Desabilita avisos de certificados SSL (essencial para ambientes de servidor)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extrair_id_ml(url):
    """Extrai o código MLB de qualquer formato de link do Mercado Livre"""
    match = re.search(r'MLB-?(\d+)', str(url))
    if match:
        return f"MLB{match.group(1)}"
    return None

def obter_preco_atualizado(ml_id):
    """Captura o menor preço (Pix/Oferta) usando o link de produto direto"""
    try:
        # Formato de link mais "leve" para o servidor do GitHub processar
        ml_id_formatado = ml_id.replace('MLB', 'MLB-')
        url_produto = f"https://produto.mercadolivre.com.br/{ml_id_formatado}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9',
        }
        
        response = requests.get(url_produto, headers=headers, timeout=20, verify=False)
        
        if response.status_code == 200:
            html = response.text
            
            # Procura por todos os padrões de preço no HTML (Promotion, Sale ou Price)
            # Pegamos o menor valor positivo encontrado na página
            precos = re.findall(r'\"amount\":(\d+\.\d+)', html)
            precos += re.findall(r'\"price\":(\d+\.\d+)', html)
            
            if precos:
                lista_numerica = [float(p) for p in precos if float(p) > 5]
                if lista_numerica:
                    menor_preco = min(lista_numerica)
                    return f"{menor_preco:,.2f}".replace('.', 'X').replace(',', '.').replace('X', ',')
        
        print(f"   ❌ Erro de Acesso ao ID {ml_id}: Status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erro de Conexão: {e}")
    return None

def processar_json():
    # Caminho do arquivo no repositório
    caminho_json = 'produtos.json'
    
    if not os.path.exists(caminho_json):
        print(f"❌ ERRO: Arquivo {caminho_json} não encontrado no repositório.")
        return

    with open(caminho_json, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("\n" + "="*60)
    print("🚀 EXECUTANDO ATUALIZAÇÃO NO GITHUB ACTIONS")
    print("="*60)
    
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
                    # Se o preço for diferente dos R$ 7000 (ou qualquer valor atual), atualiza
                    if produto['preco'] != novo_preco:
                        print(f"   ✅ SUCESSO: R$ {produto['preco']} -> R$ {novo_preco}")
                        produto['preco'] = novo_preco
                        houve_alteracao = True
                    else:
                        print(f"   ✨ Preço já atualizado (R$ {novo_preco})")
                
                time.sleep(2) # Pausa maior para evitar bloqueios no IP do GitHub
            else:
                print(f"   ⚠️ Pulo: {produto['nome']} (Link s/ MLB)")

    # Salva o arquivo apenas se houve mudança real nos valores
    if houve_alteracao:
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("\n✅ ALTERAÇÕES SALVAS NO ARQUIVO.")
    else:
        print("\nℹ️ NENHUMA ALTERAÇÃO NECESSÁRIA.")

if __name__ == "__main__":
    processar_json()
