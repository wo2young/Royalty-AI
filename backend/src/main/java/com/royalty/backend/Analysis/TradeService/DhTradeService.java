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
        // 1. 파이썬 서버 설정
        String aiUrl = "http://localhost:8000/api/v1/search/hybrid";
        boolean hasText = keyword != null && !keyword.isBlank();
        boolean hasImage = logo != null && !logo.isEmpty();

        // 2. 방어 로직: 둘 다 없으면 빈 리스트
        if (!hasText && !hasImage) {
            System.out.println("검색어와 이미지가 모두 없습니다.");
            return new ArrayList<>();
        }

        try {
            HttpHeaders headers = new HttpHeaders(); 
            // headers.setContentType(...) 금지 (RestTemplate이 자동 설정)

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
            
            body.add("categories", "09,35,42"); // 카테고리 고정 (필요시 파라미터화)

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // 3. 요청 전송 및 응답 수신
            Map<String, Object> response = restTemplate.postForObject(aiUrl, requestEntity, Map.class);
            
            // [중요] 응답 로그 출력 (디버깅용)
            System.out.println("AI Server Response: " + response);

            if (response == null || !"success".equals(response.get("status"))) {
                System.err.println("AI 서버 응답 실패 또는 status!=success");
                return new ArrayList<>();
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null) return new ArrayList<>();

            List<DhTrademarkSearchResponseDto> dtoList = new ArrayList<>();
            Set<String> seenNames = new HashSet<>();

            // 4. 결과 파싱 (파이썬 JSON 구조 맞춤)
            for (Map<String, Object> m : results) {
                // "name" 키 우선 확인
                String name = (String) m.get("name");
                if (name == null) name = (String) m.get("trademark_name");
                
                // 이름이 없거나 중복이면 패스
                if (name == null || seenNames.contains(name)) continue;
                seenNames.add(name);

                DhTrademarkSearchResponseDto dto = new DhTrademarkSearchResponseDto();
                dto.setTrademarkName(name); // DTO: trademarkName (camelCase)
                
                // ID 파싱 (Integer 안전 변환)
                Object idObj = m.get("id");
                int patentId = idObj instanceof Number ? ((Number) idObj).intValue() : 0;
                dto.setPatentId(patentId);

                // 카테고리 및 이미지
                dto.setCategory(DhTradeUtils.convertCategoryCodeToName(String.valueOf(m.get("category"))));
                dto.setImageUrl((String) m.get("image_url")); // 프론트로 보낼 이미지 URL
                
                // [수정] 출원인(applicant) 정보 보완 로직
                String applicant = (String) m.get("applicant");
                
                // 1. 파이썬 결과에 없으면 DB에서 조회 시도 (N+1 문제 감수하고 정확성 우선)
                if (applicant == null && patentId > 0) {
                    try {
                        applicant = tradeMapper.getApplicantByPatentId(patentId);
                    } catch (Exception e) {
                        // DB 조회 실패 시 로그 남기지 않고 넘어감 (성능 이슈 방지)
                    }
                }
                
                // 2. 그래도 없으면 기본값
                dto.setApplicant(applicant != null ? applicant : "-");

                // 5. 점수 계산 로직 호출
                calculateScores(dto, m, hasText, hasImage);
                dtoList.add(dto);
            }

            // 유사도 순 정렬
            dtoList.sort(Comparator.comparingDouble(DhTrademarkSearchResponseDto::getCombinedSimilarity).reversed());
            
            return dtoList;

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * [기능 2] 내 브랜드 기본 저장 (브랜드 정보와 현재 로고만 담당)
     */
    @Transactional
    public void saveMyBrandBasic(DhBrandSaveRequestDto dto, Long userId) throws IOException {
        DhTrademarkSearchResponseDto saveDto = new DhTrademarkSearchResponseDto();
        saveDto.setUserId(userId);
        saveDto.setTrademarkName(dto.getBrandName());
        saveDto.setCategory(dto.getCategory());
        saveDto.setAiSummary(dto.getAiSummary()); // 간단한 브랜드 설명

        // 1. 이미지 처리 (S3 업로드)
        if (dto.getLogoFile() != null && !dto.getLogoFile().isEmpty()) {
            String s3Url = s3Service.upload(dto.getLogoFile()); 
            saveDto.setLogoPath(s3Url);
        } else {
            saveDto.setLogoPath(dto.getLogoPath());
        }

        // 2. Brand 기본 테이블 저장/업데이트
        if (dto.getBrandId() == 0) {
            tradeMapper.insertBrand(saveDto); // DB에서 생성된 brandId가 saveDto에 담김
        } else {
            saveDto.setBrandId(dto.getBrandId());
            tradeMapper.updateBrand(saveDto);
        }

        // 3. 현재 로고 정보 저장 (brand_logo 테이블)
        if (saveDto.getLogoPath() != null && !saveDto.getLogoPath().isBlank()) {
            if (dto.getBrandId() == 0) {
                tradeMapper.insertBrandLogo(saveDto);
            } else {
                tradeMapper.updateBrandLogo(saveDto);
            }
        }
        
        // [수정] 히스토리 저장은 분석 시점에만 수행하도록 여기서 완전히 제거함
        System.out.println(">>> 브랜드 기본 정보 저장 완료 (ID: " + saveDto.getBrandId() + ")");
    }

    /**
     * [기능 3] AI 정밀 분석 및 히스토리 저장
     */
    @Transactional
    public DhTrademarkSearchResponseDto analyzeSingleResultAndSave(
            String keyword, DhTrademarkSearchResponseDto target, Long userId, String logoPath, int brandId) {
        
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
            target.setAiAnalysisSummary((String) aiResult.get("aiAnalysisSummary"));
            target.setAiDetailedReport((String) aiResult.get("aiDetailedReport")); 
            target.setAiSolution((String) aiResult.get("aiSolution"));

            // [수정] 분석 성공 시 히스토리에 상세 점수와 함께 저장
            if (brandId > 0) {
                DhTrademarkSearchResponseDto historyDto = new DhTrademarkSearchResponseDto();
                historyDto.setBrandId(brandId);
                historyDto.setLogoPath(logoPath);
                historyDto.setPatentId(target.getPatentId());
                historyDto.setAiSummary((String) aiResult.get("aiAnalysisSummary"));
                
                // 유사도 점수 복사 (history 테이블에 저장될 값들)
                historyDto.setTextSimilarity(target.getTextSimilarity());
                historyDto.setImageSimilarity(target.getImageSimilarity());
                
                String detailJson = objectMapper.writeValueAsString(aiResult); 
                historyDto.setAnalysisDetail(detailJson);
                
                // 히스토리 테이블에만 INSERT
                tradeMapper.saveMyBrand(historyDto);
                System.out.println("AI 분석 결과 히스토리 저장 완료 (Brand ID: " + brandId + ")");
            }

            return target;

        } catch (Exception e) {
            System.err.println("AI 분석 중 에러: " + e.getMessage());
            return target;
        }
    }

    private void calculateScores(DhTrademarkSearchResponseDto dto, Map<String, Object> m, boolean hasText, boolean hasImage) {
        double tScore = 0.0, vScore = 0.0, sScore = 0.0;
        
        // details가 있는지 확인
        if (m.containsKey("details") && m.get("details") instanceof Map) {
            Map<String, Object> details = (Map<String, Object>) m.get("details");
            
            // [핵심] null 체크 및 Number 타입 캐스팅 안전장치
            if (details.get("t") instanceof Number) tScore = ((Number) details.get("t")).doubleValue();
            if (details.get("v") instanceof Number) vScore = ((Number) details.get("v")).doubleValue();
            if (details.get("s") instanceof Number) sScore = ((Number) details.get("s")).doubleValue();
            
            // 0.0~1.0 범위라면 100을 곱해줌 (파이썬 응답이 0.1501 등이므로)
            tScore *= 100.0;
            vScore *= 100.0;
            sScore *= 100.0;
        } else {
            // details가 없으면 root의 score라도 사용 (비상용)
            if (m.get("score") instanceof Number) {
                double rootScore = ((Number) m.get("score")).doubleValue() * 100.0;
                dto.setCombinedSimilarity((float) rootScore);
                dto.setRiskLevel(rootScore >= 80 ? "위험" : (rootScore >= 60 ? "주의" : "안전"));
                return; 
            }
        }

        double combinedScore = 0.0;
        // 시나리오별 가중치 계산
        if (hasText && !hasImage) combinedScore = (tScore + sScore) / 2.0;
        else if (!hasText && hasImage) combinedScore = vScore;
        else if (hasText && hasImage) combinedScore = (tScore * 4 + sScore * 4 + vScore * 2) / 10.0;
        
        // 만약 계산된 점수가 너무 낮으면(0점 등) 파이썬이 준 기본 score 사용 고려
        if (combinedScore == 0 && m.get("score") instanceof Number) {
            combinedScore = ((Number) m.get("score")).doubleValue() * 100.0;
        }

        dto.setTextSimilarity((float) tScore);
        dto.setImageSimilarity((float) vScore);
        dto.setSoundSimilarity((float) sScore);
        dto.setCombinedSimilarity((float) combinedScore);
        
        // 위험도 등급 설정
        dto.setRiskLevel(combinedScore >= 85.0 ? "위험" : (combinedScore >= 60.0 ? "주의" : "안전"));
    }
}