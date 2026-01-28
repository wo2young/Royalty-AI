import requests
import urllib.parse

# [중요] 여기에 API 키를 넣어주세요
API_KEY = "ZRHVxLft478aps=xexV2IiIx/MXO/wOxpW6=YS/v9X4="

def generate_debug_url():
    base_url = "http://plus.kipris.or.kr/openapi/rest/trademarkInfoSearchService/freeSearchInfo"
    
    # 공백 제거 (실수 방지)
    clean_key = API_KEY.strip()
    
    params = {
        'accessKey': clean_key,
        'freeSearch': '삼성', # 테스트용 키워드
        'docsStart': 1,
        'docsCount': 10,
        'application': 'true',
        'registration': 'true',
        'refused': 'true',
        'expiration': 'false',
        'withdrawal': 'false',
        'publication': 'true',
        'cancel': 'false'
    }
    
    # 실제 요청을 보낼 URL 생성
    final_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    print("\n==================================================")
    print("👇 아래 링크를 복사해서 인터넷 브라우저(크롬 등) 주소창에 붙여넣어 보세요!")
    print("==================================================\n")
    print(final_url)
    print("\n==================================================")
    print("1. 브라우저에서 XML 데이터가 잘 나오면? -> 파이썬 코드 문제 아님. (네트워크/방화벽 등)")
    print("2. 브라우저에서도 resultCode 10이 나오면? -> API 키 문제거나 파라미터 조합 문제.")
    print("==================================================\n")

if __name__ == "__main__":
    generate_debug_url()