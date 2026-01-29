package com.royalty.backend.TradeMark.TradeMapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

// 필요 없는 DhBrandAnalysisSaveDto, DhBrandSaveRequestDto 임포트 제거
import com.royalty.backend.TradeMark.TradeDTO.DhTrademarkSearchResponseDto;

@Mapper
public interface DhTradeMapper {
    // XML의 <select id="searchSimilarTrademarks">와 이름 일치
    List<DhTrademarkSearchResponseDto> searchSimilarTrademarks(@Param("inputVector") float[] inputVector);
    
    // XML의 <insert id="saveMyBrand">와 이름 일치
    void saveMyBrand(DhTrademarkSearchResponseDto brandDto);

	void insertBrand(DhTrademarkSearchResponseDto saveDto);
	
	void insertBrandLogo(DhTrademarkSearchResponseDto brandDto);
}