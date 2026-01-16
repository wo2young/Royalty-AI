package com.royalty.backend.recommend.controller;

import com.royalty.backend.recommend.dto.NamingDTO;
import com.royalty.backend.recommend.service.NamingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recommend/naming")
@RequiredArgsConstructor
public class NamingController {

    private final NamingService namingService;

    @PostMapping
    public NamingDTO recommend(
            @RequestBody NamingDTO request
    ) {
        return namingService.recommend(request);
    }
}
