package com.royalty.backend.TradeMark.TradeController;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.royalty.backend.TradeMark.TradeDTO.DhTrademarkSearchResponseDto;
//import com.royalty.backend.TradeMark.TradeDTO.TestDataReqDto;
import com.royalty.backend.TradeMark.TradeService.DhTradeService;

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
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        
        System.out.println("분석 요청 수신 - 키워드: " + keyword + ", 로고 유무: " + (logo != null));

        // 서비스가 이제 DTO 리스트를 반환하므로 타입 불일치가 해결됩니다.
        return tradeService.search(keyword, logo); 
    }
 // 2. AI 상세 분석 (6개 리스트를 받아 GPT가 1개 선정 및 분석)
    @PostMapping("/analyze")
    public DhTrademarkSearchResponseDto getAiDetailAnalysis(
            @RequestParam("keyword") String keyword,
            @RequestParam("userId") Long userId,      
            @RequestParam("logoPath") String logoPath, // 서비스에서 logoPath를 사용하므로 추가 확인
            @RequestParam("brandId") int brandId,      // 서비스에서 brandId를 사용하므로 추가 확인
            @RequestBody DhTrademarkSearchResponseDto selectedTrademark) { 
        
        System.out.println("개별 AI 상세 분석 시작 - 브랜드ID: " + brandId + ", 대상: " + selectedTrademark.getTrademarkName());
        
        // [수정 핵심] 서비스의 파라미터 순서(keyword, target, userId, logoPath, brandId)에 맞춰서 호출
        return tradeService.analyzeSingleResultAndSave(
            keyword, 
            selectedTrademark, 
            userId, 
            logoPath, 
            brandId
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