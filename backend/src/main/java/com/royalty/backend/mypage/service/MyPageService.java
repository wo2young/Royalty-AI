package com.royalty.backend.mypage.service;

import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MyPageMapper myPageMapper;

    // 파일 저장 경로 (application.yml에서 설정 가능, 여기선 하드코딩 예시)
    private static final String UPLOAD_DIR = "C:/uploads/logos/";

    // ==========================================
    // 1. 🏠 대시보드 (Dashboard)
    // ==========================================
    @Transactional(readOnly = true)
    public MyPageDashboardDTO getDashboard(Long userId) {
        MyPageDashboardDTO dashboard = new MyPageDashboardDTO();
        dashboard.setUserId(userId);

        // 1. 내 브랜드 요약 (전체 가져와서 상위 3개만 자르기)
        List<BrandDTO> brands = myPageMapper.selectMyBrands(userId);
        dashboard.setTotalBrands(brands.size());
        dashboard.setRecentBrands(brands.stream().limit(3).collect(Collectors.toList()));

        // 2. 내 북마크 요약 (전체 가져와서 상위 3개만 자르기)
        List<BookmarkDTO> bookmarks = myPageMapper.selectBookmarks(userId);
        dashboard.setTotalBookmarks(bookmarks.size());
        dashboard.setRecentBookmarks(bookmarks.stream().limit(3).collect(Collectors.toList()));

        return dashboard;
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리 (Brand Logic)
    // ==========================================
    
    // 목록 조회
    @Transactional(readOnly = true)
    public List<BrandDTO> getMyBrands(Long userId) {
        return myPageMapper.selectMyBrands(userId);
    }

    // 상세 조회 (기본정보 + 히스토리 + 리포트 결합)
    @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long userId, Long brandId) {
        // 1. 기본 정보 조회
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(userId, brandId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않거나 권한이 없는 브랜드입니다.");
        }

        // 2. 히스토리 리스트 조회 & 주입
        List<BrandHistoryDTO> histories = myPageMapper.selectBrandHistory(brandId);
        detail.setHistoryList(histories);

        // 3. 리포트 리스트 조회 & 주입
        List<ReportDTO> reports = myPageMapper.selectBrandReports(brandId);
        detail.setReportList(reports);

        return detail;
    }

    // 브랜드 등록 (이미지 업로드 -> DB 저장)
    @Transactional
    public void createBrand(Long userId, String brandName, String category, String description, MultipartFile logoImage) {
        
        // 1. 이미지 파일 업로드 (로컬 저장 후 경로 반환)
        String imagePath = uploadFile(logoImage);

        // 2. 브랜드 정보 저장 (BrandDTO 생성)
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandName(brandName);
        brandDTO.setCategory(category);
        brandDTO.setDescription(description); // DTO에 description 필드 있어야 함

        // Mapper 호출 (MyBatis가 실행 후 brandDTO.setBrandId()를 자동으로 수행)
        myPageMapper.insertBrand(brandDTO);

        // 3. 로고 테이블 저장 (생성된 brandId 사용)
        if (brandDTO.getBrandId() != null) {
            myPageMapper.insertBrandLogo(brandDTO.getBrandId(), imagePath);
        } else {
            throw new RuntimeException("브랜드 등록 실패: ID 생성 오류");
        }
    }

    // 브랜드 삭제
    @Transactional
    public void deleteBrand(Long userId, Long brandId) {
        myPageMapper.deleteBrand(userId, brandId);
    }

    // 알림 설정 변경
    @Transactional
    public void toggleNotification(Long userId, Long brandId, boolean enabled) {
        myPageMapper.updateNotificationStatus(userId, brandId, enabled);
    }

    // ==========================================
    // 3. ⭐ 북마크 (Bookmark)
    // ==========================================
    @Transactional(readOnly = true)
    public List<BookmarkDTO> getBookmarks(Long userId) {
        return myPageMapper.selectBookmarks(userId);
    }


    // ==========================================
    // 🛠️ 내부 유틸 메서드 (파일 업로드)
    // ==========================================
    private String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 필요합니다.");
        }

        try {
            // 파일명 중복 방지 (UUID 사용)
            String originalFilename = file.getOriginalFilename();
            String storeFileName = UUID.randomUUID() + "_" + originalFilename;
            
            // 실제 저장 경로 생성 (없으면 폴더 생성)
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일 저장
            String fullPath = UPLOAD_DIR + storeFileName;
            file.transferTo(new File(fullPath));

            // DB에 저장할 경로 (웹 접근용 상대 경로 or 절대 경로)
            // 여기서는 절대경로를 그대로 리턴하거나, 웹 서빙용 경로로 변환해야 합니다.
            return fullPath; 

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            throw new RuntimeException("이미지 저장 중 오류가 발생했습니다.");
        }
    }
}