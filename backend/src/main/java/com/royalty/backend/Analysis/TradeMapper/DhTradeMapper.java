package com.royalty.backend.Analysis.TradeMapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;

@Mapper
public interface DhTradeMapper {

    /**
     * [영역 1] 브랜드 기본 정보 (Brand Table)
     * insertBrand 성공 시 saveDto의 brandId 필드에 생성된 PK가 자동으로 채워집니다.
     */
    void insertBrand(DhTrademarkSearchResponseDto saveDto);
    void updateBrand(DhTrademarkSearchResponseDto saveDto);

    /**
     * [영역 2] 현재 로고 정보 (Brand_Logo Table)
     * 브랜드의 '현재' 활성화된 로고 경로를 관리합니다.
     */
    void insertBrandLogo(DhTrademarkSearchResponseDto saveDto);
    void updateBrandLogo(DhTrademarkSearchResponseDto saveDto);

    /**
     * [영역 3] 분석 이력 (Brand_Logo_History Table)
     * AI 분석 리포트 및 유사도 점수 등 시점별 이력을 기록합니다.
     * patent_id가 0일 경우 XML에서 NULL로 처리됩니다.
     */
    void saveMyBrand(DhTrademarkSearchResponseDto saveDto);

    /**
     * [영역 4] 조회 및 검색
     */
    // 특정 특허 ID로 출원인 정보 조회
    String getApplicantByPatentId(@Param("patentId") int patentId);

    // AI 벡터 검색 기반 유사 상표 리스트 조회
    List<DhTrademarkSearchResponseDto> searchSimilarTrademarks(@Param("inputVector") float[] inputVector);
}