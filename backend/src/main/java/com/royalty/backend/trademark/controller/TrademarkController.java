package com.royalty.backend.trademark.controller;

import com.royalty.backend.trademark.dto.TrademarkDto;
import com.royalty.backend.trademark.dto.TrademarkSearchReq;
import com.royalty.backend.trademark.service.TrademarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/trademark")
@RequiredArgsConstructor
public class TrademarkController {

    private final TrademarkService trademarkService;

    // ==========================================
    // 1. 조회 API (Read)
    // ==========================================

    // 1-1. 상표 리스트 조회 (검색/필터/페이징)
    // GET /trademark/list
    @GetMapping("/list")
    public ResponseEntity<?> getList(@ModelAttribute TrademarkSearchReq request) {
        Map<String, Object> result = trademarkService.getTrademarkList(request);
        return ResponseEntity.ok(result);
    }

    // 1-2. 소멸 예정 상표 조회 (선점 기회)
    // GET /trademark/expiring
    @GetMapping("/expiring")
    public ResponseEntity<?> getExpiringList(@ModelAttribute TrademarkSearchReq request) {
        Map<String, Object> result = trademarkService.getExpiringTrademarks(request);
        return ResponseEntity.ok(result);
    }

    // 1-3. 상표 상세 조회
    // GET /trademark/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable Long id) {
        TrademarkDto result = trademarkService.getTrademarkDetail(id, getCurrentUserId());
        
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. 북마크 API (Write)
    // ==========================================

    // 2-1. 북마크 추가
    // POST /trademark/{id}/bookmark
    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> addBookmark(@PathVariable Long id) {
        trademarkService.addBookmark(getCurrentUserId(), id);
        return ResponseEntity.ok(Map.of("message", "북마크가 추가되었습니다."));
    }

    // 2-2. 북마크 해제
    // DELETE /trademark/{id}/bookmark
    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<?> removeBookmark(@PathVariable Long id) {
        trademarkService.removeBookmark(getCurrentUserId(), id);
        return ResponseEntity.ok(Map.of("message", "북마크가 해제되었습니다."));
    }

    // ==========================================
    // 3. Helper Methods (Private)
    // ==========================================

    /**
     * 현재 로그인한 사용자의 ID를 반환합니다.
     * TODO: 추후 Spring Security 적용 시 SecurityContextHolder에서 추출하도록 수정 필요
     */
    private Long getCurrentUserId() {
        return 1L; // 테스트용 하드코딩 (1번 유저)
    }
}