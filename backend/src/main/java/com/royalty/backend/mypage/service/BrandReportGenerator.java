package com.royalty.backend.mypage.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.royalty.backend.mypage.dto.BrandBiData;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;

@Slf4j
@Component
public class BrandReportGenerator {

	/**
     * PDF 생성 메인 메서드
     */
    public byte[] generate(BrandDetailDTO brand, BrandHistoryDTO latestHistory, 
                           List<BrandHistoryDTO> historyList, Long userId, int probability,
                           BrandBiData biData) {

        // 유사도 데이터 준비
        float imageSimRaw = latestHistory.getImageSimilarity() != null ? latestHistory.getImageSimilarity() : 0f;
        float textSimRaw  = latestHistory.getTextSimilarity()  != null ? latestHistory.getTextSimilarity()  : 0f;
        float imageSim = normalizeToPercent(imageSimRaw);
        float textSim  = normalizeToPercent(textSimRaw);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // 여백 조정
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = loadKoreanBaseFontFromClasspath("fonts/malgun.ttf");

            // 폰트 설정
            Font titleFont  = new Font(bf, 22, Font.BOLD, new Color(30, 41, 59));
            Font h1Font     = new Font(bf, 15, Font.BOLD, new Color(51, 65, 85));
            Font h2Font     = new Font(bf, 12, Font.BOLD, new Color(71, 85, 105));
            Font bodyFont   = new Font(bf, 10, Font.NORMAL, Color.BLACK);
            Font footerFont = new Font(bf, 9, Font.NORMAL, Color.GRAY);

            // ==========================================
            // [Page 1] 표지 + AI 분석
            // ==========================================
            addCoverInfo(document, bf, titleFont, bodyFont, brand, userId);
            
            addEmptyLines(document, 3);
            
            addAiAnalysisSection(document, bf, h1Font, h2Font, bodyFont, footerFont, textSim, imageSim);

            // ==========================================
            // [Page 2] 변천사 그래프 + BI (간격 넓힘!)
            // ==========================================
            document.newPage();

            // 1. 히스토리 섹션 텍스트
            addTimelineText(document, h1Font, bodyFont);
            
            // 차트 위치 (상단 배치)
            float chartY = document.top() - 280; 
            
            // 차트 그리기
            drawTimelineChart(writer.getDirectContent(), bf, document.left(), chartY, document.right() - document.left(), 180, historyList);

            // [수정 포인트] 차트와 BI 사이 간격 대폭 추가 (15 -> 22)
            // 이렇게 하면 3번 섹션이 훨씬 아래쪽에서 시작됩니다.
            addEmptyLines(document, 22); 
            
            // 2. BI 섹션 출력
            addBiSection(document, bf, h1Font, h2Font, bodyFont, footerFont, biData);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("PDF 생성 중 오류 발생 brandId={}", brand.getBrandId(), e);
            throw new RuntimeException("리포트 파일 생성 실패", e);
        }
    }

    // -----------------------------------------------------------
    // 1. 표지 정보
    // -----------------------------------------------------------
    private void addCoverInfo(Document document, BaseFont bf, Font titleFont, Font bodyFont,
                              BrandDetailDTO brand, Long userId) throws DocumentException {
        
        Paragraph title = new Paragraph("ROYALTY 상표 분석 리포트", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        Paragraph dateP = new Paragraph("발행일: " + new SimpleDateFormat("yyyy.MM.dd").format(new Date()), bodyFont);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        dateP.setSpacingAfter(20);
        document.add(dateP);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 2.5f});
        infoTable.setSpacingAfter(10);

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.BOX);
        logoCell.setBorderColor(Color.LIGHT_GRAY);
        logoCell.setPadding(15);
        logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        logoCell.setFixedHeight(120); 

        try {
            if (brand.getCurrentLogoPath() != null && !brand.getCurrentLogoPath().isBlank()) {
                byte[] logoBytes = downloadUrlBytes(brand.getCurrentLogoPath(), 3000, 5000);
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(100, 100);
                logoCell.addElement(logo);
            } else {
                Paragraph noImg = new Paragraph("(이미지 없음)", bodyFont);
                noImg.setAlignment(Element.ALIGN_CENTER);
                logoCell.addElement(noImg);
            }
        } catch (Exception e) {
            logoCell.addElement(new Paragraph("[Img Error]", bodyFont));
        }
        infoTable.addCell(logoCell);

        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.BOX);
        textCell.setBorderColor(Color.LIGHT_GRAY);
        textCell.setPadding(15);
        textCell.setLeading(20f, 0f); 
        
        textCell.addElement(new Paragraph("브랜드명 :  " + safe(brand.getBrandName(), "-"), bodyFont));
        textCell.addElement(new Paragraph("카테고리 :  " + safe(brand.getCategory(), "-"), bodyFont));
        textCell.addElement(new Paragraph("요청자ID :  " + userId, bodyFont));
        textCell.addElement(new Paragraph("등록일자 :  " + safe(brand.getCreatedAt(), "-"), bodyFont));
        
        infoTable.addCell(textCell);

        document.add(infoTable);
    }

    // -----------------------------------------------------------
    // 2. AI 분석 결과 (소제목 여백 추가됨)
    // -----------------------------------------------------------
    private void addAiAnalysisSection(Document document, BaseFont bf, Font h1Font, Font h2Font, Font bodyFont, Font footerFont,
                                      float textSim, float imageSim) throws DocumentException {

        // 구분선
        LineSeparator line = new LineSeparator();
        line.setLineColor(Color.LIGHT_GRAY);
        document.add(line);
        addEmptyLines(document, 1);

        // [수정] 소제목과 줄 사이 간격 추가 (setSpacingAfter)
        Paragraph title = new Paragraph("1. 유사도 분석 결과", h1Font);
        title.setSpacingAfter(8); 
        document.add(title);
        
        // 얇은 줄 하나 더 그어서 강조 (선택 사항, 깔끔하게 하려면 생략 가능하지만 요청하신 '줄 사이 공간'을 위해 추가)
        // document.add(new LineSeparator(0.5f, 100, Color.LIGHT_GRAY, Element.ALIGN_LEFT, -2));
        // addEmptyLines(document, 1);

        document.add(new Paragraph("기존 등록 상표들과의 텍스트 및 이미지 유사도를 분석한 수치입니다.", bodyFont));
        addEmptyLines(document, 1);

        PdfPTable scoreTable = new PdfPTable(2);
        scoreTable.setWidthPercentage(100);
        scoreTable.setSpacingBefore(10);
        scoreTable.setSpacingAfter(20);

        scoreTable.addCell(makeKeyValueCell("텍스트 유사도", String.format("%.1f %%", textSim), bodyFont));
        scoreTable.addCell(makeKeyValueCell("이미지 유사도", String.format("%.1f %%", imageSim), bodyFont));
        
        document.add(scoreTable);

        document.add(new Paragraph("상세 지표 (낮을수록 안전)", h2Font));
        addEmptyLines(document, 1);
        
        document.add(new Paragraph("• Text Similarity", new Font(bf, 10, Font.NORMAL, Color.DARK_GRAY)));
        document.add(createBarChart(textSim));
        addEmptyLines(document, 1);

        document.add(new Paragraph("• Image Similarity", new Font(bf, 10, Font.NORMAL, Color.DARK_GRAY)));
        document.add(createBarChart(imageSim));
    }

    // -----------------------------------------------------------
    // 3. 타임라인 (Timeline) - 텍스트 부분만 (소제목 여백 추가됨)
    // -----------------------------------------------------------
    private void addTimelineText(Document document, Font h1Font, Font bodyFont) throws DocumentException {
        // [수정] 소제목과 줄 사이 간격 추가
        Paragraph title = new Paragraph("2. 히스토리 (유사도 변화)", h1Font);
        title.setSpacingAfter(8); 
        document.add(title);
        
        LineSeparator line = new LineSeparator();
        line.setLineColor(Color.LIGHT_GRAY);
        document.add(line);
        addEmptyLines(document, 1);

        document.add(new Paragraph("로고 수정에 따른 유사도 변화 추이입니다.", bodyFont));
    }

    // -----------------------------------------------------------
    // 4. BI (Brand Identity) - 통합됨 (소제목 여백 추가됨)
    // -----------------------------------------------------------
    private void addBiSection(Document document, BaseFont bf, Font h1Font, Font h2Font, Font bodyFont, Font footerFont, 
                           BrandBiData bi) throws DocumentException {
                           
        // [수정] 소제목과 줄 사이 간격 추가
        Paragraph title = new Paragraph("3. 브랜드 아이덴티티 (B.I)", h1Font);
        title.setSpacingAfter(8);
        document.add(title);

        LineSeparator line = new LineSeparator();
        line.setLineColor(Color.LIGHT_GRAY);
        document.add(line);
        addEmptyLines(document, 1);

        // Mission
        document.add(new Paragraph("Core Identity (Mission)", h2Font));
        String mission = (bi.getMission() != null && !bi.getMission().isBlank()) ? bi.getMission() : "-";
        
        PdfPCell missionCell = new PdfPCell(new Phrase(mission, bodyFont));
        missionCell.setPadding(12);
        missionCell.setBackgroundColor(new Color(248, 250, 252)); 
        missionCell.setBorderColor(Color.LIGHT_GRAY);
        
        PdfPTable mTable = new PdfPTable(1);
        mTable.setWidthPercentage(100);
        mTable.setSpacingBefore(5);
        mTable.addCell(missionCell);
        document.add(mTable);
        
        addEmptyLines(document, 1);

        // Keywords
        document.add(new Paragraph("Brand Keywords", h2Font));
        PdfPTable kw = new PdfPTable(3);
        kw.setWidthPercentage(100);
        kw.setSpacingBefore(5);
        
        List<String> keywords = (bi.getKeywords() != null) ? bi.getKeywords() : List.of();
        int limit = Math.min(keywords.size(), 9); 

        for (int i = 0; i < limit; i++) {
            PdfPCell c = new PdfPCell(new Phrase("# " + keywords.get(i), bodyFont));
            c.setPadding(10);
            c.setBorderColor(new Color(226, 232, 240));
            kw.addCell(c);
        }
        
        if (keywords.isEmpty()) {
            PdfPCell c = new PdfPCell(new Phrase("-", bodyFont));
            c.setColspan(3);
            kw.addCell(c);
        } else {
            int remainder = limit % 3;
            if (remainder > 0) {
                for (int i = 0; i < (3 - remainder); i++) {
                    PdfPCell empty = new PdfPCell(new Phrase(""));
                    empty.setBorderColor(new Color(226, 232, 240));
                    kw.addCell(empty);
                }
            }
        }
        document.add(kw);
        addEmptyLines(document, 1);
        
        // Slogan
        if (bi.getSlogan() != null && !bi.getSlogan().isEmpty()) {
             document.add(new Paragraph("Slogan Ideas", h2Font));
             int sLimit = Math.min(bi.getSlogan().size(), 3); 
             for(int i=0; i < sLimit; i++) {
                 document.add(new Paragraph("• " + bi.getSlogan().get(i), bodyFont));
             }
        }

        addEmptyLines(document, 2);
        
        // Footer
        LineSeparator bottom = new LineSeparator();
        bottom.setLineColor(Color.LIGHT_GRAY);
        document.add(bottom);
        Paragraph footer = new Paragraph("* 본 리포트는 AI 분석 모델의 예측 결과이며 법적 효력은 없습니다.", footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    // -----------------------------------------------------------
    // 유틸리티
    // -----------------------------------------------------------

    private void addEmptyLines(Document document, int number) throws DocumentException {
        for (int i = 0; i < number; i++) {
            document.add(Chunk.NEWLINE);
        }
    }

    private PdfPCell makeKeyValueCell(String key, String value, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(12);
        cell.setBorderColor(new Color(203, 213, 225));
        
        Font keyFont = new Font(valueFont.getBaseFont(), 10, Font.BOLD, Color.GRAY);
        Paragraph k = new Paragraph(key, keyFont);
        Paragraph v = new Paragraph(value, valueFont); 
        
        cell.addElement(k);
        cell.addElement(v);
        return cell;
    }

    private PdfPTable createBarChart(float percentage) {
        percentage = Math.max(0, Math.min(100, percentage));
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100); 
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.setSpacingBefore(5);

        Color barColor = (percentage >= 50) ? new Color(239, 68, 68) : (percentage >= 30 ? new Color(245, 158, 11) : new Color(34, 197, 94));
        
        PdfPCell c1 = new PdfPCell(new Phrase(""));
        c1.setBackgroundColor(barColor);
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setFixedHeight(8);
        
        PdfPCell c2 = new PdfPCell(new Phrase(""));
        c2.setBackgroundColor(new Color(241, 245, 249)); 
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setFixedHeight(8);

        try {
            float w1 = (percentage < 1) ? 1 : percentage;
            table.setWidths(new float[]{w1, 100 - w1});
            table.addCell(c1);
            table.addCell(c2);
        } catch (DocumentException e) { /* ignore */ }
        return table;
    }

    private void drawTimelineChart(PdfContentByte cb, BaseFont bf, float x, float y, float w, float h, List<BrandHistoryDTO> historyList) {
        List<BrandHistoryDTO> sorted = new ArrayList<>(historyList);
        sorted.sort(Comparator.comparing(BrandHistoryDTO::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
        int n = sorted.size();
        if (n < 1) return;
        
        float padding = 30f;
        float left = x + padding;
        float bottom = y; 
        float right = x + w - 10f;
        float top = y + h;

        cb.saveState();
        cb.setColorStroke(new Color(226, 232, 240));
        cb.setLineWidth(1f);
        // Grid
        for (int i = 0; i <= 4; i++) {
            float gy = bottom + (h) * (i / 4f);
            cb.moveTo(left, gy);
            cb.lineTo(right, gy);
        }
        cb.stroke();
        
        // Axis
        cb.setColorStroke(Color.GRAY);
        cb.moveTo(left, bottom); cb.lineTo(left, top);
        cb.moveTo(left, bottom); cb.lineTo(right, bottom);
        cb.stroke();

        // Labels
        cb.beginText();
        cb.setFontAndSize(bf, 8);
        cb.setColorFill(Color.GRAY);
        cb.showTextAligned(Element.ALIGN_RIGHT, "0%", left - 5, bottom - 3, 0);
        cb.showTextAligned(Element.ALIGN_RIGHT, "100%", left - 5, top - 3, 0);
        cb.endText();

        float stepX = (n <= 1) ? 0 : (right - left) / (n - 1);
        List<Float> textSeries = new ArrayList<>();
        List<Float> imageSeries = new ArrayList<>();
        
        for (BrandHistoryDTO hst : sorted) {
            textSeries.add(normalizeToPercent(hst.getTextSimilarity() != null ? hst.getTextSimilarity() : 0f));
            imageSeries.add(normalizeToPercent(hst.getImageSimilarity() != null ? hst.getImageSimilarity() : 0f));
        }

        plotLine(cb, left, bottom, top, stepX, textSeries, new Color(59, 130, 246)); 
        plotLine(cb, left, bottom, top, stepX, imageSeries, new Color(16, 185, 129)); 
        
        // Legend (범례)
        cb.beginText();
        cb.setFontAndSize(bf, 9);
        cb.setColorFill(new Color(59, 130, 246));
        cb.showTextAligned(Element.ALIGN_LEFT, "● Text", left + 10, top + 10, 0);
        cb.setColorFill(new Color(16, 185, 129));
        cb.showTextAligned(Element.ALIGN_LEFT, "● Image", left + 60, top + 10, 0);
        cb.endText();

        cb.restoreState();
    }

    private void plotLine(PdfContentByte cb, float left, float bottom, float top, float stepX, List<Float> series, Color color) {
        if (series.isEmpty()) return;
        cb.saveState();
        cb.setColorStroke(color);
        cb.setLineWidth(2f);
        
        float prevX = left;
        float prevY = valueToY(series.get(0), bottom, top);
        cb.moveTo(prevX, prevY);
        
        for (int i = 1; i < series.size(); i++) {
            float x = left + stepX * i;
            float y = valueToY(series.get(i), bottom, top);
            cb.lineTo(x, y);
        }
        cb.stroke();
        
        cb.setColorFill(color);
        for (int i = 0; i < series.size(); i++) {
            float x = left + stepX * i;
            float y = valueToY(series.get(i), bottom, top);
            cb.circle(x, y, 3f);
            cb.fill();
        }
        cb.restoreState();
    }

    private float valueToY(float v, float bottom, float top) {
        return bottom + (top - bottom) * (Math.max(0f, Math.min(100f, v)) / 100f);
    }
    
    private BaseFont loadKoreanBaseFontFromClasspath(String classpath) throws IOException, DocumentException {
        try (InputStream is = new ClassPathResource(classpath).getInputStream()) {
            File tmp = File.createTempFile("font-", ".ttf");
            tmp.deleteOnExit();
            try (OutputStream os = new FileOutputStream(tmp)) {
                is.transferTo(os);
            }
            return BaseFont.createFont(tmp.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        }
    }

    private byte[] downloadUrlBytes(String url, int connTimeout, int readTimeout) throws IOException {
        HttpURLConnection conn = null;
        try {
            conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setConnectTimeout(connTimeout);
            conn.setReadTimeout(readTimeout);
            conn.setRequestMethod("GET");
            if (conn.getResponseCode() >= 300) throw new IOException("Image download failed");
            try (InputStream in = conn.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                in.transferTo(out);
                return out.toByteArray();
            }
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    private float normalizeToPercent(float v) {
        return (v <= 1.0f && v >= 0f) ? v * 100f : Math.max(0f, Math.min(100f, v));
    }

    private String safe(String v, String fallback) { return (v == null || v.isBlank()) ? fallback : v; }
    private String safe(java.time.LocalDateTime v, String fallback) { return (v == null) ? fallback : v.format(java.time.format.DateTimeFormatter.ofPattern("yyyy.MM.dd")); }
}