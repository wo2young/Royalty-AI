package com.royalty.backend.Analysis.TradeMapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;

@Mapper
public interface DhTradeMapper {

    void insertBrand(DhTrademarkSearchResponseDto saveDto);
    void updateBrand(DhTrademarkSearchResponseDto saveDto);

    void insertBrandLogo(DhTrademarkSearchResponseDto saveDto);
    void updateBrandLogo(DhTrademarkSearchResponseDto saveDto);

    void saveMyBrand(DhTrademarkSearchResponseDto saveDto);
    
    // 신규: brand_analysis insert
    void insertBrandAnalysis(DhTrademarkSearchResponseDto dto);

    String getApplicantByPatentId(@Param("patentId") int patentId);

    List<DhTrademarkSearchResponseDto> searchSimilarTrademarks(@Param("inputVector") float[] inputVector);

    void updateBrandDescription(@Param("brandId") int brandId, @Param("aiSummary") String aiSummary);
    
    Integer findMaxVersionByBrandId(int brandId);
}

/*
[전체 정리]
- A안 3단계 요구사항(brand_analysis insert)을 위해 insertBrandAnalysis 메서드 추가
*/
