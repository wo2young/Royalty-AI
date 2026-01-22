package com.royalty.backend.detection.mapper;

import com.royalty.backend.detection.domain.DetectionEventVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DetectionEventMapper {

    /**
     * detection_event 테이블에 감지 이벤트 1건 INSERT
     */
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
}
