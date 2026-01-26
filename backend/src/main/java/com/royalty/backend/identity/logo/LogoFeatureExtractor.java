package com.royalty.backend.identity.logo;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.*;

public class LogoFeatureExtractor {

    public Map<String, Object> extract(String imagePath) {
        BufferedImage image = loadImage(imagePath);

        Map<String, Object> features = new HashMap<>();

        features.put("colors", extractColors(image));
        features.put("complexity", estimateComplexity(image));
        features.put("style", estimateStyle(image));
        features.put("mood", estimateMood(features));

        return features;
    }

    private BufferedImage loadImage(String path) {
        try {
            return ImageIO.read(new File(path));
        } catch (Exception e) {
            throw new IllegalStateException("로고 이미지 로드 실패");
        }
    }

    private List<String> extractColors(BufferedImage image) {
        // 일단 단순화 (확장 예정)
        return List.of("gold", "black");
    }

    private String estimateComplexity(BufferedImage image) {
        // 픽셀 수 대비 단색 비율 기준
        return "simple";
    }

    private String estimateStyle(BufferedImage image) {
        // 규칙 기반 (텍스트 많으면 wordmark 등)
        return "wordmark";
    }

    private List<String> estimateMood(Map<String, Object> features) {
        List<String> colors = (List<String>) features.get("colors");
        if (colors.contains("gold")) {
            return List.of("luxury", "trust");
        }
        return List.of("modern");
    }
}
