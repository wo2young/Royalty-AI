package com.royalty.backend.Analysis.TradeController;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute; // [중요] 이거 꼭 필요함
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.royalty.backend.Analysis.TradeDTO.DhBrandSaveRequestDto; // [중요] DTO import
import com.royalty.backend.Analysis.TradeDTO.DhTradeSearchRequestDto;
import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;
import com.royalty.backend.Analysis.TradeService.DhTradeService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analysis")
public class DhTradeController {
    
    private final DhTradeService tradeService;
    
 // 1. 유사 상표 검색 (확실한 @RequestParam 방식으로 변경)
    @PostMapping("/run")
    public List<DhTrademarkSearchResponseDto> runAnalysis(
            // required = false로 설정해 null 에러 방지 후 내부에서 체크
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "logoUrl", required = false) String logoUrl,
            @RequestParam(value = "logoFile", required = false) MultipartFile logoFile 
    ) {
        // 1. 로그 확인
        System.out.println(">>> 요청 수신됨");
        System.out.println("brandName: " + brandName);
        System.out.println("logoFile: " + (logoFile != null ? logoFile.getOriginalFilename() : "없음"));

        // 2. 서비스 호출
        return tradeService.search(brandName, logoFile); 
    }

    // 2. AI 상세 분석 (기존 유지)
    @PostMapping("/analyze")
    public DhTrademarkSearchResponseDto getAiDetailAnalysis(
            @RequestParam("brandName") String brandName,
            @AuthenticationPrincipal Long userId, 
            @RequestParam("logoPath") String logoPath,
            @RequestParam("brandId") int brandId,
            @RequestBody DhTrademarkSearchResponseDto selectedTrademark) { 
        
        if (userId == null) throw new RuntimeException("로그인이 필요합니다.");

        return tradeService.analyzeSingleResultAndSave(
            brandName, selectedTrademark, userId, logoPath, brandId
        );
    }
    
    @PostMapping(value = "/save-basic", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> saveBrand(
            @RequestPart("requestDto") DhBrandSaveRequestDto requestDto,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile,
            @AuthenticationPrincipal Long userId
    ) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("status", "error", "message", "로그인 필요"));

        try {
            // 파일 세팅 (이미 서비스에서 처리하고 있으나 컨트롤러 명시성 유지)
            requestDto.setLogoFile(logoFile);
            
            // 서비스 호출: 이제 이 안에서 Brand와 Brand_Logo 테이블만 저장됨
            tradeService.saveMyBrandBasic(requestDto, userId);
            
            return ResponseEntity.ok(Map.of("status", "success", "message", "브랜드 등록 성공"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "서버 오류: " + e.getMessage()));
        }
    }
}