package com.royalty.backend.mypage.dto;

import lombok.Data;
import java.util.List;

@Data
public class MyPageDashboardDTO {
    private Long userId;
    
    // 상단 통계 숫자
    private int totalBrands;
    private int totalBookmarks;

    // 미리보기 리스트 (최신 3개 정도)
    private List<BrandDTO> recentBrands;
    private List<BookmarkDTO> recentBookmarks;
}