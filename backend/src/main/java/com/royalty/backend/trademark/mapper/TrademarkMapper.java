package com.royalty.backend.trademark.mapper;

import com.royalty.backend.trademark.dto.TrademarkDto;
import com.royalty.backend.trademark.dto.TrademarkSearchReq;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TrademarkMapper {

    // ==========================================
    // 1. 기본 검색 및 리스트 조회
    // ==========================================
    List<TrademarkDto> selectTrademarkList(TrademarkSearchReq params);
    int countTrademarkList(TrademarkSearchReq params);

    // ==========================================
    // 2. 소멸 예정(만료 임박) 상표 조회
    // ==========================================
//    List<TrademarkDto> selectExpiringTrademarks(TrademarkSearchReq params);
//    int countExpiringTrademarks(TrademarkSearchReq params);

    // ==========================================
    // 3. 상세 조회
    // ==========================================
    TrademarkDto selectTrademarkById(@Param("id") Long id);

    // ==========================================
    // 4. 북마크 기능 (조회, 추가, 삭제)
    // ==========================================
    int existsBookmark(@Param("userId") Long userId, @Param("patentId") Long patentId);
    void insertBookmark(@Param("userId") Long userId, @Param("patentId") Long patentId);
    void deleteBookmark(@Param("userId") Long userId, @Param("patentId") Long patentId);
}