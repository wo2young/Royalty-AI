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
    
    void updateBrand(BrandDTO brandDTO);

	 // @Param 어노테이션을 쓰면 XML에서 #{brandId}, #{imagePath}로 바로 인식됩니다.
	void updateBrandLogo(@Param("brandId") Long brandId, @Param("imagePath") String imagePath);

    // 브랜드 삭제
    void deleteBrand(@Param("userId") Long userId, @Param("brandId") Long brandId);

    // 브랜드 로고 개수 조회 (에러 로그: countBrandLogo)
    int countBrandLogo(@Param("brandId") Long brandId);

    // 현재 로고 경로 조회 (에러 로그: selectCurrentLogoPath)
    String selectCurrentLogoPath(@Param("brandId") Long brandId);
    // 브랜드 히스토리 저장 (에러 로그: insertBrandHistory)
    // 파라미터 순서: Long, String, String
    void insertBrandHistory(@Param("brandId") Long brandId, 
                            @Param("imagePath") String imagePath, 
                            @Param("description") String description);

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