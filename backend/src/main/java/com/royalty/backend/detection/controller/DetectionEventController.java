package com.royalty.backend.detection.controller;

import com.royalty.backend.detection.domain.DetectionEventVO;
import com.royalty.backend.detection.service.DetectionEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/detection-events")
public class DetectionEventController {

    private final DetectionEventService detectionEventService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createDetectionEvent(@RequestBody DetectionEventVO detectionEvent) {
        detectionEventService.createDetectionEvent(detectionEvent);
    }
}
