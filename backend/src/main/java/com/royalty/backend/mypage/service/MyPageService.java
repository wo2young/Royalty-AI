package com.royalty.backend.mypage.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.royalty.backend.mypage.dto.*;
import com.royalty.backend.mypage.mapper.MyPageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MyPageMapper myPageMapper;
    private final S3Service s3Service;
    private final BrandReportGenerator brandReportGenerator; 

    private static final ObjectMapper OM = new ObjectMapper();

    // ==========================================
    // 1. 🏠 대시보드
    // ==========================================
    @Transactional(readOnly = true)
    public MyPageDashboardDTO getDashboard(Long userId) {
        MyPageDashboardDTO dashboard = new MyPageDashboardDTO();
        dashboard.setUserId(userId);

        List<BrandDTO> brands = myPageMapper.selectMyBrands(userId);
        dashboard.setTotalBrands(brands.size());
        dashboard.setRecentBrands(brands.stream().limit(3).collect(Collectors.toList()));

        List<BookmarkDTO> bookmarks = myPageMapper.selectBookmarks(userId);
        dashboard.setTotalBookmarks(bookmarks.size());
        dashboard.setRecentBookmarks(bookmarks.stream().limit(3).collect(Collectors.toList()));

        return dashboard;
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리
    // ==========================================
    @Transactional(readOnly = true)
    public List<BrandDTO> getMyBrands(Long userId) {
        return myPageMapper.selectMyBrands(userId);
    }

    @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long userId, Long brandId) {
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(userId, brandId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않거나 권한이 없는 브랜드입니다.");
        }
        List<BrandHistoryDTO> history = myPageMapper.selectBrandHistory(brandId);
        if (history != null) {
            for (BrandHistoryDTO h : history) {
                fillAiFieldsFromAnalysisDetail(h);
            }
        }
        detail.setHistoryList(history);
        return detail;
    }

    @Transactional
    public void createBrand(Long userId, String brandName, String category, String description, MultipartFile logoImage) {
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandName(brandName);
        brandDTO.setCategory(category);
        brandDTO.setDescription(description);

        myPageMapper.insertBrand(brandDTO);

        String imagePath = "";
        if (logoImage != null && !logoImage.isEmpty()) {
            imagePath = s3Service.upload(logoImage);
            myPageMapper.insertBrandLogo(brandDTO.getBrandId(), imagePath);
        }
        myPageMapper.insertBrandHistory(brandDTO.getBrandId(), imagePath, "최초 등록");
    }

    @Transactional
    public void updateBrand(Long userId, Long brandId, String name, String category, String desc, MultipartFile file) {
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandId(brandId);
        brandDTO.setBrandName(name);
        brandDTO.setCategory(category);
        brandDTO.setDescription(desc);

        myPageMapper.updateBrand(brandDTO);

        if (file != null && !file.isEmpty()) {
            String newS3Url = s3Service.upload(file);
            if (myPageMapper.countBrandLogo(brandId) > 0) {
                myPageMapper.updateBrandLogo(brandId, newS3Url);
            } else {
                myPageMapper.insertBrandLogo(brandId, newS3Url);
            }
        }
    }

    @Transactional
    public void deleteBrand(Long userId, Long brandId) {
        myPageMapper.deleteBrand(userId, brandId);
    }

    @Transactional
    public void toggleNotification(Long userId, Long brandId, boolean enabled) {
        myPageMapper.updateNotificationStatus(userId, brandId, enabled);
    }

    // ==========================================
    // 3. ⭐ 북마크
    // ==========================================
    public List<BookmarkDTO> getBookmarkList(Long userId) {
        return myPageMapper.selectBookmarks(userId);
    }

    // ==========================================
    // 4. 📄 상표 분석 리포트 PDF 다운로드 (최종 수정)
    // ==========================================
    @Transactional
    public byte[] generateBrandReport(Long userId, Long brandId) {

        // 1. 데이터 준비
        BrandDetailDTO brand = getBrandDetail(userId, brandId);
        List<BrandHistoryDTO> historyList = brand.getHistoryList();
        
        if (historyList == null || historyList.isEmpty()) {
            throw new IllegalStateException("분석 데이터가 존재하지 않아 리포트를 생성할 수 없습니다.");
        }

        // 2. 핵심 로직: 점수 계산
        BrandHistoryDTO latest = pickLatestHistory(historyList);
        float imageSim = normalizeToPercent(latest.getImageSimilarity() != null ? latest.getImageSimilarity() : 0f);
        float textSim  = normalizeToPercent(latest.getTextSimilarity()  != null ? latest.getTextSimilarity()  : 0f);
        float maxSim = Math.max(imageSim, textSim);
        int probability = clampInt(Math.round(100 - maxSim), 0, 100);

        // 3. ⭐ [NEW] BI 데이터 조회 및 파싱
        BrandBiData biData = getBiDataOrFallback(brandId, brand);

        // 4. PDF 생성 위임 (biData 전달)
        byte[] pdfBytes = brandReportGenerator.generate(brand, latest, historyList, userId, probability, biData);

        // 5. ⭐ [NEW] 리포트 생성 기록 저장
        myPageMapper.insertReport(brandId, "GENERATED_ON_" + System.currentTimeMillis());

        return pdfBytes;
    }

    // ==========================================
    // Private Helper Logic
    // ==========================================

    // [NEW] DB JSON 파싱 -> BrandBiData 변환 (KR 우선, EN 후순위)
    private BrandBiData getBiDataOrFallback(Long brandId, BrandDetailDTO brand) {
        String json = myPageMapper.selectBrandIdentityJson(brandId);
        
        if (json != null && !json.isBlank()) {
            try {
                JsonNode root = OM.readTree(json);
                
                String mission = extractText(root, "core");
                List<String> keywords = extractList(root, "brandKeywords");
                List<String> slogans = extractList(root, "copyExamples");
                
                return new BrandBiData(mission, keywords, slogans);

            } catch (Exception e) {
                log.error("BI 데이터 파싱 실패 brandId={}", brandId, e);
            }
        }
        
        // 데이터 없거나 에러 시 기본값
        return new BrandBiData(
            brand.getCategory() + " 분야에서 신뢰를 전달하는 " + brand.getBrandName(),
            List.of("신뢰", "성장", "가치"),
            List.of(brand.getBrandName() + ", 당신의 선택.")
        );
    }

    // 텍스트 추출 (kr -> en)
    private String extractText(JsonNode parent, String key) {
        if (!parent.has(key)) return "";
        JsonNode node = parent.get(key);
        if (node.has("kr") && !node.get("kr").asText().isBlank()) return node.get("kr").asText();
        if (node.has("en")) return node.get("en").asText();
        return "";
    }

    // 리스트 추출 (kr -> en)
    private List<String> extractList(JsonNode parent, String key) {
        List<String> result = new ArrayList<>();
        if (!parent.has(key)) return result;
        
        JsonNode node = parent.get(key);
        JsonNode targetArray = null;

        if (node.has("kr") && node.get("kr").isArray() && !node.get("kr").isEmpty()) {
            targetArray = node.get("kr");
        } else if (node.has("en") && node.get("en").isArray()) {
            targetArray = node.get("en");
        }

        if (targetArray != null) {
            for (JsonNode item : targetArray) {
                result.add(item.asText());
            }
        }
        return result;
    }

    // (기존 유틸 메서드 유지)
    private BrandHistoryDTO pickLatestHistory(List<BrandHistoryDTO> list) {
        return list.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(BrandHistoryDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElseThrow(() -> new IllegalStateException("히스토리 없음"));
    }

    private float normalizeToPercent(float v) {
        return (v <= 1.0f && v >= 0f) ? v * 100f : Math.max(0f, Math.min(100f, v));
    }

    private int clampInt(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private void fillAiFieldsFromAnalysisDetail(BrandHistoryDTO h) {
        if (h == null) return;
        h.setAiAnalysisSummary(h.getAiSummary());
        String raw = h.getAnalysisDetail();
        if (raw == null || raw.isBlank()) return;
        try {
            JsonNode root = tryParseJson(raw);
            h.setAiAnalysisSummary(textOrFallback(root, "aiAnalysisSummary", h.getAiSummary()));
            h.setAiDetailedReport(textOrFallback(root, "aiDetailedReport", null));
            h.setAiSolution(textOrFallback(root, "aiSolution", null));
        } catch (Exception e) {
            log.warn("파싱 실패: {}", e.getMessage());
        }
    }
    
    private JsonNode tryParseJson(String raw) throws Exception {
        try { return OM.readTree(raw); } 
        catch (Exception e) { return OM.readTree(normalizePossiblyEscapedJson(raw)); }
    }

    private String normalizePossiblyEscapedJson(String s) {
        s = s.trim();
        if ((s.startsWith("\"") && s.endsWith("\""))) s = s.substring(1, s.length() - 1);
        return s.replace("\\\"", "\"").replace("\\n", "\n");
    }

    private String textOrFallback(JsonNode root, String key, String fallback) {
        if (root == null || !root.has(key)) return fallback;
        return root.get(key).asText(fallback);
    }
}