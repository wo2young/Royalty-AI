package com.royalty.backend.recommend.controller;

import lombok.RequiredArgsConstructor;
import com.royalty.backend.recommend.dto.StyleGuideDTO;
import com.royalty.backend.recommend.service.StyleGuideService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recommend/style-guide")
@RequiredArgsConstructor
public class StyleGuideController {

    private final StyleGuideService styleGuideService;

    @PostMapping
    public StyleGuideDTO create(@RequestBody StyleGuideDTO dto) {
        return styleGuideService.createStyleGuide(dto);
    }
}

