package com.royalty.backend.detection.service;

import com.royalty.backend.detection.domain.*;
import com.royalty.backend.detection.mapper.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DetectionServiceImpl implements DetectionService {

    private final PatentMapper patentMapper;
    private final BrandMapper brandMapper;
    private final DetectionEventMapper detectionEventMapper;

    @Override
    public void runDetection() {

        // 1️. 최근 N분 특허 조회
        List<PatentVO> recentPatents = patentMapper.findRecentPatents(10);
        log.info("[DETECTION] 최근 10분 특허 수 = {}", recentPatents.size());

        if (recentPatents.isEmpty()) {
            return;
        }

        // 2️. 감시 중인 브랜드 조회
        List<BrandVO> brands = brandMapper.findEnabledBrands();
        log.info("[DETECTION] 감시 ON 브랜드 수 = {}", brands.size());

        for (PatentVO patent : recentPatents) {
            log.info("[DETECTION] 특허 처리 시작 patentId={}", patent.getPatentId());

            for (BrandVO brand : brands) {

                Double imageSimilarity = null;
                Double textSimilarity = null;

                // 3️. 로고 유사도 (로고가 있을 때만)
                if (brand.hasLogo()) {
                    imageSimilarity =
                        detectionEventMapper.findImageSimilarity(
                            brand.getBrandId(),
                            patent.getPatentId()
                        );
                }

                // 4️. 텍스트 유사도 (상호명이 있을 때만)
                if (brand.hasText()) {
                    textSimilarity =
                        detectionEventMapper.findTextSimilarity(
                            brand.getBrandId(),
                            patent.getPatentId()
                        );
                }

                // 5️. 둘 다 없으면 스킵
                if (imageSimilarity == null && textSimilarity == null) {
                    log.info(
                        "[DETECTION] 분석 불가 (데이터 없음) brandId={}, patentId={}",
                        brand.getBrandId(),
                        patent.getPatentId()
                    );
                    continue;
                }

                // 6️. risk_level 계산 (핵심 로직)
                double riskLevel;

                if (imageSimilarity != null && textSimilarity != null) {
                    // 둘 다 있는 경우 → 평균
                    riskLevel = (imageSimilarity + textSimilarity) / 2;
                } else if (imageSimilarity != null) {
                    // 로고만
                    riskLevel = imageSimilarity;
                } else {
                    // 상호명만
                    riskLevel = textSimilarity;
                }
                
                // 7. 중복 방지
                int exists = detectionEventMapper.existsDetectionEvent(
                	    brand.getBrandId(),
                	    patent.getPatentId()
                	);

                	if (exists > 0) {
                	    log.info(
                	        "[DETECTION] 이미 감지됨 - brandId={}, patentId={}",
                	        brand.getBrandId(),
                	        patent.getPatentId()
                	    );
                	    continue;
                	}


                // 8. DetectionEvent 저장
                DetectionEventVO event = DetectionEventVO.builder()
                    .brandId(brand.getBrandId())
                    .patentId(patent.getPatentId())
                    .imageSimilarity(imageSimilarity)
                    .textSimilarity(textSimilarity)
                    .riskLevel(riskLevel)
                    .build();

                detectionEventMapper.insertDetectionEvent(event);

                log.info(
                    "[DETECTION] 이벤트 저장 brandId={}, patentId={}, riskLevel={}",
                    brand.getBrandId(),
                    patent.getPatentId(),
                    String.format("%.3f", riskLevel)
                );
            }
        }
    }
}
