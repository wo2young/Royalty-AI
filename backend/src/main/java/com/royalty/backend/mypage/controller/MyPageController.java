package com.royalty.backend.mypage.controller;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

// [Real] 👇 1. 시큐리티 연동 시 주석 해제
// import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    /**
     * 유저 ID 처리기
     * - Test 모드: null이 들어오면 1L 반환
     * - Real 모드: 실제 userId가 들어오면 그대로 반환
     */
    private Long getUserId(Long authenticatedUserId) {
        return authenticatedUserId != null ? authenticatedUserId : 1L;
    }

    // ==========================================
    // 1. 🏠 마이페이지 대시보드
    // ==========================================
    @GetMapping("")
    public ResponseEntity<MyPageDashboardDTO> getDashboard(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId
    ) {
        // [Test] 👇 현재 사용 (테스트용)
        Long finalUserId = getUserId(null); 
        
        // [Real] 👇 나중에 위 줄 지우고 사용 (로그인용)
        // Long finalUserId = getUserId(userId); 

        log.info("대시보드 조회: UserID={}", finalUserId);
        return ResponseEntity.ok(myPageService.getDashboard(finalUserId));
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리 (CRUD)
    // ==========================================

    @GetMapping("/brand")
    public ResponseEntity<List<BrandDTO>> getBrandList(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId
    ) {
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        return ResponseEntity.ok(myPageService.getMyBrands(finalUserId));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<BrandDetailDTO> getBrandDetail(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {
        
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        return ResponseEntity.ok(myPageService.getBrandDetail(finalUserId, brandId));
    }

    @PostMapping(value = "/brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createBrand(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("logoImage") MultipartFile logoImage) {
        
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        log.info("브랜드 등록: UserID={}, Name={}", finalUserId, brandName);
        myPageService.createBrand(finalUserId, brandName, category, description, logoImage);
        return ResponseEntity.ok("브랜드가 성공적으로 등록되었습니다.");
    }
    
    @PostMapping(value = "/brand/{brandId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateBrand(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "logoImage", required = false) MultipartFile logoImage
    ) {
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        myPageService.updateBrand(finalUserId, brandId, brandName, category, description, logoImage);
        return ResponseEntity.ok("브랜드 정보가 수정되었습니다.");
    }

    @DeleteMapping("/brand/{brandId}")
    public ResponseEntity<String> deleteBrand(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {
        
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        myPageService.deleteBrand(finalUserId, brandId);
        return ResponseEntity.ok("브랜드가 삭제되었습니다.");
    }

    @PatchMapping("/brand/{brandId}/notification")
    public ResponseEntity<String> toggleNotification(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId,
            @RequestParam boolean enabled) {
        
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        myPageService.toggleNotification(finalUserId, brandId, enabled);
        String status = enabled ? "ON" : "OFF";
        return ResponseEntity.ok("알림 설정이 변경되었습니다. (" + status + ")");
    }

    // ==========================================
    // 3. ⭐ 북마크 (찜한 상표)
    // ==========================================
    
    @GetMapping("/bookmark")
    public ResponseEntity<List<BookmarkDTO>> getBookmarkList(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId
    ) {
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        return ResponseEntity.ok(myPageService.getBookmarks(finalUserId));
    }
    
    // ==========================================
    // 4. 📄 분석 리포트 PDF 다운로드
    // ==========================================
    @GetMapping("/brand/{brandId}/report")
    public ResponseEntity<byte[]> downloadReport(
            // [Real] 👇 파라미터 주석 해제
            // @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {
        
        // [Test] 👇 현재 사용
        Long finalUserId = getUserId(null);
        
        // [Real] 👇 나중에 사용
        // Long finalUserId = getUserId(userId);

        log.info("리포트 다운로드: UserID={}, BrandId={}", finalUserId, brandId);

        byte[] pdfFile = myPageService.generateBrandReport(finalUserId, brandId);

        String fileName = String.format("Report_%d_%s.pdf", 
                brandId, java.time.LocalDate.now().toString().replace("-", ""));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfFile);
    }
}