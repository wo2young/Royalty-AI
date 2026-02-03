package com.royalty.backend.Analysis.TradeService;

import java.io.IOException;
import java.net.URL;
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

    /**
     * [기능 1] 유사 상표 검색 (수정됨: logoUrl 파라미터 추가 & 다운로드 로직 적용)
     * - 파일이 없으면 logoUrl을 다운로드해서 AI로 전송 -> 이미지 유사도 0점 문제 해결
     */
    public List<DhTrademarkSearchResponseDto> search(String keyword, MultipartFile logo, String logoUrl) {
        String aiUrl = "http://localhost:8000/api/v1/search/hybrid";
        
        boolean hasText = keyword != null && !keyword.isBlank();
        boolean hasFile = logo != null && !logo.isEmpty();
        boolean hasUrl = logoUrl != null && !logoUrl.isBlank();

        if (!hasText && !hasFile && !hasUrl) {
            System.out.println("검색어와 이미지가 모두 없습니다.");
            return new ArrayList<>();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            if (hasText) body.add("query_text", keyword);

            // [핵심 해결 1] 이미지를 AI 서버에 보내는 로직 강화
            if (hasFile) {
                // 1. 파일이 직접 들어온 경우 (업로드)
                body.add("file", new ByteArrayResource(logo.getBytes()) {
                    @Override
                    public String getFilename() {
                        return logo.getOriginalFilename() != null ? logo.getOriginalFilename() : "logo.png";
                    }
                });
            } else if (hasUrl) {
                // 2. 파일은 없고 URL만 있는 경우 (내 브랜드 분석) -> 다운로드해서 보냄
                byte[] imageBytes = downloadImageBytes(logoUrl); 
                if (imageBytes != null) {
                    body.add("file", new ByteArrayResource(imageBytes) {
                        @Override
                        public String getFilename() {
                            return "s3_image.png"; // 가상의 파일명 부여
                        }
                    });
                }
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

                // 점수 계산 (이미지 유무 플래그 갱신: 파일이 있거나 URL이 있으면 hasImage = true)
                calculateScores(dto, m, hasText, (hasFile || hasUrl));
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
     * [기능 2] 내 브랜드 기본 저장
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
            tradeMapper.insertBrand(saveDto); 
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
     * [기능 3] AI 정밀 분석
     * - 수정됨: 재계산 로직 삭제. search에서 계산된 '정답' 값을 GPT에게 강제 주입.
     */
    public DhTrademarkSearchResponseDto analyzeSingleResult(
            String keyword,
            DhTrademarkSearchResponseDto target,
            Long userId,
            String logoPath,
            int brandId
    ) {
        if (target == null) return null;

        // search에서 계산된 '원본 정답' (예: 31.0)
        float correctScore = target.getCombinedSimilarity();

        // GPT에게 이 점수를 그대로 쓰라고 명령 (재계산 금지)
        String prompt = String.format(
                "내 상표명: '%s'\n" +
                "대상 상표: {ID: %d, 이름: '%s', 유사도: %.1f%%}\n" +
                "\n" +
                "위 두 상표를 비교 분석하여 상표·법률 전문가 수준의 리포트를 작성해라.\n" +
                "\n" +
                "🔥🔥 **[절대 제약 사항]** 🔥🔥\n" +
                "1. **유사도 수치 고정**: 분석 요약(aiAnalysisSummary) 작성 시, 내가 준 수치 **'%.1f%%'**를 그대로 인용해라. (AI가 재계산 금지)\n" +
                "2. **판단 기준**: 너의 주관이 아닌, 위 유사도 수치를 기준으로 위험/안전을 판단해라.\n" +
                "\n" +
                "응답 포맷 (JSON): {\"aiAnalysisSummary\": \"(유사도 %.1f%% 인용 필수)...\", \"aiDetailedReport\": \"...\", \"aiSolution\": \"...\", \"riskLevel\": \"...\"}",
                keyword,
                target.getPatentId(),
                target.getTrademarkName(),
                correctScore,
                correctScore,
                correctScore
        );

        try {
            Map<String, Object> aiResult = gptClient.getAnalysisReport(prompt);

            target.setRiskLevel(DhTradeUtils.convertRiskLevel((String) aiResult.get("riskLevel")));
            target.setAiSummary((String) aiResult.get("aiAnalysisSummary"));
            target.setAiDetailedReport((String) aiResult.get("aiDetailedReport"));
            target.setAiSolution(aiResult.get("aiSolution"));
            target.setAnalysisDetail(objectMapper.writeValueAsString(aiResult));

            // 식별값 주입
            target.setBrandId(brandId);
            target.setLogoPath(logoPath);
            target.setBrandName(keyword);

            // [수정] search에서 나온 'CombinedSimilarity'(31점)를 DB 저장용 필드에 매핑
            // 저장 시 이 최종 점수가 기록되도록 함.
            target.setTextSimilarity(correctScore);

            return target;

        } catch (Exception e) {
            System.err.println("AI 분석 중 에러: " + e.getMessage());
            e.printStackTrace();
            return target;
        }
    }

    /**
     * [기능 4] 분석 결과 저장
     * - 수정됨: 버전 관리 (Max + 1) 로직 추가
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

        // [핵심 해결 2] 버전 업 로직 추가 (Mapper 메서드 필요)
        Integer maxVersion = tradeMapper.findMaxVersionByBrandId(dto.getBrandId());
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;
        dto.setVersion(nextVersion);

        System.out.println(">>> [Version Control] Brand ID: " + dto.getBrandId() + ", New Version: " + nextVersion);

        try {
            tradeMapper.saveMyBrand(dto);          
            tradeMapper.insertBrandAnalysis(dto); 
            tradeMapper.updateBrandDescription(dto.getBrandId(), dto.getAiSummary());
        } catch (Exception e) {
            System.err.println("분석 저장 중 에러: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // -------------------------------------------------------
    // [Helper] URL 이미지를 바이트로 다운로드 (네이티브 Java)
    // -------------------------------------------------------
    private byte[] downloadImageBytes(String imageUrl) {
        try (java.io.InputStream in = new URL(imageUrl).openStream()) {
            return in.readAllBytes();
        } catch (Exception e) {
            System.err.println("이미지 다운로드 실패: " + imageUrl);
            return null;
        }
    }

    // calculateScores 메서드 유지
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