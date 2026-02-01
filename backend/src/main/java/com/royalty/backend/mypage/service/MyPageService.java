package com.royalty.backend.mypage.service;

// 1. 자바 표준 라이브러리
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
// 2. 스프링 프레임워크
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

// 3. PDF 라이브러리 (OpenPDF)
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
// 4. 프로젝트 내부 클래스
import com.royalty.backend.mypage.dto.BookmarkDTO;
import com.royalty.backend.mypage.dto.BrandDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
import com.royalty.backend.mypage.dto.MyPageDashboardDTO;
import com.royalty.backend.mypage.mapper.MyPageMapper;

// 5. 롬복
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MyPageService {

    private final MyPageMapper myPageMapper;
    private final S3Service s3Service; // ⭐ S3Service 주입 (따로 만든 파일 사용)

    // ==========================================
    // 1. 🏠 대시보드 (Dashboard)
    // ==========================================
    @Transactional(readOnly = true)
    public MyPageDashboardDTO getDashboard(Long userId) {
        MyPageDashboardDTO dashboard = new MyPageDashboardDTO();
        dashboard.setUserId(userId);

        // 1. 내 브랜드 요약
        List<BrandDTO> brands = myPageMapper.selectMyBrands(userId);
        dashboard.setTotalBrands(brands.size());
        dashboard.setRecentBrands(brands.stream().limit(3).collect(Collectors.toList()));

        // 2. 내 북마크 요약
        List<BookmarkDTO> bookmarks = myPageMapper.selectBookmarks(userId);
        dashboard.setTotalBookmarks(bookmarks.size());
        dashboard.setRecentBookmarks(bookmarks.stream().limit(3).collect(Collectors.toList()));

        return dashboard;
    }

    // ==========================================
    // 2. 🏷️ 내 브랜드 관리 (Brand Logic)
    // ==========================================
    
    // 목록 조회
    @Transactional(readOnly = true)
    public List<BrandDTO> getMyBrands(Long userId) {
        return myPageMapper.selectMyBrands(userId);
    }

    // 상세 조회
    @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long userId, Long brandId) {
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(userId, brandId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않거나 권한이 없는 브랜드입니다.");
        }
        detail.setHistoryList(myPageMapper.selectBrandHistory(brandId));

        return detail;
    }

    // ==========================================
    // 1. 브랜드 등록 (이미지가 없으면 NULL로 저장)
    // ==========================================
    @Transactional
    public void createBrand(Long userId, String brandName, String category, String description, MultipartFile logoImage) {
        
        // 1. 텍스트 정보 먼저 저장 (Brand 테이블)
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandName(brandName);
        brandDTO.setCategory(category);
        brandDTO.setDescription(description);

        myPageMapper.insertBrand(brandDTO); // 여기서 brandId가 생성됨

        // 2. 이미지가 "있을 때만" S3 업로드 & DB 저장
        String imagePath = "";
        
        if (logoImage != null && !logoImage.isEmpty()) {
            // (1) S3에 파일 업로드하고 URL 받아오기
            imagePath = s3Service.upload(logoImage); 
            
            // (2) 받아온 URL을 DB(BrandLogo 테이블) image_path 컬럼에 저장
            myPageMapper.insertBrandLogo(brandDTO.getBrandId(), imagePath);
        }

        // 3. 히스토리 생성 (이미지 없으면 null로 들어감 -> DB 에러 안 나게 확인 필수)
        myPageMapper.insertBrandHistory(brandDTO.getBrandId(), imagePath, "최초 등록");
    }


    // ==========================================
    // 2. 브랜드 수정 (나중에 이미지 넣으면 그때 S3 업로드)
    // ==========================================
    @Transactional
    public void updateBrand(Long userId, Long brandId, String name, String category, String desc, MultipartFile file) {
        
        // 1. 텍스트 정보 업데이트
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandId(brandId);
        brandDTO.setBrandName(name);
        brandDTO.setCategory(category);
        brandDTO.setDescription(desc);
        
        myPageMapper.updateBrand(brandDTO); 

        // 2. 이미지 처리 (새로운 이미지가 들어왔을 때!)
        boolean isImageUpdated = false;
        String finalImagePath = "";

        if (file != null && !file.isEmpty()) {
            // (1) S3에 업로드하고 새 주소(URL) 받기
            String newS3Url = s3Service.upload(file);
            finalImagePath = newS3Url;

            // (2) 기존에 로고가 있었는지 확인
            int count = myPageMapper.countBrandLogo(brandId);
            
            if (count > 0) {
                // 기존 거 있으면 -> URL만 업데이트 (UPDATE)
                myPageMapper.updateBrandLogo(brandId, newS3Url);
            } else {
                // 기존 거 없으면 -> 새로 만들기 (INSERT) - ⭐ 여기가 핵심!
                myPageMapper.insertBrandLogo(brandId, newS3Url);
            }
            
            isImageUpdated = true;
        } else {
            // 이미지를 안 바꿨으면? 기존 URL 유지 (히스토리 기록용)
            finalImagePath = myPageMapper.selectCurrentLogoPath(brandId);
        }

        // 3. 이미지가 추가/변경되었을 때만 히스토리(버전) 생성
        if (isImageUpdated) {
             myPageMapper.insertBrandHistory(brandId, finalImagePath, "이미지 업데이트 및 버전 기록");
        }
    }

    // 브랜드 삭제
    @Transactional
    public void deleteBrand(Long userId, Long brandId) {
        myPageMapper.deleteBrand(userId, brandId);
    }

    // 알림 설정 변경
    @Transactional
    public void toggleNotification(Long userId, Long brandId, boolean enabled) {
        myPageMapper.updateNotificationStatus(userId, brandId, enabled);
    }

    // ==========================================
    // 3. ⭐ 북마크 (Bookmark)
    // ==========================================
    @Transactional(readOnly = true)
    public List<BookmarkDTO> getBookmarks(Long userId) {
        return myPageMapper.selectBookmarks(userId);
    }

    public List<BookmarkDTO> getBookmarkList(Long userId) {
        // 매퍼에서 이미 JOIN과 AS를 통해 BookmarkDTO가 완성되어 나옵니다.
        return myPageMapper.selectBookmarks(userId);
    }

    // ==========================================
    // 4. 📄 상표 분석 리포트 PDF 생성
    // ==========================================
    @Transactional(readOnly = true)
    public byte[] generateBrandReport(Long userId, Long brandId) {

        BrandDetailDTO brand = getBrandDetail(userId, brandId);

        if (brand == null) {
            throw new IllegalStateException("브랜드 정보가 존재하지 않습니다.");
        }

        List<BrandHistoryDTO> historyList = brand.getHistoryList();
        if (historyList == null || historyList.isEmpty()) {
            throw new IllegalStateException("분석 데이터가 존재하지 않습니다.");
        }

        BrandHistoryDTO latest = pickLatestHistory(historyList);

        float imageSimRaw = latest.getImageSimilarity() != null ? latest.getImageSimilarity() : 0f;
        float textSimRaw  = latest.getTextSimilarity()  != null ? latest.getTextSimilarity()  : 0f;

        float imageSim = normalizeToPercent(imageSimRaw);
        float textSim  = normalizeToPercent(textSimRaw);

        float maxSim = Math.max(imageSim, textSim);
        int probability = clampInt(Math.round(100 - maxSim), 0, 100);

        GradeResult gradeResult = decideGrade(probability);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            BaseFont bf = loadKoreanBaseFontFromClasspath("fonts/malgun.ttf");

            Font titleFont  = new Font(bf, 22, Font.BOLD);
            Font h1Font     = new Font(bf, 14, Font.BOLD, Color.DARK_GRAY);
            Font h2Font     = new Font(bf, 12, Font.BOLD, Color.DARK_GRAY);
            Font bodyFont   = new Font(bf, 10, Font.NORMAL);
            Font scoreFont  = new Font(bf, 18, Font.BOLD, gradeResult.gradeColor);
            Font footerFont = new Font(bf, 9, Font.NORMAL, Color.GRAY);

            addCoverPage(document, bf, titleFont, bodyFont, brand, userId, probability, gradeResult);

            document.newPage();
            addAiAnalysisPage(document, bf, h1Font, h2Font, bodyFont, footerFont, brand, latest, textSim, imageSim, probability, gradeResult);

            document.newPage();
            addTimelinePage(document, writer, bf, h1Font, bodyFont, footerFont, historyList);

            document.newPage();
            addBiPage(document, bf, h1Font, h2Font, bodyFont, footerFont, brand);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("PDF 생성 중 오류가 발생했습니다.", e);
        }
    }

    /* =========================
       1) 페이지 구성: 표지
       ========================= */
    private void addCoverPage(
            Document document,
            BaseFont bf,
            Font titleFont,
            Font bodyFont,
            BrandDetailDTO brand,
            Long userId,
            int probability,
            GradeResult gradeResult
    ) throws DocumentException {

        Paragraph title = new Paragraph("ROYALTY AI 상표 분석 리포트", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        Paragraph dateP = new Paragraph("발행일자: " + new SimpleDateFormat("yyyy년 MM월 dd일").format(new Date()), bodyFont);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        dateP.setSpacingAfter(20);
        document.add(dateP);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 2});
        infoTable.setSpacingBefore(10);
        infoTable.setSpacingAfter(20);

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);

        try {
            if (brand.getCurrentLogoPath() != null && !brand.getCurrentLogoPath().isBlank()) {
                byte[] logoBytes = downloadUrlBytes(brand.getCurrentLogoPath(), 4000, 6000);
                Image logo = Image.getInstance(logoBytes);
                logo.scaleToFit(120, 120);
                logoCell.addElement(logo);
            } else {
                logoCell.addElement(new Paragraph("(이미지 없음)", bodyFont));
            }
        } catch (Exception e) {
            log.warn("로고 이미지 로드 실패: {}", brand.getCurrentLogoPath(), e);
            logoCell.addElement(new Paragraph("[이미지 로드 실패]", bodyFont));
        }

        infoTable.addCell(logoCell);

        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.addElement(new Paragraph("• 상표명 : " + safe(brand.getBrandName(), "(로고 전용)"), bodyFont));
        textCell.addElement(new Paragraph("• 분류 : " + safe(brand.getCategory(), "-"), bodyFont));
        textCell.addElement(new Paragraph("• 요청자 ID : " + userId, bodyFont));
        textCell.addElement(new Paragraph("• 등록일 : " + safe(brand.getCreatedAt(), "-"), bodyFont));
        infoTable.addCell(textCell);
        document.add(infoTable);

        PdfPTable summary = new PdfPTable(1);
        summary.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setPadding(18);
        cell.setBackgroundColor(new Color(248, 250, 252));
        cell.setBorderColor(Color.LIGHT_GRAY);

        Font big = new Font(bf, 18, Font.BOLD, gradeResult.gradeColor);
        Paragraph p1 = new Paragraph("등록 가능성  " + probability + "%", big);
        p1.setAlignment(Element.ALIGN_CENTER);
        p1.setSpacingAfter(8);

        Font mid = new Font(bf, 12, Font.BOLD, Color.DARK_GRAY);
        Paragraph p2 = new Paragraph("종합 등급  " + gradeResult.gradeText, mid);
        p2.setAlignment(Element.ALIGN_CENTER);
        p2.setSpacingAfter(8);

        Paragraph p3 = new Paragraph(gradeResult.comment, bodyFont);
        p3.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(p1);
        cell.addElement(p2);
        cell.addElement(p3);

        summary.addCell(cell);
        document.add(summary);
    }

    /* =========================
       2) 페이지 구성: AI 분석
       ========================= */
    private void addAiAnalysisPage(
            Document document,
            BaseFont bf,
            Font h1Font,
            Font h2Font,
            Font bodyFont,
            Font footerFont,
            BrandDetailDTO brand,
            BrandHistoryDTO latest,
            float textSim,
            float imageSim,
            int probability,
            GradeResult gradeResult
    ) throws DocumentException {

        document.add(new Paragraph("1. AI 분석 결과", h1Font));
        document.add(new LineSeparator());

        document.add(new Paragraph("요약", h2Font));
        document.add(new Paragraph(
                "본 리포트는 등록 상표와의 유사도 분석 결과를 기반으로 혼동 가능성을 평가합니다. " +
                "유사도는 낮을수록 상표 리스크가 낮은 것으로 해석됩니다.",
                bodyFont
        ));
        document.add(Chunk.NEWLINE);

        PdfPTable scoreTable = new PdfPTable(2);
        scoreTable.setWidthPercentage(100);
        scoreTable.setWidths(new float[]{1, 1});
        scoreTable.setSpacingBefore(5);
        scoreTable.setSpacingAfter(10);

        scoreTable.addCell(makeKeyValueCell("텍스트 유사도", String.format("%.1f %%", textSim), bodyFont));
        scoreTable.addCell(makeKeyValueCell("이미지 유사도", String.format("%.1f %%", imageSim), bodyFont));
        scoreTable.addCell(makeKeyValueCell("등록 가능성(계산)", probability + " %", bodyFont));
        scoreTable.addCell(makeKeyValueCell("종합 등급", gradeResult.gradeText, new Font(bf, 10, Font.BOLD, gradeResult.gradeColor)));
        document.add(scoreTable);

        document.add(new Paragraph("근거 및 해석", h2Font));
        document.add(new Paragraph(
                "텍스트/이미지 유사도 중 더 높은 값을 기준으로 리스크를 평가했습니다. " +
                "현재 케이스는 유사도가 낮은 편으로, 소비자가 두 상표를 혼동할 가능성이 상대적으로 낮게 평가됩니다.",
                bodyFont
        ));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("권장 조치", h2Font));
        document.add(new Paragraph(
                "1) 동일/유사 상표가 추가로 출원될 수 있으므로 주기적 모니터링을 권장합니다.\n" +
                "2) 유사도가 50% 이상으로 상승하는 케이스가 발견될 경우, 지정상품/유사군코드 기준으로 재검토가 필요합니다.",
                bodyFont
        ));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("상세 막대 그래프", h2Font));
        document.add(new Paragraph("텍스트 유사도 (낮을수록 좋습니다)", bodyFont));
        document.add(createBarChart(textSim));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("이미지 유사도 (낮을수록 좋습니다)", bodyFont));
        document.add(createBarChart(imageSim));
        document.add(Chunk.NEWLINE);

        document.add(new LineSeparator(0.5f, 100, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2));
        Paragraph footer = new Paragraph(
                "* 본 리포트는 AI 분석 모델의 예측 결과이며 법적 효력은 없습니다.\n" +
                "정확한 등록 가능성 판단은 변리사와 상담하시기 바랍니다.",
                footerFont
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    /* =========================
       3) 페이지 구성: 변천사(추이 그래프)
       ========================= */
    private void addTimelinePage(
            Document document,
            PdfWriter writer,
            BaseFont bf,
            Font h1Font,
            Font bodyFont,
            Font footerFont,
            List<BrandHistoryDTO> historyList
    ) throws DocumentException {

        document.add(new Paragraph("2. 상표 변천사(유사도 추이)", h1Font));
        document.add(new LineSeparator());
        document.add(Chunk.NEWLINE);

        Paragraph desc = new Paragraph(
                "시간 흐름에 따른 유사도 변화(텍스트/이미지)를 시각화한 그래프입니다. " +
                "데이터가 누적될수록 변화 추세를 기반으로 조기 경보 기준을 설계할 수 있습니다.",
                bodyFont
        );
        document.add(desc);
        document.add(Chunk.NEWLINE);

        PdfContentByte cb = writer.getDirectContent();
        float chartX = document.left();
        float chartY = document.bottom() + 220;
        float chartW = document.right() - document.left();
        float chartH = 220;

        drawTimelineChart(cb, bf, chartX, chartY, chartW, chartH, historyList);

        document.add(Chunk.NEWLINE);
        document.add(new LineSeparator(0.5f, 100, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2));
        Paragraph footer = new Paragraph(
                "* 추이 그래프는 저장된 분석 이력 데이터를 기반으로 생성됩니다.",
                footerFont
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private void drawTimelineChart(
            PdfContentByte cb,
            BaseFont bf,
            float x,
            float y,
            float w,
            float h,
            List<BrandHistoryDTO> historyList
    ) {

    	List<BrandHistoryDTO> sorted = new ArrayList<>(historyList);
    	sorted.sort(Comparator.comparing(
    	        BrandHistoryDTO::getCreatedAt,
    	        Comparator.nullsLast(Comparator.naturalOrder())
    	));

        int n = sorted.size();
        if (n < 1) return;

        float padding = 35f;
        float left = x + padding;
        float bottom = y + padding;
        float right = x + w - 10f;
        float top = y + h - 15f;

        cb.saveState();

        cb.setColorStroke(new Color(220, 230, 240));
        cb.setLineWidth(1f);
        for (int i = 0; i <= 4; i++) {
            float gy = bottom + (top - bottom) * (i / 4f);
            cb.moveTo(left, gy);
            cb.lineTo(right, gy);
        }
        cb.stroke();

        cb.setColorStroke(Color.DARK_GRAY);
        cb.setLineWidth(1.2f);
        cb.moveTo(left, bottom);
        cb.lineTo(left, top);
        cb.moveTo(left, bottom);
        cb.lineTo(right, bottom);
        cb.stroke();

        cb.beginText();
        cb.setFontAndSize(bf, 9);
        cb.setColorFill(Color.DARK_GRAY);
        cb.showTextAligned(Element.ALIGN_LEFT, "0%", left - 28, bottom - 3, 0);
        cb.showTextAligned(Element.ALIGN_LEFT, "50%", left - 30, bottom + (top - bottom) * 0.5f - 3, 0);
        cb.showTextAligned(Element.ALIGN_LEFT, "100%", left - 33, top - 3, 0);
        cb.endText();

        float stepX = (n == 1) ? 0 : (right - left) / (n - 1);

        List<Float> textSeries = new ArrayList<>();
        List<Float> imageSeries = new ArrayList<>();
        for (BrandHistoryDTO hst : sorted) {
            float t = normalizeToPercent(hst.getTextSimilarity() != null ? hst.getTextSimilarity() : 0f);
            float i = normalizeToPercent(hst.getImageSimilarity() != null ? hst.getImageSimilarity() : 0f);
            textSeries.add(t);
            imageSeries.add(i);
        }

        plotLine(cb, left, bottom, top, stepX, textSeries, new Color(59, 130, 246));
        plotLine(cb, left, bottom, top, stepX, imageSeries, new Color(99, 102, 241));

        cb.beginText();
        cb.setFontAndSize(bf, 10);
        cb.setColorFill(Color.DARK_GRAY);
        cb.showTextAligned(Element.ALIGN_LEFT, "텍스트 유사도", left + 10, top + 2, 0);
        cb.setColorFill(new Color(59, 130, 246));
        cb.showTextAligned(Element.ALIGN_LEFT, "●", left - 5, top + 2, 0);

        cb.setColorFill(Color.DARK_GRAY);
        cb.showTextAligned(Element.ALIGN_LEFT, "이미지 유사도", left + 110, top + 2, 0);
        cb.setColorFill(new Color(99, 102, 241));
        cb.showTextAligned(Element.ALIGN_LEFT, "●", left + 95, top + 2, 0);
        cb.endText();

        cb.restoreState();
    }

    private void plotLine(
            PdfContentByte cb,
            float left,
            float bottom,
            float top,
            float stepX,
            List<Float> series,
            Color color
    ) {
        cb.saveState();
        cb.setColorStroke(color);
        cb.setLineWidth(2f);

        float prevX = left;
        float prevY = valueToY(series.get(0), bottom, top);

        cb.moveTo(prevX, prevY);
        for (int idx = 1; idx < series.size(); idx++) {
            float x = left + stepX * idx;
            float y = valueToY(series.get(idx), bottom, top);
            cb.lineTo(x, y);
        }
        cb.stroke();

        cb.setColorFill(color);
        for (int idx = 0; idx < series.size(); idx++) {
            float x = left + stepX * idx;
            float y = valueToY(series.get(idx), bottom, top);
            cb.circle(x, y, 2.8f);
            cb.fill();
        }

        cb.restoreState();
    }

    private float valueToY(float v, float bottom, float top) {
        float clamped = Math.max(0f, Math.min(100f, v));
        return bottom + (top - bottom) * (clamped / 100f);
    }

    /* =========================
       4) 페이지 구성: BI
       ========================= */
    private void addBiPage(
            Document document,
            BaseFont bf,
            Font h1Font,
            Font h2Font,
            Font bodyFont,
            Font footerFont,
            BrandDetailDTO brand
    ) throws DocumentException {

        document.add(new Paragraph("3. 브랜드 아이덴티티(B.I)", h1Font));
        document.add(new LineSeparator());
        document.add(Chunk.NEWLINE);

        GeneratedBi bi = generateBiFromBrand(brand);

        document.add(new Paragraph("Core Identity", h2Font));
        document.add(new Paragraph("BRAND MISSION", new Font(bf, 10, Font.BOLD, Color.GRAY)));
        document.add(new Paragraph(bi.mission, bodyFont));
        document.add(Chunk.NEWLINE);

        document.add(new Paragraph("Brand Keywords", h2Font));
        PdfPTable kw = new PdfPTable(3);
        kw.setWidthPercentage(100);
        kw.setSpacingBefore(6);
        kw.setSpacingAfter(10);

        for (int i = 0; i < bi.keywords.size(); i++) {
            String k = bi.keywords.get(i);
            PdfPCell c = new PdfPCell(new Phrase((i + 1) + ". " + k, bodyFont));
            c.setPadding(10);
            c.setBorderColor(new Color(226, 232, 240));
            kw.addCell(c);
        }
        document.add(kw);

        document.add(new Paragraph("Copywriting Examples", h2Font));
        for (int i = 0; i < bi.copyExamples.size(); i++) {
            PdfPTable t = new PdfPTable(1);
            t.setWidthPercentage(100);
            PdfPCell c = new PdfPCell(new Phrase((i + 1) + ") " + bi.copyExamples.get(i), bodyFont));
            c.setPadding(12);
            c.setBackgroundColor(new Color(248, 250, 252));
            c.setBorderColor(new Color(226, 232, 240));
            t.addCell(c);
            t.setSpacingBefore(6);
            document.add(t);
        }

        document.add(Chunk.NEWLINE);
        document.add(new LineSeparator(0.5f, 100, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2));
        Paragraph footer = new Paragraph(
                "* BI 내용은 현재 등록된 브랜드 정보(분류/설명)를 기반으로 생성된 요약 결과입니다.",
                footerFont
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private GeneratedBi generateBiFromBrand(BrandDetailDTO brand) {
        String name = safe(brand.getBrandName(), "브랜드");
        String category = safe(brand.getCategory(), "일반");
        String desc = safe(brand.getDescription(), "");

        String mission;
        if (!desc.isBlank()) {
            mission = desc;
        } else {
            mission = category + " 분야에서 신뢰와 일관성을 전달하는 브랜드 경험을 제공합니다.";
        }

        List<String> keywords = new ArrayList<>();
        keywords.add("신뢰");
        keywords.add("상징");
        keywords.add("일관성");

        List<String> copy = new ArrayList<>();
        copy.add(name + ", 당신의 선택에 확신을 더합니다.");
        copy.add("일관된 가치로 기억되는 " + name + ".");
        copy.add("상징으로 말하는 " + name + ", " + category + "의 기준.");

        return new GeneratedBi(mission, keywords, copy);
    }

    /* =========================
       기존 막대 그래프 (유지)
       ========================= */
    private PdfPTable createBarChart(float percentage) throws DocumentException {
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(80);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);

        Color barColor;
        if (percentage >= 50) barColor = new Color(220, 50, 50);
        else if (percentage >= 30) barColor = new Color(255, 165, 0);
        else barColor = new Color(50, 180, 50);

        PdfPCell cell1 = new PdfPCell(new Phrase(""));
        cell1.setBackgroundColor(barColor);
        cell1.setBorder(Rectangle.NO_BORDER);
        cell1.setFixedHeight(10);

        PdfPCell cell2 = new PdfPCell(new Phrase(""));
        cell2.setBackgroundColor(Color.LIGHT_GRAY);
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setFixedHeight(10);

        float width1 = (percentage < 1) ? 1 : percentage;
        float width2 = 100 - width1;

        table.setWidths(new float[]{width1, width2});
        table.addCell(cell1);
        table.addCell(cell2);

        return table;
    }

    /* =========================
       유틸/헬퍼
       ========================= */
    private BrandHistoryDTO pickLatestHistory(List<BrandHistoryDTO> list) {
        return list.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparing(
                        BrandHistoryDTO::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .orElseThrow(() -> new IllegalStateException("분석 히스토리가 비어있습니다."));
    }

    private float normalizeToPercent(float v) {
        // 0~1이면 0~100으로 보정
        if (v <= 1.0f && v >= 0f) {
            return v * 100f;
        }
        // 0~100으로 가정
        return Math.max(0f, Math.min(100f, v));
    }

    private int clampInt(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private String safe(String v, String fallback) {
        if (v == null || v.isBlank()) return fallback;
        return v;
    }
    
    private String safe(LocalDateTime v, String fallback) {
        if (v == null) return fallback;
        return v.format(java.time.format.DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"));
    }

    private PdfPCell makeKeyValueCell(String key, String value, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(10);
        cell.setBorderColor(new Color(226, 232, 240));

        Paragraph k = new Paragraph(key, new Font(valueFont.getBaseFont(), 9, Font.BOLD, Color.GRAY));
        Paragraph v = new Paragraph(value, valueFont);
        cell.addElement(k);
        cell.addElement(v);
        return cell;
    }

    private GradeResult decideGrade(int probability) {
        if (probability >= 80) {
            return new GradeResult("A (매우 안전)", new Color(0, 100, 255),
                    "기존 상표와 유사도가 매우 낮습니다. 등록 가능성이 높게 평가됩니다.");
        } else if (probability >= 50) {
            return new GradeResult("B (보통)", new Color(255, 140, 0),
                    "일부 유사한 요소가 발견되었습니다. 지정상품/유사군 기준으로 검토를 권장합니다.");
        } else {
            return new GradeResult("C (위험)", new Color(220, 0, 0),
                    "등록된 상표와 유사도가 높습니다. 출원 전 전문가 검토가 필요합니다.");
        }
    }

    private BaseFont loadKoreanBaseFontFromClasspath(String classpath) {
        // JAR 환경에서도 깨지지 않게: classpath -> InputStream -> temp file
        try (InputStream is = new ClassPathResource(classpath).getInputStream()) {
            File tmp = File.createTempFile("font-", ".ttf");
            tmp.deleteOnExit();

            try (OutputStream os = new FileOutputStream(tmp)) {
                byte[] buf = new byte[4096];
                int r;
                while ((r = is.read(buf)) != -1) {
                    os.write(buf, 0, r);
                }
            }

            return BaseFont.createFont(tmp.getAbsolutePath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("폰트 로드 실패: " + classpath, e);
        }
    }

    private byte[] downloadUrlBytes(String url, int connectTimeoutMs, int readTimeoutMs) throws IOException {
        HttpURLConnection conn = null;
        try {
            URL u = new URL(url);
            conn = (HttpURLConnection) u.openConnection();
            conn.setConnectTimeout(connectTimeoutMs);
            conn.setReadTimeout(readTimeoutMs);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestMethod("GET");

            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) {
                throw new IOException("이미지 다운로드 실패 HTTP " + code);
            }

            try (InputStream in = conn.getInputStream();
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {

                byte[] buf = new byte[8192];
                int r;
                while ((r = in.read(buf)) != -1) {
                    out.write(buf, 0, r);
                }
                return out.toByteArray();
            }
        } finally {
            if (conn != null) conn.disconnect();
        }
    }

    /* =========================
       내부 타입
       ========================= */
    private static class GradeResult {
        final String gradeText;
        final Color gradeColor;
        final String comment;

        GradeResult(String gradeText, Color gradeColor, String comment) {
            this.gradeText = gradeText;
            this.gradeColor = gradeColor;
            this.comment = comment;
        }
    }

    private static class GeneratedBi {
        final String mission;
        final List<String> keywords;
        final List<String> copyExamples;

        GeneratedBi(String mission, List<String> keywords, List<String> copyExamples) {
            this.mission = mission;
            this.keywords = keywords;
            this.copyExamples = copyExamples;
        }
    }
}