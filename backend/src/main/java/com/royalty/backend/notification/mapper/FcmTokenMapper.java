package com.royalty.backend.notification.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface FcmTokenMapper {

    /**
     * 사용자 최신 FCM 토큰 조회
     */
    String findTokenByUserId(@Param("userId") Long userId);
}
