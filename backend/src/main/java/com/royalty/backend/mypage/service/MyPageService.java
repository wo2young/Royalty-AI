package com.royalty.backend.mypage.service;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandListDTO;
import java.util.List;

public interface MyPageService {
    List<BookmarkResponseDTO> getBookmarkList(Long userId);
    List<BrandListDTO> getBrandList(Long userId);
    BrandDetailDTO getBrandDetail(Long brandId);
    
    void updateBrandInfo(BrandListDTO brandDTO);
}