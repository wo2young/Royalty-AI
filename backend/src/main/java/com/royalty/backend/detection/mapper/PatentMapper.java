package com.royalty.backend.detection.mapper;

import com.royalty.backend.detection.domain.PatentVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PatentMapper {

    int countRecentPatents(@Param("minutes") int minutes);

    List<PatentVO> findRecentPatents(@Param("minutes") int minutes);
}
