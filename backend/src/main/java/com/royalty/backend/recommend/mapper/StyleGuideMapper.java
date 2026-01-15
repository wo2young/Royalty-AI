package com.royalty.backend.recommend.mapper;


import org.apache.ibatis.annotations.Mapper;
import com.royalty.backend.recommend.domain.StyleGuideVO;

@Mapper
public interface StyleGuideMapper {

    void insertStyleGuide(StyleGuideVO vo);
}
