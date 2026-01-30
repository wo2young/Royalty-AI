package com.royalty.backend.Analysis.TradeService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;
import com.royalty.backend.Analysis.TradeMapper.DhTradeMapper;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class DhTradeService {
    private final DhTradeMapper tradeMapper;
    private final ObjectMapper objectMapper;
    private RestTemplate restTemplate = new RestTemplate();
    private String gptUrl = "https://api.openai.com/v1/chat/completions";
    private String apiKey = "{OPENAI_API_KEY}"; 
  
    /**
     * 카테고리 코드 변환 (09, 35, 42 등 -> 한글명)
     */
    private String convertCategoryCodeToName(String code) {
        if (code == null || code.isBlank()) return "미분류";
        String cleanCode = code.trim();
        if (cleanCode.length() == 1) cleanCode = "0" + cleanCode;

        return switch (cleanCode) {
            case "09" -> "전자기기 및 소프트웨어";
            case "35" -> "광고 및 기업관리";
            case "42" -> "IT 설계 및 기술 서비스";
            default -> "기타 (" + code + ")";
        };
    }

    /**
     * [기능 1] 유사 상표 검색
     */
    public List<DhTrademarkSearchResponseDto> search(String keyword, MultipartFile logo, String logoUrl) {
        String aiUrl = "http://localhost:8000/api/v1/search/hybrid";

        boolean hasText = keyword != null && !keyword.isBlank();
        boolean hasImage = logo != null && !logo.isEmpty();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            if (hasText) body.add("query_text", keyword);
            if (hasImage) body.add("file", logo.getResource());
            body.add("categories", "09,35,42"); 

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            Map<String, Object> response = restTemplate.postForObject(aiUrl, requestEntity, Map.class);

            if (response == null || !"success".equals(response.get("status"))) return new ArrayList<>();

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            List<DhTrademarkSearchResponseDto> dtoList = new ArrayList<>();
            Set<String> seenNames = new HashSet<>();

            if (results == null) return dtoList;

//            for (Map<String, Object> m : results) {
//                String name = (String) m.get("name");
//                if (name == null) name = (String) m.get("trademark_name");
//                
//                if (seenNames.contains(name)) continue;
//                seenNames.add(name);
//
//                DhTrademarkSearchResponseDto dto = new DhTrademarkSearchResponseDto();
//                dto.setTrademarkName(name);
//                
//                int pId = m.get("id") != null ? ((Number) m.get("id")).intValue() : 0;
//                dto.setPatentId(pId);
//
//                // 2. [추가] 이 ID를 들고 직접 DB에 가서 출원인(applicant)을 가져옵니다.
//                String realApplicant = tradeMapper.getApplicantByPatentId(pId);
//
//                // 3. 가져온 진짜 이름을 세팅합니다. (없으면 "출원인 정보 누락" 출력)
//                dto.setApplicant(realApplicant != null ? realApplicant : "출원인 정보 누락");
                
            for (Map<String, Object> m : results) {
                String name = (String) m.get("name");
                if (name == null) name = (String) m.get("trademark_name");
                
                if (seenNames.contains(name)) continue;
                seenNames.add(name);

                DhTrademarkSearchResponseDto dto = new DhTrademarkSearchResponseDto();
                dto.setTrademarkName(name);
                
                // 1. ID 세팅
                int pId = m.get("id") != null ? ((Number) m.get("id")).intValue() : 0;
                dto.setPatentId(pId);

                // 2. DB에서 진짜 출원인(applicant) 가져오기 (단 한 번만!)
                String realApplicant = tradeMapper.getApplicantByPatentId(pId);
                dto.setApplicant(realApplicant != null ? realApplicant : "출원인 정보 없음");

                // 3. 나머지 정보 세팅
                dto.setCategory(convertCategoryCodeToName((String) m.get("category")));
                dto.setImageUrl((String) m.get("image_url"));

                // 이제 중복 없이 바로 점수 계산으로 넘어갑니다.
                double tScore = 0.0, vScore = 0.0, sScore = 0.0;

                Map<String, Object> details = (Map<String, Object>) m.get("details");
                if (details != null) {
                    if (details.get("t") != null) tScore = ((Number) details.get("t")).doubleValue() * 100.0;
                    if (details.get("v") != null) vScore = ((Number) details.get("v")).doubleValue() * 100.0;
                    if (details.get("s") != null) sScore = ((Number) details.get("s")).doubleValue() * 100.0;
                }
   
                
                double combinedScore;
                if (hasText && !hasImage) {
                    // ✅ 상표명만 검색 → t + s
                    combinedScore = (tScore + sScore) / 2.0;
                }
                else if (!hasText && hasImage) {
                    // ✅ 이미지만 검색 → v
                    combinedScore = vScore;
                }
                else if (hasText && hasImage) {
                    // ✅ 상표명(4) + 발음(4) + 이미지(2) → 가중치 적용 (합계 10)
                    // 공식: (tScore * 0.4) + (sScore * 0.4) + (vScore * 0.2)
                    combinedScore = (tScore * 4 + sScore * 4 + vScore * 2) / 10.0;
                }
                else {
                    combinedScore = 0.0;
                }
                
                dto.setTextSimilarity((float) tScore);
                dto.setImageSimilarity((float) vScore);
                dto.setSoundSimilarity((float) sScore);
                dto.setCombinedSimilarity((float) combinedScore);
                dto.setRiskLevel(combinedScore >= 85.0 ? "위험" : (combinedScore >= 60.0 ? "주의" : "안전"));

                dtoList.add(dto);
            }

            dtoList.sort(Comparator.comparingDouble(DhTrademarkSearchResponseDto::getCombinedSimilarity).reversed());
            
            if (!dtoList.isEmpty()) {
                // 기존 analyze 메서드에 있는 본인의 API 키를 여기에 넣으세요

                // 상위 3개 데이터를 바탕으로 GPT 프롬프트 생성
                StringBuilder gptContext = new StringBuilder();
                gptContext.append(String.format("사용자가 입력한 상표명: '%s'\n", keyword));
                gptContext.append("유사한 상표 분석 결과:\n");
                for (int i = 0; i < Math.min(dtoList.size(), 3); i++) {
                    DhTrademarkSearchResponseDto top = dtoList.get(i);
                    gptContext.append(String.format("- %s (유사도: %.1f%%, 위험도: %s)\n", 
                        top.getTrademarkName(), top.getCombinedSimilarity(), top.getRiskLevel()));
                }
                gptContext.append("\n위 데이터를 종합해서 브랜드 등록 가능성을 변리사처럼 1~2문장으로 요약해줘.");

                try {
                    HttpHeaders gptHeaders = new HttpHeaders();
                    gptHeaders.setContentType(MediaType.APPLICATION_JSON);
                    gptHeaders.setBearerAuth(apiKey);

                    Map<String, Object> gptRequest = new HashMap<>();
                    gptRequest.put("model", "gpt-4o");
                    gptRequest.put("messages", List.of(
                        Map.of("role", "system", "content", "너는 상표권 전문 변리사야. 한국어로 짧고 명확하게 요약해줘."),
                        Map.of("role", "user", "content", gptContext.toString())
                    ));

                    HttpEntity<Map<String, Object>> gptEntity = new HttpEntity<>(gptRequest, gptHeaders);
                    Map<String, Object> gptResponse = restTemplate.postForObject(gptUrl, gptEntity, Map.class);

                    List<Map<String, Object>> choices = (List<Map<String, Object>>) gptResponse.get("choices");
                    String summaryResult = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

                    // 모든 DTO에 동일한 요약 내용 주입 (화면 표시용)
                    for (DhTrademarkSearchResponseDto dto : dtoList) {
                        dto.setAiSummary(summaryResult);
                    }
                } catch (Exception gptEx) {
                    System.err.println("GPT 요약 생성 중 오류 발생: " + gptEx.getMessage());
                }
            }
            return dtoList;
        } catch (Exception e) {
        	e.printStackTrace();
            return new ArrayList<>();
        }
    }

    /**
     * [기능 2] 내 브랜드 기본 저장
     * 역할: '저장' 버튼 클릭 시 기초 정보(로고 경로 등)만 DB에 기록
     */
    @Transactional
    public void saveMyBrandBasic(String logoPath,int brandId, Long userId, int patentId, String aiSummary, String searchedBrandName) {
        DhTrademarkSearchResponseDto saveDto = new DhTrademarkSearchResponseDto();
        
        saveDto.setBrandId(brandId);
        saveDto.setLogoPath(logoPath);
        saveDto.setUserId(userId);             // 테스트용 유저 ID
        saveDto.setPatentId(patentId);
        saveDto.setAiSummary(aiSummary);
        saveDto.setTrademarkName(searchedBrandName); // 넘어온 상표명 세팅
        
        // 1. brand 테이블 저장 (브랜드 이름 등)
        tradeMapper.insertBrand(saveDto);
        
        // 2. brand_logo_history 테이블 저장 (이미지 경로 등)
        tradeMapper.saveMyBrand(saveDto);
        
     // 3. brand_logo 저장 (실제 브랜드 로고 테이블 - 새로 추가!)
        tradeMapper.insertBrandLogo(saveDto);
    
    }

    /**
     * [기능 3] AI 정밀 분석 및 결과 저장
     * 역할: GPT 리포트를 생성하고 '분석 전용 테이블'에 저장
     */
    @Transactional
    public Map<String, Object> analyzeSingleResult(
            String keyword, 
            DhTrademarkSearchResponseDto target, 
            Long userId, 
            String logoPath,
            int brandId){
        
        if (target == null) return null;

        String prompt = String.format(
        	    "내 상표명: '%s'\n" +
        	    "대상 상표: {ID: %d, 이름: '%s', 유사도: %.1f%%}\n\n" +

        	    "위 두 상표를 비교 분석하여 상표·법률 전문가 수준의 리포트를 한국어로 작성해라.\n\n" +

        	    "⚠️ 반드시 아래 JSON 형식으로만 응답해야 한다. 설명 문장이나 인사말은 절대 포함하지 마라.\n\n" +

        	    "{\n" +
        	    "  \"aiAnalysisSummary\": \"상표 전체 분석 요약 내용\",\n" +
        	    "  \"aiDetailedReport\": \"법적 관점의 상세 분석 리포트\",\n" +
        	    "  \"aiSolution\": [\"권장 대응 방안 1\", \"권장 대응 방안 2\", \"권장 대응 방안 3\"],\n" + // <-- 여기를 배열 형식으로 변경
        	    "  \"riskLevel\": \"높음 | 중간 | 낮음\"\n" +
        	    "}\n\n" +

        	    "JSON key 이름(aiAnalysisSummary, aiDetailedReport, aiSolution, riskLevel)을 절대 변경하지 마라.",
        	    keyword,
        	    target.getPatentId(),
        	    target.getTrademarkName(),
        	    target.getCombinedSimilarity()
        	);        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o");
            requestBody.put("messages", List.of(
            	    Map.of("role", "system", "content", 
            	           "너는 상표권 전문 변리사야. 모든 분석 내용(summary, report, solution 등)은 반드시 **한국어**로 작성해야 해. 응답은 JSON 형식을 지켜줘."),
            	    Map.of("role", "user", "content", prompt)
            	));
            requestBody.put("response_format", Map.of("type", "json_object"));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.postForObject(gptUrl, entity, Map.class);

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            String jsonContent = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");
            Map<String, Object> aiResult = objectMapper.readValue(jsonContent, Map.class);

            // [핵심 수정] 프론트엔드 BrandReport 타입에 1:1로 매칭되는 Map 생성
            Map<String, Object> finalResponse = new HashMap<>();

         // 프론트엔드 BrandAIReportCard가 쓰는 이름으로 Key를 설정하세요.
         finalResponse.put("title", target.getTrademarkName() + " 상세 분석");
         finalResponse.put("riskScore", (int)target.getCombinedSimilarity());
         finalResponse.put("createdAt", LocalDateTime.now().toString());
         finalResponse.put("applicant", target.getApplicant());

         // [핵심] aiAnalysisSummary 대신 'summary'라는 이름을 사용해야 함
         finalResponse.put("summary", aiResult.get("aiAnalysisSummary")); 

         // [핵심] aiSolution 대신 'suggestions'라는 이름을 사용해야 함
         Object solution = aiResult.get("aiSolution");
         if (solution instanceof List) {
             finalResponse.put("suggestions", solution); // 진짜 리스트(배열)로 전달
         } else {
             finalResponse.put("suggestions", List.of(solution.toString()));
         }

         return finalResponse;

        } catch (Exception e) {
            System.err.println("AI 분석 에러: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * GPT 위험도(High/Medium/Low) → 한글 위험도 변환
     */
    private String convertRiskLevel(String risk) {
        if (risk == null) return "주의";

        switch (risk.toLowerCase()) {
            case "high":
                return "위험";
            case "medium":
                return "주의";
            case "low":
                return "안전";
            default:
                return "주의";
        }
    }
    
    @Transactional
    public boolean saveAiAnalysis(DhTrademarkSearchResponseDto historyDto) {
        try {
            // 1. aiSolution 리스트가 있다면 DB 저장을 위해 String(JSON)으로 변환
            if (historyDto.getAiSolution() != null) {
                historyDto.setAiSolution(objectMapper.writeValueAsString(historyDto.getAiSolution()));
            }
            
            // 2. 중요! 매퍼 인터페이스에 정의된 이름인 saveMyBrand를 호출해야 합니다.
            // (saveBrandAnalysis라는 이름은 인터페이스에 없어서 에러가 난 것입니다)
            tradeMapper.saveMyBrand(historyDto); 
            
            return true; 
        } catch (Exception e) {
            System.err.println("DB 저장 에러: " + e.getMessage());
            return false;
        }
    }
    
    // 테스트 
    /**
     * 파이썬 AI 서버의 테스트 데이터 삽입 엔드포인트 호출
     */
//    public Map<String, Object> callPythonInsertTest(TestDataReqDto data) {
//        String pythonUrl = "http://localhost:8000/api/v1/test/insert";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//
//        HttpEntity<TestDataReqDto> entity = new HttpEntity<>(data, headers);
//        
//        // 파이썬 서버로 POST 요청
//        return restTemplate.postForObject(pythonUrl, entity, Map.class);
//    }
}