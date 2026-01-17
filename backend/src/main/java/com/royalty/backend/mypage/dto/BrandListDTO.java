package com.royalty.backend.mypage.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandListDTO {
    private Long brandId;
    private String brandName;
    private String imagePath;
    private LocalDateTime createdAt;
}
