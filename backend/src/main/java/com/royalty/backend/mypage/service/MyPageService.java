package com.royalty.backend.mypage.service;

import com.royalty.backend.mypage.dto.*;
import java.util.List;

/**
 * [Service Interface] 마이페이지 비즈니스 로직 규격
 * 북마크, 브랜드 관리, 히스토리, 알림, 리포트 관련 기능을 정의합니다.
 */
public interface MyPageService {

    // =========================================================================
    // 1. BOOKMARK (북마크)
    // =========================================================================

    /** 내가 찜한 외부 상표 목록 조회 */
    List<BookmarkResponseDTO> getBookmarkList(Long userId);


    // =========================================================================
    // 2. BRAND MANAGEMENT (브랜드 관리)
    // =========================================================================

    /** 사용자가 등록한 브랜드 전체 목록 조회 */
    List<BrandDetailDTO> getBrandList(Long userId);

    /** 특정 브랜드의 상세 정보(기본정보 + 리스크 + 히스토리 리스트) 조회 */
    BrandDetailDTO getBrandDetail(Long brandId);
    
    /** 브랜드 정보(이름, 로고) 수정 및 버전업(History) 처리 */
    void updateBrandInfo(BrandDetailDTO brandDTO);

    /** AI 엔진을 통한 브랜드 유사도 재분석 실행 */
    void reAnalyzeBrand(Long brandId);


    // =========================================================================
    // 3. HISTORY & CHART (이력 및 시각화)
    // =========================================================================

    /** 브랜드의 모든 로고 변경 이력 및 유사도 차트용 데이터 조회 */
    List<BrandHistoryDTO> getBrandHistoryList(Long brandId);


    // =========================================================================
    // 4. NOTIFICATION (알림 센터)
    // =========================================================================

    /** 사용자의 읽지 않은 알림을 포함한 전체 알림 목록 조회 */
    List<NotificationDTO> getNotifications(Long userId);

    /** 특정 알림의 읽음 상태(is_read)를 true로 업데이트 */
    void markNotificationAsRead(Long notificationId);


    // =========================================================================
    // 5. REPORT (PDF 리포트)
    // =========================================================================

    /** 사용자의 브랜드별 생성된 리포트 목록 조회 */
    List<ReportDTO> getReportList(Long userId);

    /** * 리포트 파일 경로 조회 
     * 다운로드 시 DB에 저장된 실제 파일 경로나 S3 URL을 반환합니다.
     */
    String getReportFilePath(Long reportId);

    /* * [참고] byte[] getReportPdf(Long reportId) 는 서버 메모리 부담을 줄이기 위해 
     * 직접 스트림으로 전송하거나 FilePath를 반환하는 방식으로 대체 권장하여 
     * 필요 시에만 추가 구현합니다.
     */
}