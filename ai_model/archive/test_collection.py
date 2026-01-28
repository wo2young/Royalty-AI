# test_collection.py
from patent_collector import PatentCollector
from analyzer import BrandAnalyzer

if __name__ == "__main__":
    print("🧠 AI 모델 로딩 중 (MobileNetV3 + Ko-SBERT)...")
    analyzer = BrandAnalyzer()
    
    collector = PatentCollector(analyzer_instance=analyzer)
    
    # "삼성"이라는 키워드로 1페이지부터 2페이지까지만 수집 테스트
    collector.collect_data("삼성", start_page=1, end_page=2)