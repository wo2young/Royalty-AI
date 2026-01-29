package com.royalty.backend.detection.service;

import com.royalty.backend.detection.domain.DetectionEventVO;
import com.royalty.backend.detection.mapper.DetectionEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DetectionEventServiceImpl implements DetectionEventService {

    private final DetectionEventMapper detectionEventMapper;

    @Override
    public void createDetectionEvent(DetectionEventVO detectionEvent) {
        int inserted = detectionEventMapper.insertDetectionEvent(detectionEvent);

        if (inserted != 1) {
            throw new IllegalStateException("DetectionEvent INSERT 실패");
        }
    }
}
