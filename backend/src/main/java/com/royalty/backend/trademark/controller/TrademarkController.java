package com.royalty.backend.trademark.controller;

import com.royalty.backend.auth.domain.CustomUserDetails;
import com.royalty.backend.trademark.dto.TrademarkDto;
import com.royalty.backend.trademark.dto.TrademarkSearchReq;
import com.royalty.backend.trademark.service.TrademarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // 👈 import 추가
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
    public ResponseEntity<?> getTrademarkList(
        TrademarkSearchReq searchReq,
        @AuthenticationPrincipal Long userId  // 이미 userId가 Long 타입인 경우
    ) {
        if (userId != null) {
            // userId 자체가 숫자이므로 바로 넣어줍니다.
            searchReq.setUserId(userId); 
            System.out.println("로그인 유저 ID: " + userId); 
        }

        return ResponseEntity.ok(trademarkService.getTrademarkList(searchReq));
    }

    // 1-3. 상표 상세 조회
    // GET /trademark/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId // 👈 토큰에서 진짜 ID 주입
    ) {
        // userId가 null이면(비회원) 서비스에서 처리하거나, SecurityConfig에서 막아야 함
        TrademarkDto result = trademarkService.getTrademarkDetail(id, userId);
        
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // 2. 북마크 API (Write)
    // ==========================================

    // 2-1. 북마크 추가
    // POST /trademark/bookmark/{patentId}
    @PostMapping("/bookmark/{patentId}")
    public ResponseEntity<?> addBookmark(
            @PathVariable Long patentId,
            @AuthenticationPrincipal Long userId // 👈 토큰에서 진짜 ID 주입
    ) {
        trademarkService.addBookmark(userId, patentId);
        return ResponseEntity.ok(Map.of("message", "북마크가 추가되었습니다."));
    }

    // 2-2. 북마크 해제
    // DELETE /trademark/bookmark/{patentId}
    @DeleteMapping("/bookmark/{patentId}")
    public ResponseEntity<?> removeBookmark(
            @PathVariable Long patentId,
            @AuthenticationPrincipal Long userId // 👈 토큰에서 진짜 ID 주입
    ) {
        trademarkService.removeBookmark(userId, patentId);
        return ResponseEntity.ok(Map.of("message", "북마크가 해제되었습니다."));
    }

    // 기존의 getCurrentUserId() 메서드는 삭제했습니다.
}