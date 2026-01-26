package com.royalty.backend.identity.mapper;

import com.royalty.backend.identity.domain.IdentityVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface IdentityMapper {

    // 아이덴티티 단건 조회
    IdentityVO findByBrandId(@Param("brandId") Long brandId);

    // 아이덴티티 최초 생성
    int insert(IdentityVO identityVO);

    // 아이덴티티 갱신
    int update(IdentityVO identityVO);
}
