package com.royalty.backend.recommend.controller;

import com.royalty.backend.recommend.dto.StyleGuideDTO;
import com.royalty.backend.recommend.service.StyleGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recommend/style-guide")
@RequiredArgsConstructor
public class StyleGuideController {

    private final StyleGuideService styleGuideService;

    @PostMapping
    public StyleGuideDTO generate(
            @RequestBody StyleGuideDTO request
    ) {
        return styleGuideService.generateStyleGuide(request);
    }
}
