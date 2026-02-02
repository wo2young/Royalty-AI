package com.royalty.backend.Analysis.TradeService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.royalty.backend.Analysis.TradeDTO.DhBrandSaveRequestDto;
import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;
import com.royalty.backend.Analysis.TradeMapper.DhTradeMapper;
import com.royalty.backend.mypage.service.S3Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DhTradeService {

    private final DhTradeMapper tradeMapper;
    private final DhGptClient gptClient;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    // [기능 1] 유사 상표 검색
    public List<DhTrademarkSearchResponseDto> search(String keyword, MultipartFile logo) {
        String aiUrl = "http://localhost:8000/api/v1/search/hybrid";
        boolean hasText = keyword != null && !keyword.isBlank();
        boolean hasImage = logo != null && !logo.isEmpty();

        if (!hasText && !hasImage) {
            System.out.println("검색어와 이미지가 모두 없습니다.");
            return new ArrayList<>();
        }

        try {
            HttpHeaders headers = new HttpHeaders();

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            if (hasText) body.add("query_text", keyword);

            if (hasImage) {
                body.add("file", new ByteArrayResource(logo.getBytes()) {
                    @Override
                    public String getFilename() {
                        return logo.getOriginalFilename() != null ? logo.getOriginalFilename() : "logo.png";
                    }
                });
            }

            body.add("categories", "09,35,42");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            Map<String, Object> response = restTemplate.postForObject(aiUrl, requestEntity, Map.class);

            System.out.println("AI Server Response: " + response);

            if (response == null || !"success".equals(response.get("status"))) {
                System.err.println("AI 서버 응답 실패 또는 status!=success");
                return new ArrayList<>();
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null) return new ArrayList<>();

            List<DhTrademarkSearchResponseDto> dtoList = new ArrayList<>();
            Set<String> seenNames = new HashSet<>();

            for (Map<String, Object> m : results) {
                String name = (String) m.get("name");
                if (name == null) name = (String) m.get("trademark_name");

                if (name == null || seenNames.contains(name)) continue;
                seenNames.add(name);

                DhTrademarkSearchResponseDto dto = new DhTrademarkSearchResponseDto();
                dto.setTrademarkName(name);

                Object idObj = m.get("id");
                int patentId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;
                dto.setPatentId(patentId);

                dto.setCategory(DhTradeUtils.convertCategoryCodeToName(String.valueOf(m.get("category"))));
                dto.setImageUrl((String) m.get("image_url"));

                String applicant = (String) m.get("applicant");
                if (applicant == null && patentId > 0) {
                    try {
                        applicant = tradeMapper.getApplicantByPatentId(patentId);
                    } catch (Exception e) {
                        // 조회 실패 시 무시
                    }
                }
                dto.setApplicant(applicant != null ? applicant : "-");

                calculateScores(dto, m, hasText, hasImage);
                dtoList.add(dto);
            }

            dtoList.sort(Comparator.comparingDouble(DhTrademarkSearchResponseDto::getCombinedSimilarity).reversed());
            return dtoList;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * [기능 2] 내 브랜드 기본 저장 (Brand + Brand_Logo만 저장) + brandId 반환
     */
    @Transactional
    public int saveMyBrandBasic(DhBrandSaveRequestDto dto, Long userId) throws IOException {
        DhTrademarkSearchResponseDto saveDto = new DhTrademarkSearchResponseDto();
        saveDto.setUserId(userId);
        saveDto.setTrademarkName(dto.getBrandName());
        saveDto.setCategory(dto.getCategory());
        saveDto.setAiSummary(dto.getAiSummary());

        if (dto.getLogoFile() != null && !dto.getLogoFile().isEmpty()) {
            String s3Url = s3Service.upload(dto.getLogoFile());
            saveDto.setLogoPath(s3Url);
        } else {
            saveDto.setLogoPath(dto.getLogoPath());
        }

        if (dto.getBrandId() == 0) {
            tradeMapper.insertBrand(saveDto); // 생성된 brandId가 saveDto에 채워짐
        } else {
            saveDto.setBrandId(dto.getBrandId());
            tradeMapper.updateBrand(saveDto);
        }

        if (saveDto.getLogoPath() != null && !saveDto.getLogoPath().isBlank()) {
            if (dto.getBrandId() == 0) {
                tradeMapper.insertBrandLogo(saveDto);
            } else {
                tradeMapper.updateBrandLogo(saveDto);
            }
        }

        System.out.println(">>> 브랜드 기본 정보 저장 완료 (ID: " + saveDto.getBrandId() + ")");
        return saveDto.getBrandId();
    }

    /**
     * [기능 3] AI 정밀 분석 (분석-only: DB 저장 금지)
     */
    public DhTrademarkSearchResponseDto analyzeSingleResult(
            String keyword,
            DhTrademarkSearchResponseDto target,
            Long userId,
            String logoPath,
            int brandId
    ) {
        if (target == null) return null;

        String prompt = String.format(
                "내 상표명: '%s'\n대상 상표: {ID: %d, 이름: '%s', 유사도: %.1f%%}\n" +
                "위 두 상표를 비교 분석하여 상표·법률 전문가 수준의 리포트를 작성해라.\n" +
                "응답 포맷: {\"aiAnalysisSummary\": \"...\", \"aiDetailedReport\": \"...\", \"aiSolution\": \"...\", \"riskLevel\": \"...\"}",
                keyword, target.getPatentId(), target.getTrademarkName(), target.getCombinedSimilarity()
        );

        try {
            Map<String, Object> aiResult = gptClient.getAnalysisReport(prompt);

            target.setRiskLevel(DhTradeUtils.convertRiskLevel((String) aiResult.get("riskLevel")));

            // aiSummary로 세팅하면 DTO에서 aiAnalysisSummary까지 같이 채워줌
            target.setAiSummary((String) aiResult.get("aiAnalysisSummary"));

            target.setAiDetailedReport((String) aiResult.get("aiDetailedReport"));
            target.setAiSolution(aiResult.get("aiSolution"));

            // /save에서 그대로 저장할 상세 JSON
            target.setAnalysisDetail(objectMapper.writeValueAsString(aiResult));

            // /save에서 필요한 식별 값 주입
            target.setBrandId(brandId);
            target.setLogoPath(logoPath);
            target.setBrandName(keyword);

            // 저장용 textSimilarity는 최종값으로 확정
            float finalTextSimilarity = (target.getTextSimilarity() + target.getSoundSimilarity()) / 2.0f;
            target.setTextSimilarity(finalTextSimilarity);

            return target;

        } catch (Exception e) {
            System.err.println("AI 분석 중 에러: " + e.getMessage());
            e.printStackTrace();
            return target;
        }
    }

    /**
     * [기능 4] 분석 결과 저장 (저장-only: /save에서만 호출)
     * - brand_logo_history 저장
     * - brand_analysis 저장
     * - brand.description 업데이트
     */
    @Transactional
    public void saveAnalysisResult(DhTrademarkSearchResponseDto dto, Long userId) {
        if (dto == null) throw new IllegalArgumentException("저장할 데이터가 없습니다.");
        if (userId == null) throw new IllegalArgumentException("로그인이 필요합니다.");
        if (dto.getBrandId() <= 0) throw new IllegalArgumentException("brandId가 유효하지 않습니다. 브랜드 등록 후 저장하세요.");

        if (dto.getAiSummary() == null || dto.getAiSummary().isBlank()) {
            throw new IllegalArgumentException("aiSummary가 없습니다. 분석 후 저장하세요.");
        }
        if (dto.getAnalysisDetail() == null || dto.getAnalysisDetail().isBlank()) {
            throw new IllegalArgumentException("analysisDetail이 없습니다. 분석 후 저장하세요.");
        }

        try {
            tradeMapper.saveMyBrand(dto);          // brand_logo_history
            tradeMapper.insertBrandAnalysis(dto);  // brand_analysis (신규)
            tradeMapper.updateBrandDescription(dto.getBrandId(), dto.getAiSummary());
        } catch (Exception e) {
            System.err.println("분석 저장 중 에러: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void calculateScores(DhTrademarkSearchResponseDto dto, Map<String, Object> m, boolean hasText, boolean hasImage) {
        double tScore = 0.0, vScore = 0.0, sScore = 0.0;

        if (m.containsKey("details") && m.get("details") instanceof Map) {
            Map<String, Object> details = (Map<String, Object>) m.get("details");

            if (details.get("t") instanceof Number) tScore = ((Number) details.get("t")).doubleValue();
            if (details.get("v") instanceof Number) vScore = ((Number) details.get("v")).doubleValue();
            if (details.get("s") instanceof Number) sScore = ((Number) details.get("s")).doubleValue();

            tScore *= 100.0;
            vScore *= 100.0;
            sScore *= 100.0;
        } else {
            if (m.get("score") instanceof Number) {
                double rootScore = ((Number) m.get("score")).doubleValue() * 100.0;
                dto.setCombinedSimilarity((float) rootScore);
                dto.setRiskLevel(rootScore >= 80 ? "위험" : (rootScore >= 60 ? "주의" : "안전"));
                return;
            }
        }

        double combinedScore = 0.0;

        if (hasText && !hasImage) combinedScore = (tScore + sScore) / 2.0;
        else if (!hasText && hasImage) combinedScore = vScore;
        else if (hasText && hasImage) combinedScore = (tScore * 4 + sScore * 4 + vScore * 2) / 10.0;

        if (combinedScore == 0 && m.get("score") instanceof Number) {
            combinedScore = ((Number) m.get("score")).doubleValue() * 100.0;
        }

        dto.setTextSimilarity((float) tScore);
        dto.setImageSimilarity((float) vScore);
        dto.setSoundSimilarity((float) sScore);
        dto.setCombinedSimilarity((float) combinedScore);

        dto.setRiskLevel(combinedScore >= 85.0 ? "위험" : (combinedScore >= 60.0 ? "주의" : "안전"));
    }
}

/*
[전체 정리]
- saveMyBrandBasic: Brand/Brand_Logo만 저장하고 brandId를 반환하도록 변경
- analyzeSingleResult: 분석-only로 변경 (Mapper 호출 제거)
- saveAnalysisResult: 저장-only로 변경 (history + brand_analysis + description 업데이트)
- 실무 중요: 분석과 저장을 분리하면 UX(저장 버튼 의미)와 데이터 정합성이 깨지지 않는다
*/
