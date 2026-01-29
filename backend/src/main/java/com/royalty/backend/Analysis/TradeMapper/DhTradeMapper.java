package com.royalty.backend.Analysis.TradeMapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;

@Mapper
public interface DhTradeMapper {
    // XML의 <select id="searchSimilarTrademarks">와 이름 일치
    List<DhTrademarkSearchResponseDto> searchSimilarTrademarks(@Param("inputVector") float[] inputVector);
    
    // XML의 <insert id="saveMyBrand">와 이름 일치
    void saveMyBrand(DhTrademarkSearchResponseDto brandDto);

	void insertBrand(DhTrademarkSearchResponseDto saveDto);
	
	void insertBrandLogo(DhTrademarkSearchResponseDto brandDto);
}