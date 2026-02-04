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
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
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
     * [기능 2] 내 브랜드 기본 저장 (수정됨: 벡터 생성 및 저장 로직 추가)
     * - AI 서버에 요청하여 text_vector, image_vector를 추출 후 함께 저장
     */
    @Transactional
    public int saveMyBrandBasic(DhBrandSaveRequestDto dto, Long userId) throws IOException {
        DhTrademarkSearchResponseDto saveDto = new DhTrademarkSearchResponseDto();
        saveDto.setUserId(userId);
        saveDto.setTrademarkName(dto.getBrandName());
        saveDto.setCategory(dto.getCategory());
        saveDto.setAiSummary(dto.getAiSummary());

        // 1. 로고 이미지 경로 설정 (파일 업로드 or URL 사용)
        if (dto.getLogoFile() != null && !dto.getLogoFile().isEmpty()) {
            String s3Url = s3Service.upload(dto.getLogoFile());
            saveDto.setLogoPath(s3Url);
        } else {
            saveDto.setLogoPath(dto.getLogoPath());
        }

        // ---------------------------------------------------------------
        // [핵심 추가] 2. 저장 전에 AI 서버에서 벡터(Embedding) 추출하기
        // ---------------------------------------------------------------
        try {
            // 브랜드 이름과 이미지(파일 or URL)를 넘겨서 벡터를 받아옴
            Map<String, String> vectors = getVectorsFromAi(dto.getBrandName(), dto.getLogoFile(), saveDto.getLogoPath());
            
            if (vectors != null) {
                saveDto.setTextVector(vectors.get("text_vector"));   // brand 테이블용
                saveDto.setImageVector(vectors.get("image_vector")); // brand_logo 테이블용
                System.out.println(">>> [Vector] 벡터 생성 성공");
            }
        } catch (Exception e) {
            System.err.println(">>> [Vector Error] 벡터 생성 실패 (저장은 계속 진행): " + e.getMessage());
            // 벡터 실패해도 저장은 되어야 한다면 catch만 하고 진행
        }

        // 3. DB 저장 (Mapper XML에서 #{textVector}, #{imageVector}를 매핑해줘야 함)
        if (dto.getBrandId() == 0) {
            tradeMapper.insertBrand(saveDto); // brand 테이블 저장 (text_vector 포함)
        } else {
            saveDto.setBrandId(dto.getBrandId());
            tradeMapper.updateBrand(saveDto);
        }

        if (saveDto.getLogoPath() != null && !saveDto.getLogoPath().isBlank()) {
            if (dto.getBrandId() == 0) {
                tradeMapper.insertBrandLogo(saveDto); // brand_logo 테이블 저장 (image_vector 포함)
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
     * [기능 4] 분석 결과 저장 (수정됨: 중복 저장 방지 로직 추가)
     */
    @Transactional
    public void saveAnalysisResult(DhTrademarkSearchResponseDto dto, Long userId) {
        if (dto == null) throw new IllegalArgumentException("저장할 데이터가 없습니다.");
        if (userId == null) throw new IllegalArgumentException("로그인이 필요합니다.");
        if (dto.getBrandId() <= 0) throw new IllegalArgumentException("brandId가 유효하지 않습니다.");

        // =================================================================
        // 🛑 [NEW] 중복 저장 방지 (이름과 이미지가 모두 같으면 저장 스킵)
        // =================================================================
        
        // 1. 현재 DB에 저장된 브랜드 이름 가져오기
        // (주의: BrandMapper에 selectBrandDetail 같은 메서드가 있어야 함. 없으면 간단한 조회 쿼리 필요)
        String currentBrandName = tradeMapper.getBrandNameById(dto.getBrandId()); 
        
        // 2. 가장 최신 히스토리(이미지) 가져오기
        List<BrandHistoryDTO> historyList = tradeMapper.selectBrandHistory(dto.getBrandId());
        
        if (currentBrandName != null && !historyList.isEmpty()) {
            BrandHistoryDTO latest = historyList.get(0); // 0번이 최신 (Order by DESC)

            // 비교 (Null Safe)
            boolean isNameSame = currentBrandName.equals(dto.getTrademarkName());
            
            // 이미지 비교: 둘 다 null이거나, 주소가 같으면 같다고 판단
            String newLogo = dto.getLogoPath();
            String oldLogo = latest.getImagePath();
            boolean isImageSame = (newLogo == null && oldLogo == null) || 
                                  (newLogo != null && newLogo.equals(oldLogo));

            if (isNameSame && isImageSame) {
                System.out.println(">>> [Skip] 변경 사항(이름/이미지)이 없어 저장을 건너뜁니다.");
                return; // ★ 여기서 함수 강제 종료 (저장 안 함)
            }
        }
        // =================================================================


        if (dto.getAiSummary() == null || dto.getAiSummary().isBlank()) {
            throw new IllegalArgumentException("aiSummary가 없습니다. 분석 후 저장하세요.");
        }
        if (dto.getAnalysisDetail() == null || dto.getAnalysisDetail().isBlank()) {
            throw new IllegalArgumentException("analysisDetail이 없습니다. 분석 후 저장하세요.");
        }

        // 버전 업 로직 (기존 유지)
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
    // [New Helper] AI 서버에 요청하여 벡터값 추출
    // -------------------------------------------------------
    private Map<String, String> getVectorsFromAi(String text, MultipartFile file, String url) {
        // AI 서버의 벡터 생성 전용 엔드포인트 (확인 필요: 없으면 만들어달라고 해야 함)
        // 만약 search 엔드포인트가 벡터도 같이 준다면 그걸 써도 됨.
        // 여기서는 "/api/v1/vectorize" 라는 엔드포인트가 있다고 가정함.
        String aiVectorUrl = "http://localhost:8000/api/v1/vectorize"; 

        try {
            HttpHeaders headers = new HttpHeaders();
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            if (text != null && !text.isBlank()) {
                body.add("text", text);
            }

            // 이미지 처리 (파일 우선, 없으면 URL 다운로드)
            if (file != null && !file.isEmpty()) {
                body.add("file", new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return file.getOriginalFilename();
                    }
                });
            } else if (url != null && !url.isBlank()) {
                byte[] imgBytes = downloadImageBytes(url);
                if (imgBytes != null) {
                    body.add("file", new ByteArrayResource(imgBytes) {
                        @Override
                        public String getFilename() {
                            return "s3_image.png";
                        }
                    });
                }
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // 응답 받기 (JSON 형태: {"text_vector": [...], "image_vector": [...]})
            Map<String, Object> response = restTemplate.postForObject(aiVectorUrl, requestEntity, Map.class);

            if (response == null || !"success".equals(response.get("status"))) {
                return null;
            }

            // 결과를 String(JSON)으로 변환해서 리턴
            String textVecStr = objectMapper.writeValueAsString(response.get("text_vector"));
            String imgVecStr = objectMapper.writeValueAsString(response.get("image_vector"));

            return Map.of("text_vector", textVecStr, "image_vector", imgVecStr);

        } catch (Exception e) {
            System.err.println("벡터 추출 중 에러: " + e.getMessage());
            return null;
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