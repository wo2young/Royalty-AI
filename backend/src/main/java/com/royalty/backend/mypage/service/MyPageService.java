package com.royalty.backend.mypage.service;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor // 매퍼를 자동으로 연결(주입)해줍니다.
public class MyPageService {

    private final MyPageMapper myPageMapper;
    /**
     * 사용자의 북마크 리스트를 조회합니다.
     * @param userId 로그인한 사용자 ID
     * @return 북마크된 상표 정보 리스트
     */
    @Transactional(readOnly = true) // 읽기 전용으로 설정하면 성능이 더 좋아집니다.
    public List<BookmarkResponseDTO> getBookmarkList(Long userId) {
        
        // 1. DB에서 북마크 리스트 가져오기
        List<BookmarkResponseDTO> bookmarks = myPageMapper.selectMyBookmarks(userId);
        
        // 2. (선택사항) 비즈니스 로직 처리 
        // 예: 이미지 경로가 비어있다면 디폴트 이미지 세팅 등
        /*
        bookmarks.forEach(item -> {
            if (item.getImageUrl() == null || item.getImageUrl().isEmpty()) {
                item.setImageUrl("https://example.com/default-logo.png");
            }
        });
        */

        return bookmarks;
    }
}