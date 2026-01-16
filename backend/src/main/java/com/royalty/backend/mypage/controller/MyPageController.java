package com.royalty.backend.mypage.controller;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mypage")
@RequiredArgsConstructor // 이제 Lombok이 생성자를 자동으로 만들어줍니다!
public class MyPageController {

    private final MyPageService myPageService;

    // GET /mypage/bookmark (북마크 목록 조회)
    @GetMapping("/bookmark")
    public ResponseEntity<List<BookmarkResponseDTO>> getMyBookmarks() {
        // 실제 운영시는 토큰에서 추출하겠지만, 일단 테스트용 1번 유저로 세팅!
        Long userId = 1L; 
        
        List<BookmarkResponseDTO> bookmarks = myPageService.getBookmarkList(userId);
        
        return ResponseEntity.ok(bookmarks);
    }
}