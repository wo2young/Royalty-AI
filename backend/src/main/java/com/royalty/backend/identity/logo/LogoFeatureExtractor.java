package com.royalty.backend.identity.logo;

import org.springframework.stereotype.Component;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.*;
import java.util.List;
import java.net.URL;

@Component
public class LogoFeatureExtractor {

    /**
     * 로고 이미지의 전체적인 특징을 추출하는 메인 메서드
     */
    public Map<String, Object> extract(String imagePath) {
        BufferedImage image = load(imagePath);

        Map<String, Object> result = new HashMap<>();

        // 1. 주요 색상 추출 (가장 많이 사용된 색상)
        List<Color> dominantColors = extractDominantColors(image);
        result.put("colors", mapColorNames(dominantColors));
        
        // 2. 색상 톤 분석 (밝기 기준: Dark / Light)
        result.put("colorTone", estimateTone(dominantColors));
        
        // 3. 복잡도 분석 (사용된 색상 수 기준)
        result.put("complexity", estimateComplexity(image, dominantColors));
        
        // 4. 로고 스타일 분석 (가로 세로 비율 기준: 워드마크형 / 심볼형)
        result.put("style", estimateStyle(image));
        
        // 5. 대칭성 분석 (좌우 픽셀 비교를 통한 대칭 정도)
        result.put("symmetry", estimateSymmetry(image));
        
        // 6. 종합적인 무드(분위기) 분석 (색상과 스타일 기반)
        result.put("mood", estimateMood(result));

        return result;
    }

    /* ---------- 이미지 로드 ---------- */

    private BufferedImage load(String path) {
        try {
            if (path.startsWith("http://") || path.startsWith("https://")) {
                return ImageIO.read(new URL(path));
            } else {
                return ImageIO.read(new File(path));
            }
        } catch (Exception e) {
            throw new IllegalStateException("로고 이미지 로드 실패", e);
        }
    }

    /* ---------- 색상 분석 로직 ---------- */

    /**
     * 이미지 내에서 가장 많이 사용된 상위 3가지 색상을 추출 (5픽셀 간격 샘플링)
     */
    private List<Color> extractDominantColors(BufferedImage img) {
        Map<Integer, Integer> counter = new HashMap<>();

        for (int y = 0; y < img.getHeight(); y += 5) {
            for (int x = 0; x < img.getWidth(); x += 5) {
                int rgb = img.getRGB(x, y) & 0xFFFFFF; // 투명도 제외 순수 색상값만 추출
                counter.put(rgb, counter.getOrDefault(rgb, 0) + 1);
            }
        }

        return counter.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .limit(3)
                .map(e -> new Color(e.getKey()))
                .toList();
    }

    /**
     * RGB 값을 기준으로 gold, black, white, colored(기타) 등의 색상 이름을 매핑
     */
    private List<String> mapColorNames(List<Color> colors) {
        List<String> names = new ArrayList<>();
        for (Color c : colors) {
            if (c.getRed() > 200 && c.getGreen() > 170 && c.getBlue() < 100) {
                names.add("gold");
            } else if (c.getRed() < 50 && c.getGreen() < 50 && c.getBlue() < 50) {
                names.add("black");
            } else if (c.getRed() > 200 && c.getGreen() > 200 && c.getBlue() > 200) {
                names.add("white");
            } else {
                names.add("colored");
            }
        }
        return names.stream().distinct().toList();
    }

    /**
     * RGB 평균값을 계산하여 전체적인 톤(어두움/밝음)을 판단
     */
    private String estimateTone(List<Color> colors) {
        double avg = colors.stream()
                .mapToDouble(c -> (c.getRed() + c.getGreen() + c.getBlue()) / 3.0)
                .average()
                .orElse(128);

        return avg < 120 ? "dark" : "light";
    }

    /* ---------- 복잡도 분석 ---------- */

    /**
     * 사용된 주요 색상 수가 2개 이하이면 'simple', 3개 이상이면 'complex'로 분류
     */
    private String estimateComplexity(BufferedImage img, List<Color> colors) {
        int colorCount = colors.size();
        return colorCount <= 2 ? "simple" : "complex";
    }

    /* ---------- 스타일 분석 ---------- */

    /**
     * 가로/세로 비율이 2.5배를 넘어가면 글자 중심의 'wordmark', 아니면 'symbol'로 분류
     */
    private String estimateStyle(BufferedImage img) {
        double ratio = (double) img.getWidth() / img.getHeight();
        return ratio > 2.5 ? "wordmark" : "symbol";
    }

    /* ---------- 대칭성 분석 ---------- */

    /**
     * 이미지의 왼쪽과 오른쪽 픽셀을 비교하여 일치하지 않는 점이 적으면 'high', 많으면 'low' 대칭
     */
    private String estimateSymmetry(BufferedImage img) {
        int diff = 0;
        for (int y = 0; y < img.getHeight(); y += 10) {
            for (int x = 0; x < img.getWidth() / 2; x += 10) {
                int left = img.getRGB(x, y);
                int right = img.getRGB(img.getWidth() - x - 1, y);
                if (left != right) diff++;
            }
        }
        return diff < 100 ? "high" : "low";
    }

    /* ---------- 무드(분위기) 분석 ---------- */

    /**
     * 추출된 색상과 스타일을 조합하여 luxury, trust, premium 등 브랜드의 성격을 추정
     */
    private List<String> estimateMood(Map<String, Object> features) {
        List<String> colors = (List<String>) features.get("colors");
        String style = (String) features.get("style");

        List<String> mood = new ArrayList<>();

        if (colors.contains("gold")) mood.add("luxury"); // 금색 포함 시 럭셔리
        if (colors.contains("black")) mood.add("trust"); // 검정색 포함 시 신뢰
        if ("wordmark".equals(style)) mood.add("premium"); // 워드마크 스타일 시 프리미엄

        return mood.isEmpty() ? List.of("modern") : mood; // 해당사항 없으면 기본값 모던
    }
}