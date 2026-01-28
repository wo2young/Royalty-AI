import requests
import os

# 로컬 Docker로 띄운 AI 서버 주소
URL = "http://localhost:8000/api/v1/search/hybrid"

def test_connection():
    print("🚀 [테스트 시작] AI 서버 + AWS RDS 연결 확인 중...")
    
    # 1. 테스트 데이터 (삼성)
    data = {"query_text": "삼성"} 
    
    try:
        # 2. 요청 전송
        print(f"📡 요청 보내는 중: {URL}")
        response = requests.post(URL, data=data)
        
        # 3. 결과 확인
        if response.status_code == 200:
            result = response.json()
            status = result.get('status')
            items = result.get('results', [])
            
            print(f"\n✅ [성공] 서버 응답 코드: 200 OK")
            print(f"📊 검색 결과 개수: {len(items)}개")
            
            if items:
                top = items[0]
                print(f"🥇 1등 결과: {top.get('name')} (점수: {top.get('score')})")
                print(f"   ㄴ 상세 점수: {top.get('details')}")
                print("\n🎉 축하합니다! AWS DB에서 데이터를 성공적으로 가져왔습니다!")
            else:
                print("\n⚠️ 연결은 됐는데, '삼성'으로 검색된 데이터가 없습니다.")
                print("   (DB에 데이터가 들어있는지 확인해보세요)")
        else:
            print(f"\n❌ [서버 에러] 상태 코드: {response.status_code}")
            print(f"   에러 내용: {response.text}")

    except Exception as e:
        print(f"\n❌ [연결 실패] AI 서버가 꺼져있거나 포트가 다릅니다.")
        print(f"   에러: {e}")

if __name__ == "__main__":
    test_connection()