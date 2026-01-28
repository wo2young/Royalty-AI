import requests
import xml.etree.ElementTree as ET

def inspect_final_check(keyword):
    # [중요] 아까 성공했던 그 키를 그대로 넣으세요!
    API_KEY = "KptjGcopEpnVgG=FeP/3zFxTZ31PRVQq7sXudfMz1E8="
    
    # [변경] 성공했던 그 주소(상세 검색)를 사용합니다.
    url = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getAdvancedSearch"
    
    # [변경] 상세 검색용 파라미터 세팅 (ServiceKey 사용)
    params = {
        'ServiceKey': API_KEY,       # accessKey가 아니라 ServiceKey를 씁니다
        'trademarkName': keyword,    # 상표명으로 검색 ('삼성' 등)
        
        # 필수 옵션들 (이게 없으면 에러남)
        'application': 'true',       # 출원
        'registration': 'true',      # 등록
        'refused': 'true',           # 거절
        'expiration': 'false',       # 소멸 (제외)
        'withdrawal': 'false',       # 취하 (제외)
        'publication': 'true',       # 공고
        'cancel': 'false',           # 무효 (제외)
        'abandonment': 'false',      # 포기 (제외)
        
        # 검색 범위 옵션 (다 켜두는 게 안전함)
        'trademark': 'true',
        'serviceMark': 'true',
        'trademarkServiceMark': 'true',
        'businessEmblem': 'true',
        'collectiveMark': 'true',
        'geoOrgMark': 'true',
        'certMark': 'true',
        'geoCertMark': 'true',
        'internationalMark': 'true',
        'character': 'true',         # 문자
        'figure': 'true',            # 도형
        'compositionCharacter': 'true',
        'figureComposition': 'true',
        
        'docsStart': 1,
        'docsCount': 5
    }

    print(f"🔍 '{keyword}' 검색 시작 (AdvancedSearch API 사용)...")
    
    try:
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ HTTP 실패: {response.status_code}")
            return

        # XML 파싱
        root = ET.fromstring(response.text)
        
        # 성공 여부 확인
        success_yn = root.findtext('.//successYN')
        if success_yn == 'N':
            msg = root.findtext('.//resultMsg')
            print(f"❌ API 내부 에러: {msg}")
            return

        items = root.findall('.//item')
        if not items:
            print("❌ 검색 결과가 없습니다.")
            return

        print(f"\n✅ 데이터 수신 성공! ({len(items)}개 찾음)")
        print("이제 XML 태그 이름을 확인합니다. (Collector 수정용)\n")

        # 태그 이름 확인 (이걸 보고 Collector를 고쳐야 함)
        item = items[0]
        
        # 상세 검색 API는 태그 이름이 다를 수 있음 (확인 필수)
        print(f"1. 출원번호 (applicationNumber): {item.findtext('applicationNumber')}")
        print(f"2. 상표명 (App/indexNo): {item.findtext('trademarkName')}") 
        # 주의: 상세검색은 trademarkName 대신 indexNo, title 등을 쓸 수도 있음. 
        # 일단 출력되는지 확인!
        
        print(f"3. 분류 (classificationCode): {item.findtext('classificationCode')}")
        print(f"4. 상태 (applicationStatus): {item.findtext('applicationStatus')}")
        print(f"5. 출원일 (applicationDate): {item.findtext('applicationDate')}")
        print(f"6. 등록일 (registrationDate): {item.findtext('registrationDate')}")
        print(f"7. 이미지 (bigDrawing): {item.findtext('bigDrawing')}")
        
        # 전체 태그 목록 출력 (혹시 이름이 다를까봐)
        print("\n[참고: 실제 들어온 태그 목록]")
        for child in item:
            print(f" - {child.tag}: {child.text}")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")

if __name__ == "__main__":
    inspect_final_check("삼성")