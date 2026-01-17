package com.royalty.backend.mypage.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandListDTO;
import com.royalty.backend.mypage.service.MyPageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    /**
     * 내가 북마크한 상표 목록 조회
     */
    @GetMapping("/bookmark")
    public ResponseEntity<List<BookmarkResponseDTO>> getBookmarks(@RequestParam Long userId) {
        // 실제 운영 시에는 userId를 파라미터가 아닌 세션/토큰에서 추출해야 합니다.
        List<BookmarkResponseDTO> bookmarks = myPageService.getBookmarkList(userId);
        return ResponseEntity.ok(bookmarks);
    }

    /**
     * 내 브랜드 목록 조회
     */
    @GetMapping("/brand")
    public ResponseEntity<List<BrandListDTO>> getBrands(@RequestParam Long userId) {
        List<BrandListDTO> brands = myPageService.getBrandList(userId);
        return ResponseEntity.ok(brands);
    }

    /**
     * 브랜드 정보 수정 (이름 및 로고)
     * 실제 변경사항이 있을 때만 버전(v1, v2...)이 업데이트됨
     */
    @PostMapping("/brand/update")
    public ResponseEntity<String> updateBrand(@RequestBody BrandListDTO brandDTO) {
        try {
            myPageService.updateBrandInfo(brandDTO);
            return ResponseEntity.ok("브랜드 정보 수정이 완료되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 내 브랜드 상세 조회 (기본정보 + 리스크 + 히스토리)
     */
    @GetMapping("/brand/{id}")
    public ResponseEntity<BrandDetailDTO> getBrandDetail(@PathVariable("id") Long brandId) {
        BrandDetailDTO detail = myPageService.getBrandDetail(brandId);
        
        if (detail == null) {
            return ResponseEntity.notFound().build(); // 해당 브랜드가 없으면 404 반환
        }
        
        return ResponseEntity.ok(detail);
    }
}