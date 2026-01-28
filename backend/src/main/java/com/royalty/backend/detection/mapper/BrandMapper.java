package com.royalty.backend.detection.mapper;

import com.royalty.backend.detection.domain.BrandVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BrandMapper {

    List<BrandVO> findEnabledBrands();
}
