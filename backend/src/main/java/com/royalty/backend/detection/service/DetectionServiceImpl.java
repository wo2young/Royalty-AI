package com.royalty.backend.detection.service;

import com.royalty.backend.detection.domain.*;
import com.royalty.backend.detection.mapper.*;
import com.royalty.backend.notification.domain.NotificationVO;
import com.royalty.backend.notification.fcm.FcmService;
import com.royalty.backend.notification.mapper.FcmTokenMapper;
import com.royalty.backend.notification.mapper.NotificationMapper;

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
    private final NotificationMapper notificationMapper;
    
    private final FcmService fcmService;
    private final FcmTokenMapper fcmTokenMapper;



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
                
                boolean imagePass = imageSimilarity != null && imageSimilarity >= 0.90;
                boolean textPass  = textSimilarity  != null && textSimilarity  >= 0.90;

                // 🔴 로고 OR 텍스트 중 하나라도 90% 이상이면 통과
                if (!imagePass && !textPass) {
                    log.info(
                        "[DETECTION] 임계값 미달 (skip) brandId={}, patentId={}, image={}, text={}",
                        brand.getBrandId(),
                        patent.getPatentId(),
                        imageSimilarity,
                        textSimilarity
                    );
                    continue;
                }
                
                String matchType;
                if (imagePass && textPass) {
                    matchType = "BOTH";
                } else if (imagePass) {
                    matchType = "IMAGE";
                } else {
                    matchType = "TEXT";
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
                DetectionEventVO event = new DetectionEventVO();
                event.setBrandId(brand.getBrandId());
                event.setPatentId(patent.getPatentId());
                event.setImageSimilarity(imageSimilarity);
                event.setTextSimilarity(textSimilarity);
                event.setRiskLevel(riskLevel);
                event.setMatchType(matchType);

                detectionEventMapper.insertDetectionEvent(event); 
                
             // DetectionEvent insert 직후
                if (brand.isNotificationEnabled()) {

                    NotificationVO notification = new NotificationVO();
                    notification.setUserId(brand.getUserId());
                    notification.setBrandId(brand.getBrandId());
                    notification.setEventId(event.getEventId());
                    notification.setMessage(null); // 메시지는 프론트에서 조립
                    notificationMapper.insertNotification(notification);
                }
                
                String fcmToken = fcmTokenMapper.findTokenByUserId(brand.getUserId());

                if (fcmToken != null) {
                    fcmService.send(
                        fcmToken,
                        "유사 상표 감지",
                        "귀하의 브랜드와 유사한 상표가 특허청에 출원되었습니다."
                    );
                }


                log.info(
                    "[DETECTION] 이벤트 저장 brandId={}, patentId={}, matchType={}, riskLevel={}",
                    brand.getBrandId(),
                    patent.getPatentId(),
                    matchType,
                    String.format("%.3f", riskLevel)
                );
            }
        }
    }
}
