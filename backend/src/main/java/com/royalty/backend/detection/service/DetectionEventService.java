package com.royalty.backend.detection.service;

import com.royalty.backend.detection.domain.DetectionEventVO;

// 감지 결과 저장 담당
public interface DetectionEventService {
    void createDetectionEvent(DetectionEventVO detectionEvent);
}
