package com.royalty.backend.mypage.service;

// 1. 자바 표준 라이브러리
import java.awt.Color; 
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;   
import java.util.List;
import java.util.stream.Collectors;

// 2. 스프링 프레임워크
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

// 3. PDF 라이브러리 (OpenPDF)
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
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import org.springframework.core.io.ClassPathResource;

// 4. 프로젝트 내부 클래스
import com.royalty.backend.mypage.dto.BookmarkDTO;
import com.royalty.backend.mypage.dto.BrandDTO;
import com.royalty.backend.mypage.dto.BrandDetailDTO;
import com.royalty.backend.mypage.dto.BrandHistoryDTO;
import com.royalty.backend.mypage.dto.MyPageDashboardDTO;
import com.royalty.backend.mypage.dto.ReportDTO;
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
//        detail.setReportList(myPageMapper.selectBrandReports(brandId));

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
        String imagePath = null;
        
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
        String finalImagePath = null; // 히스토리에 넣을 최종 주소

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

    // ==========================================
    // 4. 📄 상표 분석 리포트 PDF 생성
    // ==========================================
    @Transactional(readOnly = true)
    public byte[] generateBrandReport(Long userId, Long brandId) {
        
        BrandDetailDTO brand = getBrandDetail(userId, brandId);
        
        if (brand.getHistoryList() == null || brand.getHistoryList().isEmpty()) {
            throw new IllegalStateException("분석 데이터가 존재하지 않습니다.");
        }

        BrandHistoryDTO analysis = brand.getHistoryList().get(0);
        
        float imageSim = (analysis.getImageSimilarity() != null) ? analysis.getImageSimilarity() : 0f;
        float textSim = (analysis.getTextSimilarity() != null) ? analysis.getTextSimilarity() : 0f;
        
        double maxSim = Math.max(imageSim, textSim);
        int probability = (int) (100 - maxSim);
        
        String grade;
        Color gradeColor;
        String comment;

        if (probability >= 80) {
            grade = "A (매우 안전)";
            gradeColor = new Color(0, 100, 255);
            comment = "기존 상표와 유사도가 매우 낮습니다. 등록 가능성이 아주 높습니다.";
        } else if (probability >= 50) {
            grade = "B (보통)";
            gradeColor = new Color(255, 140, 0);
            comment = "일부 유사한 요소가 발견되었습니다. 전문가의 검토를 권장합니다.";
        } else {
            grade = "C (위험)";
            gradeColor = new Color(220, 0, 0);
            comment = "등록된 상표와 매우 유사합니다. 상표 출원 시 거절될 위험이 큽니다.";
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // 폰트 설정
            String fontPath = new ClassPathResource("fonts/malgun.ttf").getURL().toString();
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            
            Font titleFont = new Font(bf, 22, Font.BOLD);
            Font headerFont = new Font(bf, 12, Font.BOLD, Color.DARK_GRAY);
            Font bodyFont = new Font(bf, 10, Font.NORMAL);
            Font scoreFont = new Font(bf, 18, Font.BOLD, gradeColor);
            Font footerFont = new Font(bf, 9, Font.NORMAL, Color.GRAY);

            // (1) 헤더
            Paragraph title = new Paragraph("ROYALTY AI 상표 분석 리포트", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);
            
            Paragraph dateP = new Paragraph("발행일자: " + new SimpleDateFormat("yyyy년 MM월 dd일").format(new Date()), bodyFont);
            dateP.setAlignment(Element.ALIGN_RIGHT);
            dateP.setSpacingAfter(30);
            document.add(dateP);

            // (2) 분석 대상 정보
            document.add(new Paragraph("1. 분석 대상 정보", headerFont));
            document.add(new LineSeparator());
            
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1, 2});
            infoTable.setSpacingBefore(10);
            infoTable.setSpacingAfter(30);

            // 로고 이미지 (S3 URL에서 불러옴)
            PdfPCell imageCell = new PdfPCell();
            imageCell.setBorder(Rectangle.NO_BORDER);
            try {
                if (brand.getCurrentLogoPath() != null) {
                    // S3 URL은 인터넷 주소이므로 바로 로드 가능
                    Image logo = Image.getInstance(brand.getCurrentLogoPath());
                    logo.scaleToFit(120, 120);
                    imageCell.addElement(logo);
                } else {
                    imageCell.addElement(new Paragraph("(이미지 없음)", bodyFont));
                }
            } catch (Exception e) {
                imageCell.addElement(new Paragraph("[이미지 로드 실패]", bodyFont));
            }
            infoTable.addCell(imageCell);

            PdfPCell textCell = new PdfPCell();
            textCell.setBorder(Rectangle.NO_BORDER);
            textCell.addElement(new Paragraph("• 상표명 : " + (brand.getBrandName() != null ? brand.getBrandName() : "(로고 전용)"), bodyFont));
            textCell.addElement(new Paragraph("• 분류 : " + brand.getCategory(), bodyFont));
            textCell.addElement(new Paragraph("• 요청자 ID : " + userId, bodyFont));
            infoTable.addCell(textCell);

            document.add(infoTable);

            // (3) 종합 진단
            document.add(new Paragraph("2. AI 종합 진단", headerFont));
            document.add(new LineSeparator());
            
            PdfPTable resultTable = new PdfPTable(1);
            resultTable.setWidthPercentage(100);
            resultTable.setSpacingBefore(10);
            resultTable.setSpacingAfter(30);
            
            PdfPCell resultCell = new PdfPCell();
            resultCell.setBackgroundColor(new Color(245, 245, 245));
            resultCell.setPadding(20);
            resultCell.setBorderColor(Color.LIGHT_GRAY);

            Paragraph scoreP = new Paragraph("등록 가능성  " + probability + "%", titleFont);
            scoreP.setAlignment(Element.ALIGN_CENTER);
            resultCell.addElement(scoreP);

            Paragraph gradeP = new Paragraph("종합 등급  " + grade, scoreFont);
            gradeP.setAlignment(Element.ALIGN_CENTER);
            gradeP.setSpacingAfter(10);
            resultCell.addElement(gradeP);

            Paragraph commentP = new Paragraph(comment, bodyFont);
            commentP.setAlignment(Element.ALIGN_CENTER);
            resultCell.addElement(commentP);

            resultTable.addCell(resultCell);
            document.add(resultTable);

            // (4) 상세 분석 차트
            document.add(new Paragraph("3. 상세 유사도 분석 (낮을수록 좋습니다)", headerFont));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph(String.format("• 텍스트 유사도 : %.1f %%", textSim), bodyFont));
            document.add(createBarChart(textSim));
            document.add(new Paragraph("\n"));

            document.add(new Paragraph(String.format("• 이미지 유사도 : %.1f %%", imageSim), bodyFont));
            document.add(createBarChart(imageSim)); 
            
            // (5) 푸터
            document.add(new Paragraph("\n\n\n\n"));
            document.add(new LineSeparator(0.5f, 100, Color.LIGHT_GRAY, Element.ALIGN_CENTER, -2));
            Paragraph footer = new Paragraph("\n* 본 리포트는 AI 분석 모델(Royalty-V1)의 예측 결과이며 법적 효력은 없습니다. \n정확한 등록 가능성 판단은 변리사와 상담하시기 바랍니다.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();

        } catch (DocumentException | IOException e) {
            throw new RuntimeException("PDF 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 막대 그래프 생성 (유지)
    private PdfPTable createBarChart(float percentage) throws DocumentException {
        if (percentage > 100) percentage = 100;
        
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
}