package com.royalty.backend.Analysis.TradeController;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;
import com.royalty.backend.Analysis.TradeService.DhTradeService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analysis")
public class DhTradeController {
    
    private final DhTradeService tradeService;
    
    @PostMapping("/run")
    // 리턴 타입을 DTO 리스트로 변경하여 데이터 구조를 명확히 합니다.
    public List<DhTrademarkSearchResponseDto> runAnalysis(
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "logoUrl", required = false) String logoUrl,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile) {
        
        System.out.println("분석 요청 수신 - 키워드: " + brandName + ", 로고 유무: " + (logoFile != null));
        System.out.println("====== 분석 요청 수신 ======");
        System.out.println("1. 상호명(brandName): " + brandName);
        System.out.println("2. 로고파일(logoFile) 존재 여부: " + (logoFile != null && !logoFile.isEmpty()));
        System.out.println("3. 로고URL(logoUrl) 주소: " + logoUrl);

        // 서비스가 이제 DTO 리스트를 반환하므로 타입 불일치가 해결됩니다.
        return tradeService.search(brandName, logoFile, logoUrl); 
    }
 // 2. AI 상세 분석 (6개 리스트를 받아 GPT가 1개 선정 및 분석)
@PostMapping("/analyze")
    public Map<String, Object> getAiDetailAnalysis(
            @RequestParam("brandName") String brandName,
            @AuthenticationPrincipal Long userId,     
            @RequestParam("logoPath") String logoPath,
            @RequestParam("brandId") int brandId,
            @RequestBody DhTrademarkSearchResponseDto selectedTrademark) { 
        
        System.out.println("AI 상세 분석 시작 - 상표명: " + brandName);
        
        // 서비스에 정의된 메서드 이름(analyzeSingleResult)과 인자 5개에 맞춤
        return tradeService.analyzeSingleResult(
            brandName,          // 1. keyword (String)
            selectedTrademark,  // 2. target (Dto)
            userId,             // 3. userId (Long)
            logoPath,           // 4. logoPath (String)
            brandId             // 5. brandId (int)
        );
    }
    @PostMapping("/save-basic")
    public ResponseEntity<?> saveBrand(
            @RequestParam String logoPath, 
            @RequestParam int brandId,
            @RequestParam Long  userId,
            @RequestParam int patentId,
            @RequestParam String searchedBrandName,
            @RequestParam String aiSummary
    		) { // <--- patentId 추가
        try {
            // 서비스 메서드에도 patentId를 넘기도록 수정 필요
            tradeService.saveMyBrandBasic(logoPath, brandId, userId, patentId,aiSummary,searchedBrandName); 
            return ResponseEntity.ok("내 브랜드 저장 성공!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("저장 중 오류 발생: " + e.getMessage());
        }
    }
    @PostMapping("/save-analysis")
    public ResponseEntity<String> saveAnalysis(@RequestBody DhTrademarkSearchResponseDto historyDto) {
        boolean isSaved = tradeService.saveAiAnalysis(historyDto);
        if (isSaved) {
            return ResponseEntity.ok("성공적으로 저장되었습니다.");
        } else {
            return ResponseEntity.status(500).body("저장에 실패했습니다.");
        }
    }
    
    
    
    
    
    // test 데이터 강제 삽입 api 
//    @PostMapping("/test/insert")
//    public ResponseEntity<?> insertTestData(@RequestBody TestDataReqDto testData) {
//        try {
//            // 자바에서 파이썬 AI 서버(포트 8000)의 엔드포인트를 호출함
//            return ResponseEntity.ok(tradeService.callPythonInsertTest(testData));
//        } catch (Exception e) {
//            return ResponseEntity.status(500).body("테스트 데이터 삽입 실패: " + e.getMessage());
//        }
//    }
    
    
    
    
}