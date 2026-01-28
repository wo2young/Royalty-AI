package com.royalty.backend.detection.mapper;

import com.royalty.backend.detection.domain.DetectionEventVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DetectionEventMapper {

    int insertDetectionEvent(DetectionEventVO detectionEvent);

    Double findImageSimilarity(
        @Param("brandId") Long brandId,
        @Param("patentId") Long patentId
    );


    Double findTextSimilarity(
        @Param("brandId") Long brandId,
        @Param("patentId") Long patentId
    );

    int existsDetectionEvent(
        @Param("brandId") Long brandId,
        @Param("patentId") Long patentId
    );
    
    DetectionEventVO findById(@Param("eventId") Long eventId);
}

