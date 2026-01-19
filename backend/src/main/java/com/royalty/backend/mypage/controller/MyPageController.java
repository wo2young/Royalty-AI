package com.royalty.backend.mypage.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.service.MyPageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * [Controller] 마이페이지 기능 통합 컨트롤러
 * 북마크, 내 브랜드 관리, 히스토리(버전/차트), 알림, 리포트 기능을 담당합니다.
 */
@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
@Slf4j // 로그 기록을 위해 추가
public class MyPageController {
    private final MyPageService myPageService;

    // =========================================================================
    // [1] 북마크 & 알림 & 리포트
    // =========================================================================
    @GetMapping("/bookmark") 
    public ResponseEntity<List<BookmarkResponseDTO>> getBookmarks(@RequestParam Long userId) { 
        return ResponseEntity.ok(myPageService.getBookmarkList(userId)); 
    }

    @GetMapping("/notification") 
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestParam Long userId) { 
        return ResponseEntity.ok(myPageService.getNotifications(userId)); 
    }

    @PostMapping("/notification/read") 
    public ResponseEntity<Void> readNoti(@RequestParam Long notificationId) { 
        myPageService.markNotificationAsRead(notificationId); 
        return ResponseEntity.ok().build(); 
    }

    @GetMapping("/report") 
    public ResponseEntity<List<ReportDTO>> getReports(@RequestParam Long userId) { 
        return ResponseEntity.ok(myPageService.getReportList(userId)); 
    }

    @GetMapping("/report/{id}") 
    public ResponseEntity<String> getReportPath(@PathVariable Long id) { 
        return ResponseEntity.ok(myPageService.getReportFilePath(id)); 
    }

    // =========================================================================
    // [2] 브랜드 관리 & 히스토리/차트
    // =========================================================================
    @GetMapping("/brand") 
    public ResponseEntity<List<BrandDetailDTO>> getBrands(@RequestParam Long userId) { 
        return ResponseEntity.ok(myPageService.getBrandList(userId)); 
    }

    @GetMapping("/brand/{id}") 
    public ResponseEntity<BrandDetailDTO> getDetail(@PathVariable Long id) { 
        return ResponseEntity.ok(myPageService.getBrandDetail(id)); 
    }

    @PostMapping("/brand/update") 
    public ResponseEntity<String> update(@RequestBody BrandDetailDTO dto) { 
        myPageService.updateBrandInfo(dto); 
        return ResponseEntity.ok("수정 완료"); 
    }

    @GetMapping("/brand/{id}/history") 
    public ResponseEntity<List<BrandHistoryDTO>> getHistory(@PathVariable Long id) { 
        return ResponseEntity.ok(myPageService.getBrandHistoryList(id)); 
    }

    @GetMapping("/brand/{id}/history/chart") 
    public ResponseEntity<List<BrandHistoryDTO>> getChart(@PathVariable Long id) { 
        return ResponseEntity.ok(myPageService.getBrandHistoryList(id)); 
    }

    /**
     * [POST] 브랜드 재분석 실행
     * 명세서: POST /mypage/brand/{id}/analysis
     */
    @PostMapping("/brand/{id}/analysis")
    public ResponseEntity<String> reAnalyze(@PathVariable Long id) {
        log.info("[Controller] Re-analysis request for brand: {}", id);
        try {
            myPageService.reAnalyzeBrand(id);
            return ResponseEntity.ok("재분석이 완료되었습니다.");
        } catch (Exception e) {
            log.error("[Controller] Analysis failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("분석 중 오류 발생");
        }
    }
}