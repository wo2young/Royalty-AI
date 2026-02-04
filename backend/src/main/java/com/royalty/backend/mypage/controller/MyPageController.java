package com.royalty.backend.mypage.controller;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // 나중에 주석 해제
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
    // ==========================================
    // 1. 🏠 마이페이지 대시보드
    // ==========================================
    @GetMapping("")
    public ResponseEntity<MyPageDashboardDTO> getDashboard(
            @AuthenticationPrincipal Long userId
    ) { 
        log.info("대시보드 조회 요청 (TEST MODE): UserID={}", userId);
        return ResponseEntity.ok(myPageService.getDashboard(userId));
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리 (CRUD)
    // ==========================================

    // 목록 조회
    @GetMapping("/brand")
    public ResponseEntity<List<BrandDTO>> getBrandList(
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(myPageService.getMyBrands(userId));
    }

    // 상세 조회 (히스토리 + 리포트 포함)
    @GetMapping("/brand/{brandId}")
    public ResponseEntity<BrandDetailDTO> getBrandDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {
        return ResponseEntity.ok(myPageService.getBrandDetail(userId, brandId));
    }

   // 등록 (브랜드명 필수, 이미지는 선택)
    @PostMapping(value = "/brand", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createBrand(
            @AuthenticationPrincipal Long userId,
            @RequestParam("brandName") String brandName, // 👈 얘는 필수(NOT NULL)
            @RequestParam(value = "category", required = false, defaultValue = "기타") String category,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            // 👇 [중요] 이미지는 이제 필수가 아님!
            @RequestParam(value = "logoImage", required = false) MultipartFile logoImage) {
        
        log.info("브랜드 등록 요청: UserID={}, Name={}, HasImage={}", userId, brandName, (logoImage != null && !logoImage.isEmpty()));
        
        myPageService.createBrand(userId, brandName, category, description, logoImage);
        return ResponseEntity.ok("브랜드가 성공적으로 등록되었습니다.");
    }
    
 // ==========================================
    // [추가] 브랜드 수정 (이미지는 선택 사항)
    // 호환성을 위해 PUT 대신 POST 사용 (URL에 ID 포함)
    // ==========================================
    @PostMapping(value = "/brand/{brandId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateBrand(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "logoImage", required = false) MultipartFile logoImage // ⭐ 수정 시 이미지는 없을 수도 있음
    ) {

        log.info("브랜드 수정 요청: UserID={}, BrandID={}, NameChange={}", userId, brandId, brandName);

        // 서비스 호출 (이미지가 null이면 기존 이미지 유지)
        myPageService.updateBrand(userId, brandId, brandName, category, description, logoImage);
        
        return ResponseEntity.ok("브랜드 정보가 수정되었습니다.");
    }

    // 삭제
    @DeleteMapping("/brand/{brandId}")
    public ResponseEntity<String> deleteBrand(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {
        
        myPageService.deleteBrand(userId, brandId);
        return ResponseEntity.ok("브랜드가 삭제되었습니다.");
    }

    // 알림 설정 변경 (ON/OFF)
    @PatchMapping("/brand/{brandId}/notification")
    public ResponseEntity<String> toggleNotification(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId,
            @RequestParam boolean enabled) {
        
        myPageService.toggleNotification(userId, brandId, enabled);
        String status = enabled ? "ON" : "OFF";
        return ResponseEntity.ok("알림 설정이 변경되었습니다. (" + status + ")");
    }

    // ==========================================
    // 3. ⭐ 북마크 (찜한 상표)
    // ==========================================
    
    // 목록 조회 (전체)
    @GetMapping("/bookmark")
    public ResponseEntity<List<BookmarkDTO>> getMyBookmarks(@AuthenticationPrincipal Long userId) {
        // userId를 서비스로 전달
        return ResponseEntity.ok(myPageService.getBookmarkList(userId));
    }
    
    // ==========================================
    // 4. 📄 분석 리포트 PDF 다운로드 (실시간 생성)
    // ==========================================
    @GetMapping("/brand/{brandId}/report")
    public ResponseEntity<byte[]> downloadReport(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long brandId) {

        byte[] pdfFile = myPageService.generateBrandReport(userId, brandId);

        String fileName = String.format("Report_%d_%s.pdf",
                brandId,
                java.time.LocalDate.now().toString().replace("-", "")
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"; filename*=UTF-8''" + fileName)
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfFile);
    }
}