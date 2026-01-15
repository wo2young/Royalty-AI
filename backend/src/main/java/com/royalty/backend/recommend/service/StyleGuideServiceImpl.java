package com.royalty.backend.recommend.service;

import com.royalty.backend.recommend.dto.StyleGuideDTO;
import com.royalty.backend.recommend.domain.StyleGuideVO;
import com.royalty.backend.recommend.mapper.StyleGuideMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class StyleGuideServiceImpl implements StyleGuideService {

    private final StyleGuideMapper styleGuideMapper;

    @Override
    public StyleGuideDTO createStyleGuide(StyleGuideDTO dto) {

    	// DTO → VO
        StyleGuideVO vo = dto.toVO();

        // DB INSERT
        styleGuideMapper.insertStyleGuide(vo);

        // DB에서 생성된 PK(styleId)가 vo에 채워짐
        // VO → DTO 반환
        return StyleGuideDTO.of(vo);
    }
}
