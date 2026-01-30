package com.royalty.backend.userh;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserHCommandMapper {

    String findPasswordByUserId(Long userId);

    void updatePassword(
        @Param("userId") Long userId,
        @Param("password") String password
    );

    // 🔥 하드 삭제용 메서드
    void deleteByUserId(Long userId);
}
