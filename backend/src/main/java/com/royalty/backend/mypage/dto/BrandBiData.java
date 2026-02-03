package com.royalty.backend.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandBiData {
    private String mission;       // core.kr 값
    private List<String> keywords; // brandKeywords.kr 리스트
    private List<String> slogan;   // copyExamples.kr 리스트
}