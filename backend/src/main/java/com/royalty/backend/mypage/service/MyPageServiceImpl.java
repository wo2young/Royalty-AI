package com.royalty.backend.mypage.service;

import com.royalty.backend.mypage.dto.BookmarkResponseDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
import com.royalty.backend.mypage.dto.BrandListDTO;
import com.royalty.backend.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MyPageMapper myPageMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookmarkResponseDTO> getBookmarkList(Long userId) {
        return myPageMapper.selectMyBookmarks(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BrandListDTO> getBrandList(Long userId) {
        return myPageMapper.selectBrandListByUserId(userId);
    }
    
    @Override
    @Transactional
    public void updateBrandInfo(BrandListDTO brandDTO) {
        // 1. DB에서 현재 상태 단일 행 조회
        BrandListDTO currentInfo = myPageMapper.selectBrandDetailById(brandDTO.getBrandId());
        
        if (currentInfo == null) return; // 해당 브랜드가 없는 경우 예외 처리

        // 2. 실제 변경 여부 체크
        boolean isNameChanged = !currentInfo.getBrandName().equals(brandDTO.getBrandName());
        boolean isLogoChanged = brandDTO.getImagePath() != null && 
                                !brandDTO.getImagePath().equals(currentInfo.getImagePath());

        // 3. 변화가 있을 때만 DB 작업 수행
        if (isNameChanged) {
            myPageMapper.updateBrandName(brandDTO);
        }
        
        if (isLogoChanged) {
            myPageMapper.updateBrandLogoPath(brandDTO);
            myPageMapper.insertBrandHistory(brandDTO); // 여기서 v+1 버전 생성
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long brandId) {
        // 1. 브랜드 기본 정보 및 최신 분석 결과 조회
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(brandId);
        
        if (detail != null) {
            // 2. 해당 브랜드의 전체 히스토리 목록 조회
            List<BrandHistoryDTO> history = myPageMapper.selectBrandHistoryList(brandId);
            
            // 3. 상세 DTO에 히스토리 리스트 세팅
            detail.setHistoryList(history);
        }
        
        return detail;
    }
}