package com.royalty.backend.mypage.controller;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal; // 나중에 주석 해제
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    // ⚡ 테스트용 임시 ID (나중에 지우세요)
    private final Long TEST_USER_ID = 1L; 

    // ==========================================
    // 1. 🏠 마이페이지 대시보드
    // ==========================================
    @GetMapping("")
    public ResponseEntity<MyPageDashboardDTO> getDashboard(
            /* @AuthenticationPrincipal Long userId */ // 로그인 연동 전까지 주석 처리
    ) {
        Long userId = TEST_USER_ID; // 임시: 무조건 1번 유저로 진행
        
        log.info("대시보드 조회 요청 (TEST MODE): UserID={}", userId);
        return ResponseEntity.ok(myPageService.getDashboard(userId));
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리 (CRUD)
    // ==========================================

    // 목록 조회
    @GetMapping("/brand")
    public ResponseEntity<List<BrandDTO>> getBrandList(
            /* @AuthenticationPrincipal Long userId */
    ) {
        Long userId = TEST_USER_ID;
        return ResponseEntity.ok(myPageService.getMyBrands(userId));
    }

    // 상세 조회 (히스토리 + 리포트 포함)
    @GetMapping("/brand/{brandId}")
    public ResponseEntity<BrandDetailDTO> getBrandDetail(
            /* @AuthenticationPrincipal Long userId, */
            @PathVariable Long brandId) {
        
        Long userId = TEST_USER_ID;
        return ResponseEntity.ok(myPageService.getBrandDetail(userId, brandId));
    }

    // 등록 (이미지 업로드 필수)
    @PostMapping(value = "/brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createBrand(
            /* @AuthenticationPrincipal Long userId, */
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("logoImage") MultipartFile logoImage) {
        
        Long userId = TEST_USER_ID;
        log.info("브랜드 등록 요청 (TEST): UserID={}, Name={}", userId, brandName);
        
        myPageService.createBrand(userId, brandName, category, description, logoImage);
        return ResponseEntity.ok("브랜드가 성공적으로 등록되었습니다.");
    }

    // 삭제
    @DeleteMapping("/brand/{brandId}")
    public ResponseEntity<String> deleteBrand(
            /* @AuthenticationPrincipal Long userId, */
            @PathVariable Long brandId) {
        
        Long userId = TEST_USER_ID;
        myPageService.deleteBrand(userId, brandId);
        return ResponseEntity.ok("브랜드가 삭제되었습니다.");
    }

    // 알림 설정 변경 (ON/OFF)
    @PatchMapping("/brand/{brandId}/notification")
    public ResponseEntity<String> toggleNotification(
            /* @AuthenticationPrincipal Long userId, */
            @PathVariable Long brandId,
            @RequestParam boolean enabled) {
        
        Long userId = TEST_USER_ID;
        myPageService.toggleNotification(userId, brandId, enabled);
        String status = enabled ? "ON" : "OFF";
        return ResponseEntity.ok("알림 설정이 변경되었습니다. (" + status + ")");
    }

    // ==========================================
    // 3. ⭐ 북마크 (찜한 상표)
    // ==========================================
    
    // 목록 조회 (전체)
    @GetMapping("/bookmark")
    public ResponseEntity<List<BookmarkDTO>> getBookmarkList(
            /* @AuthenticationPrincipal Long userId */
    ) {
        Long userId = TEST_USER_ID;
        return ResponseEntity.ok(myPageService.getBookmarks(userId));
    }
    
    // ==========================================
    // 4. 📄 분석 리포트 PDF 다운로드 (실시간 생성)
    // ==========================================
    @GetMapping("/brand/{brandId}/report")
    public ResponseEntity<byte[]> downloadReport(
            // @AuthenticationPrincipal Long userId, // 로그인 연동 후 주석 해제
            @PathVariable Long brandId) {
        
        // [테스트용] 로그인 없이도 동작하도록 1번 유저로 고정
        Long userId = 1L; 
        
        log.info("리포트 다운로드 요청: BrandId={}", brandId);

        // 1. Service 호출 -> PDF 생성 (byte 배열)
        byte[] pdfFile = myPageService.generateBrandReport(userId, brandId);

        // 2. 파일명 설정 (예: Report_100_20260122.pdf)
        String fileName = String.format("Report_%d_%s.pdf", 
                brandId, java.time.LocalDate.now().toString().replace("-", ""));

        // 3. 응답 헤더 설정 (브라우저가 파일로 인식하게 함)
        return ResponseEntity.ok()
                // 중요: 다운로드 창이 뜨게 하는 헤더
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                // 콘텐츠 타입: PDF
                .contentType(MediaType.APPLICATION_PDF)
                // 내용물 (byte[])
                .body(pdfFile);
    }
}