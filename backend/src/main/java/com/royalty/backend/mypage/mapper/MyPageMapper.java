package com.royalty.backend.mypage.mapper;

import com.royalty.backend.mypage.dto.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageMapper {

    // ==========================================
    // 1. 내 브랜드 관리 (Brand)
    // ==========================================

    // 내 브랜드 목록 조회
    List<BrandDTO> selectMyBrands(Long userId);

    // 브랜드 상세 기본 정보 조회
    BrandDetailDTO selectBrandDetail(@Param("userId") Long userId, @Param("brandId") Long brandId);

    // 브랜드 등록 (insert 후, 생성된 ID가 brandDTO.brandId에 담김)
    void insertBrand(BrandDTO brandDTO);

    // 브랜드 로고 이미지 경로 저장
    void insertBrandLogo(@Param("brandId") Long brandId, @Param("imagePath") String imagePath);

    // 알림 설정 변경 (ON/OFF)
    void updateNotificationStatus(@Param("userId") Long userId, 
                                  @Param("brandId") Long brandId, 
                                  @Param("isEnabled") boolean isEnabled);

    // 브랜드 삭제
    void deleteBrand(@Param("userId") Long userId, @Param("brandId") Long brandId);


    // ==========================================
    // 2. 상세 화면 서브 데이터 (History & Report)
    // ==========================================

    // 로고 변경 이력 조회
    List<BrandHistoryDTO> selectBrandHistory(Long brandId);

    // 분석 리포트 목록 조회
    List<ReportDTO> selectBrandReports(Long brandId);


    // ==========================================
    // 3. 북마크 (Bookmark)
    // ==========================================

    // 북마크 목록 조회 (페이징 없이 전체)
    List<BookmarkDTO> selectBookmarks(Long userId);
}