package com.royalty.backend.trademark.service;

import com.royalty.backend.trademark.dto.TrademarkDto;
import com.royalty.backend.trademark.dto.TrademarkSearchReq;
import com.royalty.backend.trademark.mapper.TrademarkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본 읽기 전용
public class TrademarkService {

    private final TrademarkMapper trademarkMapper;

    // ==========================================
    // 1. 조회 로직 (Read)
    // ==========================================

    // 1-1. 기본 상표 리스트 조회 (검색 + 페이징)
    public Map<String, Object> getTrademarkList(TrademarkSearchReq request) {
        return getPagedResult(
            trademarkMapper.selectTrademarkList(request),
            trademarkMapper.countTrademarkList(request),
            request
        );
    }

    // 1-2. 소멸 예정 상표 리스트 조회 (선점 기회 + 페이징)
    public Map<String, Object> getExpiringTrademarks(TrademarkSearchReq request) {
        return getPagedResult(
            trademarkMapper.selectExpiringTrademarks(request),
            trademarkMapper.countExpiringTrademarks(request),
            request
        );
    }

    // 1-3. 상세 조회 (북마크 여부 포함)
    public TrademarkDto getTrademarkDetail(Long patentId, Long userId) {
        TrademarkDto dto = trademarkMapper.selectTrademarkById(patentId);
        
        if (dto != null && userId != null) {
            // 로그인 상태라면 북마크 여부 확인
            int count = trademarkMapper.existsBookmark(userId, patentId);
            dto.setBookmarked(count > 0);
        }
        return dto;
    }

    // ==========================================
    // 2. 변경 로직 (Write) - @Transactional 필수
    // ==========================================

    // 2-1. 북마크 추가
    @Transactional
    public void addBookmark(Long userId, Long patentId) {
        // XML에서 ON CONFLICT 처리가 되어 있어 중복 에러 발생 안 함
        trademarkMapper.insertBookmark(userId, patentId);
    }

    // 2-2. 북마크 삭제
    @Transactional
    public void removeBookmark(Long userId, Long patentId) {
        trademarkMapper.deleteBookmark(userId, patentId);
    }

    // ==========================================
    // 3. 공통 헬퍼 메서드 (Private)
    // ==========================================
    private Map<String, Object> getPagedResult(List<?> list, int totalCount, TrademarkSearchReq req) {
        Map<String, Object> response = new HashMap<>();
        response.put("list", list);
        response.put("totalCount", totalCount);
        response.put("currentPage", req.getPage());
        response.put("totalPages", (int) Math.ceil((double) totalCount / req.getSize()));
        
        return response;
    }
}