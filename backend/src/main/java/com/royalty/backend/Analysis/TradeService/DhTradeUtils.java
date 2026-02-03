package com.royalty.backend.Analysis.TradeService;

public class DhTradeUtils {

    public static String convertCategoryCodeToName(String code) {
        if (code == null || code.isBlank()) return "미분류";
        String cleanCode = code.trim();
        if (cleanCode.length() == 1) cleanCode = "0" + cleanCode;

        return switch (cleanCode) {
            case "09" -> "전자기기 및 소프트웨어";
            case "35" -> "광고 및 기업관리";
            case "42" -> "IT 설계 및 기술 서비스";
            default -> "기타 (" + code + ")";
        };
    }

    public static String convertRiskLevel(String risk) {
        if (risk == null) return "주의";
        return switch (risk.toLowerCase()) {
            case "high" -> "위험";
            case "medium" -> "주의";
            case "low" -> "안전";
            default -> "주의";
        };
    }
}