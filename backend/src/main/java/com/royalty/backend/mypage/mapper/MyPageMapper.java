package com.royalty.backend.mypage.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
import com.royalty.backend.mypage.dto.BrandListDTO;

@Mapper
public interface MyPageMapper {
    // [조회] 북마크 및 브랜드 목록
    List<BookmarkResponseDTO> selectMyBookmarks(Long userId);
    List<BrandListDTO> selectBrandListByUserId(Long userId);
    BrandListDTO selectBrandDetailById(Long brandId);
    // 1. 브랜드 상세 정보 (기본정보 + 리스크) 조회
    BrandDetailDTO selectBrandDetail(Long brandId);

    // 2. 해당 브랜드의 모든 히스토리 목록 조회
    List<BrandHistoryDTO> selectBrandHistoryList(Long brandId);
    // [수정/삽입] 
    // 반환 타입은 void 또는 int(영향받은 행 수)로 설정합니다.
    // XML에서 사용할 데이터를 전달하기 위해 BrandListDTO를 파라미터로 받습니다.
    void updateBrandName(BrandListDTO brandDTO);
    
    void updateBrandLogoPath(BrandListDTO brandDTO);
    
    void insertBrandHistory(BrandListDTO brandDTO);
}