package com.royalty.backend.detection.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectionEventVO {

    private Long brandId;
    private Long patentId;

    private Double imageSimilarity;
    private Double textSimilarity;

    private Double riskLevel;
}
