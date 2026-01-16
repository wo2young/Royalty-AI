package com.royalty.backend.mypage.mapper;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper // 이 어노테이션이 있어야 MyBatis가 인식합니다.
public interface MyPageMapper {

    /**
     * 특정 사용자의 북마크 목록을 가져오는 메서드
     * 이 메서드 이름(selectMyBookmarks)은 XML의 id와 반드시 일치해야 합니다!
     */
    List<BookmarkResponseDTO> selectMyBookmarks(Long userId);
}