package com.royalty.backend.Analysis.TradeController;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
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

import com.royalty.backend.Analysis.TradeDTO.DhBrandSaveRequestDto;
import com.royalty.backend.Analysis.TradeDTO.DhTrademarkSearchResponseDto;
import com.royalty.backend.Analysis.TradeService.DhTradeService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/analysis")
public class DhTradeController {

    private final DhTradeService tradeService;

    // 1. 유사 상표 검색
    @PostMapping("/run")
    public List<DhTrademarkSearchResponseDto> runAnalysis(
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "logoUrl", required = false) String logoUrl,
            @RequestParam(value = "logoFile", required = false) MultipartFile logoFile
    ) {
        System.out.println(">>> 요청 수신됨");
        System.out.println("brandName: " + brandName);
        System.out.println("logoFile: " + (logoFile != null ? logoFile.getOriginalFilename() : "없음"));

        return tradeService.search(brandName, logoFile, logoUrl);
    }

    // 2. AI 상세 분석 (분석-only: DB 저장 금지)
    @PostMapping("/analyze")
    public DhTrademarkSearchResponseDto getAiDetailAnalysis(
            @RequestParam("brandName") String brandName,
            @AuthenticationPrincipal Long userId,
            @RequestParam("logoPath") String logoPath,
            @RequestParam("brandId") int brandId,
            @RequestBody DhTrademarkSearchResponseDto selectedTrademark
    ) {
        if (userId == null) throw new RuntimeException("로그인이 필요합니다.");
        if (selectedTrademark == null) throw new RuntimeException("분석 대상 상표 정보가 없습니다.");

        // A안: /analyze에서는 저장하지 않고 분석 결과만 반환
        return tradeService.analyzeSingleResult(
                brandName,
                selectedTrademark,
                userId,
                logoPath,
                brandId
        );
    }

    // 3. 브랜드 기본 저장 (Brand + Brand_Logo만 저장) + brandId 반환
    @PostMapping(value = "/save-basic", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> saveBrand(
            @RequestPart("requestDto") DhBrandSaveRequestDto requestDto,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile,
            @AuthenticationPrincipal Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("status", "error", "message", "로그인 필요"));
        }

        try {
            requestDto.setLogoFile(logoFile);

            int brandId = tradeService.saveMyBrandBasic(requestDto, userId);

            return ResponseEntity.ok(
                    Map.of(
                            "status", "success",
                            "message", "브랜드 등록 성공",
                            "brandId", brandId
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "서버 오류: " + e.getMessage()));
        }
    }

    // 4. 분석 결과 저장 (저장-only: 버튼 눌렀을 때만 저장)
    @PostMapping("/save")
    public ResponseEntity<?> saveAnalysis(
            @RequestBody DhTrademarkSearchResponseDto dto,
            @AuthenticationPrincipal Long userId
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("status", "error", "message", "로그인 필요"));
        }

        tradeService.saveAnalysisResult(dto, userId);

        return ResponseEntity.ok(Map.of("status", "success", "message", "분석 결과 저장 완료"));
    }
}

/*
[전체 정리]
- /analyze: 분석-only (DB 저장 금지)
- /save-basic: brand + brand_logo만 저장하고 brandId를 응답으로 반환
- /save: 저장-only (brand_logo_history + brand_analysis + brand.description 업데이트)
- 실무 중요: /analyze에서 저장이 발생하면 사용자가 저장 버튼을 누르기 전에도 기록이 쌓여 UX/데이터가 꼬인다
*/
