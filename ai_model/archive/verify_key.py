import requests
import xml.etree.ElementTree as ET

def verify_user_key():
    # [중요] 가지고 계신 그 API Key를 여기에 넣으세요
    API_KEY = "ZRHVxLft478aps=xexV2IiIx/MXO/wOxpW6=YS/v9X4=rm run_full_scan.py"

    # 선생님이 찾으신 그 주소 (상세 검색)
    url = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getAdvancedSearch"

    # 선생님이 찾으신 샘플 코드의 파라미터 그대로 적용
    params = {
        'ServiceKey': API_KEY,  # 여기서는 accessKey 대신 ServiceKey라고 쓰기도 함 (KIPRIS 특성)
        'applicantName': '(주)아모레퍼시픽', # 샘플에 있던 검색어
        'application': 'true',
        'registration': 'true',
        'refused': 'true',
        'expiration': 'true',
        'withdrawal': 'true',
        'publication': 'true',
        'cancel': 'true',
        'abandonment': 'true',
        'trademark': 'true',
        'serviceMark': 'true',
        'businessEmblem': 'true',
        'collectiveMark': 'true',
        'geoOrgMark': 'true',
        'trademarkServiceMark': 'true',
        'certMark': 'true',
        'geoCertMark': 'true',
        'internationalMark': 'true',
        'character': 'true',
        'figure': 'true',
        'compositionCharacter': 'true',
        'figureComposition': 'true',
        'fragrance': 'true',
        'sound': 'true',
        'color': 'true',
        'colorMixed': 'true',
        'dimension': 'true',
        'hologram': 'true',
        'invisible': 'true',
        'motion': 'true',
        'visual': 'true',
        'docsStart': 1,
        'docsCount': 5
    }

    print(f"🕵️ 키 검증 시작... (대상: {url})")

    try:
        # 1차 시도: ServiceKey 파라미터 사용
        response = requests.get(url, params=params, timeout=10)
        
        print(f"\n📡 응답 코드: {response.status_code}")
        print(f"📜 응답 내용 (앞부분): {response.text[:300]}")

        if response.status_code == 200 and "<items>" in response.text:
            print("\n✅ [성공] 선생님 말씀이 맞습니다! 이 키는 사용 가능합니다.")
            print("👉 바로 수집기(PatentCollector) 돌리러 가시죠!")
            return True
        else:
            # 실패 시 accessKey로 이름 바꿔서 2차 시도 (KIPRIS는 가끔 파라미터 명이 다름)
            print("\n⚠️ 1차 실패. 파라미터 명을 'accessKey'로 바꿔서 재시도합니다...")
            del params['ServiceKey']
            params['accessKey'] = API_KEY
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200 and "<items>" in response.text:
                print("\n✅ [성공] accessKey로 성공했습니다! 키가 맞습니다.")
                return True
            else:
                print("\n❌ [최종 실패] 이 키로는 데이터를 가져올 수 없습니다.")
                print("이유: 해당 서비스(상표권 정보 검색)에 대한 권한이 없는 키입니다.")
                print("👉 번거로우시겠지만 '상표권 정보 검색 서비스'를 새로 신청하셔야 합니다.")
                return False

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        return False

if __name__ == "__main__":
    verify_user_key()