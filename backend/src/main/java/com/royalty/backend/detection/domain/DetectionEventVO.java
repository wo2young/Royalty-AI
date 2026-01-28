package com.royalty.backend.detection.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectionEventVO {

    private Long brandId;
    private Long patentId;

    private Double imageSimilarity;
    private Double textSimilarity;

    private Double riskLevel;
    
    private Long eventId;
    public Long getEventId() { return eventId; }
    
    private String matchType;

}
