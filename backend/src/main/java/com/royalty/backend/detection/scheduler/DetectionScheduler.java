package com.royalty.backend.detection.scheduler;

import com.royalty.backend.detection.service.DetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DetectionScheduler {

    private final DetectionService detectionService;

    //600초(10분) 마다 실힝(100,00ms)
    @Scheduled(fixedDelay = 600_000)
    public void runDetectionJob() {
        log.info("[DETECTION] 감지 스케줄러 실행");
        detectionService.runDetection();
    }
}
