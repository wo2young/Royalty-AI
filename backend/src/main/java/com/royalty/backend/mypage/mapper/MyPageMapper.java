package com.royalty.backend.mypage.mapper;

import java.util.List;
import java.util.Map;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.royalty.backend.mypage.dto.*;

@Mapper
public interface MyPageMapper {
    // Bookmark & Notification & Report
    List<BookmarkResponseDTO> selectMyBookmarks(Long userId);
    List<NotificationDTO> selectNotifications(Long userId); // type 제거된 DTO 반환
    int updateNotificationReadStatus(@Param("notificationId") Long notificationId);
    List<ReportDTO> selectReportList(Long userId);
    String selectReportFilePath(Long reportId);

    // Brand Management
    List<BrandDetailDTO> selectBrandListByUserId(Long userId);
    BrandDetailDTO selectBrandDetail(Long brandId); 
    BrandDetailDTO selectBrandDetailById(Long brandId);
    
    // History & Analysis (차트 데이터)
    List<BrandHistoryDTO> selectBrandHistoryList(Long brandId); // imageScore, textScore 포함
    
    // CUD
    int updateBrandName(BrandDetailDTO brandDTO);
    int updateBrandLogoPath(BrandDetailDTO brandDTO);
    int insertBrandHistory(BrandDetailDTO brandDTO); // v1, v2 자동 생성 로직 포함
    int insertBrandAnalysis(Map<String, Object> analysisData); // 재분석 결과 저장
}