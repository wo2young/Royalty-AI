package com.royalty.backend.mypage.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.mapper.MyPageMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * [Service Implementation] 마이페이지 비즈니스 로직 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MyPageServiceImpl implements MyPageService {
    private final MyPageMapper myPageMapper;

    @Override @Transactional(readOnly = true)
    public List<BookmarkResponseDTO> getBookmarkList(Long userId) { return myPageMapper.selectMyBookmarks(userId); }

    @Override @Transactional(readOnly = true)
    public List<BrandDetailDTO> getBrandList(Long userId) { return myPageMapper.selectBrandListByUserId(userId); }

    @Override @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long brandId) {
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(brandId);
        if (detail != null) {
            detail.setHistoryList(myPageMapper.selectBrandHistoryList(brandId));
        }
        return detail;
    }

    @Override @Transactional
    public void updateBrandInfo(BrandDetailDTO brandDTO) {
        // 1. 현재 DB에 있는 '수정 전' 정보를 가져옵니다.
        BrandDetailDTO current = myPageMapper.selectBrandDetailById(brandDTO.getBrandId());
        if (current == null) throw new IllegalArgumentException("존재하지 않는 브랜드입니다.");

        // [변경포인트] 이름을 먼저 바꿉니다.
        if (!current.getBrandName().equals(brandDTO.getBrandName())) {
            myPageMapper.updateBrandName(brandDTO);
        }

        // [변경포인트] 히스토리를 먼저 '이전 경로'로 쌓고, 그 다음 '새 경로'로 업데이트합니다.
        if (brandDTO.getCurrentImagePath() != null && !brandDTO.getCurrentImagePath().equals(current.getCurrentImagePath())) {
            // (A) 이전 정보(current)를 히스토리에 먼저 기록!
            myPageMapper.insertBrandHistory(current); 
            // (B) 그 다음 DB의 현재 로고 경로를 새 경로(brandDTO)로 업데이트!
            myPageMapper.updateBrandLogoPath(brandDTO);
        }
    }

    @Override @Transactional(readOnly = true)
    public List<BrandHistoryDTO> getBrandHistoryList(Long brandId) { return myPageMapper.selectBrandHistoryList(brandId); }

    @Override @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications(Long userId) { return myPageMapper.selectNotifications(userId); }

    @Override @Transactional
    public void markNotificationAsRead(Long id) { myPageMapper.updateNotificationReadStatus(id); }

    @Override @Transactional(readOnly = true)
    public List<ReportDTO> getReportList(Long userId) { return myPageMapper.selectReportList(userId); }

    @Override @Transactional(readOnly = true)
    public String getReportFilePath(Long id) { return myPageMapper.selectReportFilePath(id); }

    @Override
    @Transactional
    public void reAnalyzeBrand(Long brandId) {
        log.info("[Service] 브랜드 재분석 시작 - ID: {}", brandId);

        // 1. 임시 데이터 생성 (이미지/텍스트 점수 분리)
        // 상황 가정: 이미지는 매우 유사(85점)하지만, 텍스트(이름)는 덜 유사(40점)한 경우
        Double mockImageScore = 0.85; 
        Double mockTextScore = 0.40; 
        String mockRiskLevel = "MEDIUM"; // 종합하면 중간 위험

        Map<String, Object> analysisData = new HashMap<>();
        analysisData.put("brandId", brandId);
        analysisData.put("riskLevel", mockRiskLevel);
        
        // XML의 insertBrandAnalysis 파라미터명과 일치시킴
        analysisData.put("imageScore", mockImageScore);
        analysisData.put("textScore", mockTextScore);

        // 2. DB에 분석 결과 Insert
        int result = myPageMapper.insertBrandAnalysis(analysisData);
        
        if (result > 0) {
            log.info("재분석 완료 - 이미지: {}, 텍스트: {}", mockImageScore, mockTextScore);
        } else {
            throw new RuntimeException("분석 결과 저장 실패");
        }
    }
}