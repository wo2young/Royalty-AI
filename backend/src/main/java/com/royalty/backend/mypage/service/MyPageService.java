package com.royalty.backend.mypage.service;

// 1. 자바 표준 라이브러리
import java.awt.Color; 
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;   
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

// 2. 스프링 프레임워크
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

// 3. PDF 라이브러리 (OpenPDF/Lowagie)
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

// 4. 프로젝트 내부 클래스 (DTO, Mapper)
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

    // 파일 저장 경로 (application.yml에서 설정 가능, 여기선 하드코딩 예시)
    private static final String UPLOAD_DIR = "C:/uploads/logos/";

    // ==========================================
    // 1. 🏠 대시보드 (Dashboard)
    // ==========================================
    @Transactional(readOnly = true)
    public MyPageDashboardDTO getDashboard(Long userId) {
        MyPageDashboardDTO dashboard = new MyPageDashboardDTO();
        dashboard.setUserId(userId);

        // 1. 내 브랜드 요약 (전체 가져와서 상위 3개만 자르기)
        List<BrandDTO> brands = myPageMapper.selectMyBrands(userId);
        dashboard.setTotalBrands(brands.size());
        dashboard.setRecentBrands(brands.stream().limit(3).collect(Collectors.toList()));

        // 2. 내 북마크 요약 (전체 가져와서 상위 3개만 자르기)
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

    // 상세 조회 (기본정보 + 히스토리 + 리포트 결합)
    @Transactional(readOnly = true)
    public BrandDetailDTO getBrandDetail(Long userId, Long brandId) {
        // 1. 기본 정보 조회
        BrandDetailDTO detail = myPageMapper.selectBrandDetail(userId, brandId);
        if (detail == null) {
            throw new IllegalArgumentException("존재하지 않거나 권한이 없는 브랜드입니다.");
        }

        // 2. 히스토리 리스트 조회 & 주입
        List<BrandHistoryDTO> histories = myPageMapper.selectBrandHistory(brandId);
        detail.setHistoryList(histories);

        // 3. 리포트 리스트 조회 & 주입
        List<ReportDTO> reports = myPageMapper.selectBrandReports(brandId);
        detail.setReportList(reports);

        return detail;
    }

    // 브랜드 등록 (이미지 업로드 -> DB 저장)
    @Transactional
    public void createBrand(Long userId, String brandName, String category, String description, MultipartFile logoImage) {
        
        // 1. 이미지 파일 업로드 (로컬 저장 후 경로 반환)
        String imagePath = uploadFile(logoImage);

        // 2. 브랜드 정보 저장 (BrandDTO 생성)
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setUserId(userId);
        brandDTO.setBrandName(brandName);
        brandDTO.setCategory(category);
        brandDTO.setDescription(description); // DTO에 description 필드 있어야 함

        // Mapper 호출 (MyBatis가 실행 후 brandDTO.setBrandId()를 자동으로 수행)
        myPageMapper.insertBrand(brandDTO);

        // 3. 로고 테이블 저장 (생성된 brandId 사용)
        if (brandDTO.getBrandId() != null) {
            myPageMapper.insertBrandLogo(brandDTO.getBrandId(), imagePath);
        } else {
            throw new RuntimeException("브랜드 등록 실패: ID 생성 오류");
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
    // 🛠️ 내부 유틸 메서드 (파일 업로드)
    // ==========================================
    private String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 필요합니다.");
        }

        try {
            // 파일명 중복 방지 (UUID 사용)
            String originalFilename = file.getOriginalFilename();
            String storeFileName = UUID.randomUUID() + "_" + originalFilename;
            
            // 실제 저장 경로 생성 (없으면 폴더 생성)
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일 저장
            String fullPath = UPLOAD_DIR + storeFileName;
            file.transferTo(new File(fullPath));

            // DB에 저장할 경로 (웹 접근용 상대 경로 or 절대 경로)
            // 여기서는 절대경로를 그대로 리턴하거나, 웹 서빙용 경로로 변환해야 합니다.
            return fullPath; 

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            throw new RuntimeException("이미지 저장 중 오류가 발생했습니다.");
        }
    }
    
    // ==========================================
    // 4. 📄 상표 분석 리포트 PDF 생성 (최종 수정본)
    // ==========================================
    @Transactional(readOnly = true)
    public byte[] generateBrandReport(Long userId, Long brandId) {
        
        // 1. 데이터 조회
        BrandDetailDTO brand = getBrandDetail(userId, brandId);
        
        // 방어 로직: 분석 이력이 없으면 생성 불가
        if (brand.getHistoryList() == null || brand.getHistoryList().isEmpty()) {
            throw new IllegalStateException("분석 데이터가 존재하지 않습니다.");
        }

        // 최신 분석 결과 가져오기
        BrandHistoryDTO analysis = brand.getHistoryList().get(0);
        
        // [중요] Null 방지 및 값 추출 (DTO가 Float이므로 null일 수 있음 -> 0f로 변환)
        float imageSim = (analysis.getImageSimilarity() != null) ? analysis.getImageSimilarity() : 0f;
        float textSim = (analysis.getTextSimilarity() != null) ? analysis.getTextSimilarity() : 0f;
        
        // 2. 점수 및 등급 계산
        double maxSim = Math.max(imageSim, textSim);
        int probability = (int) (100 - maxSim); // 등록 가능성
        
        String grade;
        Color gradeColor;
        String comment;

        if (probability >= 80) {
            grade = "A (매우 안전)";
            gradeColor = new Color(0, 100, 255); // 진한 파랑
            comment = "기존 상표와 유사도가 매우 낮습니다. 등록 가능성이 아주 높습니다.";
        } else if (probability >= 50) {
            grade = "B (보통)";
            gradeColor = new Color(255, 140, 0); // 주황
            comment = "일부 유사한 요소가 발견되었습니다. 전문가의 검토를 권장합니다.";
        } else {
            grade = "C (위험)";
            gradeColor = new Color(220, 0, 0); // 빨강
            comment = "등록된 상표와 매우 유사합니다. 상표 출원 시 거절될 위험이 큽니다.";
        }

        // 3. PDF 생성 시작
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50); // 여백 설정
            PdfWriter.getInstance(document, out);
            document.open();

            // -------------------------------------------------------
            // [폰트 설정] Windows 기본 '맑은 고딕' 사용
            // -------------------------------------------------------
            String fontPath = new ClassPathResource("fonts/malgun.ttf").getURL().toString();
            BaseFont bf = BaseFont.createFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            
            Font titleFont = new Font(bf, 22, Font.BOLD);
            Font headerFont = new Font(bf, 12, Font.BOLD, Color.DARK_GRAY);
            Font bodyFont = new Font(bf, 10, Font.NORMAL);
            Font scoreFont = new Font(bf, 18, Font.BOLD, gradeColor);
            Font footerFont = new Font(bf, 9, Font.NORMAL, Color.GRAY);

            // (1) 헤더 (문서 제목)
            Paragraph title = new Paragraph("ROYALTY AI 상표 분석 리포트", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);
            
            Paragraph dateP = new Paragraph("발행일자: " + new SimpleDateFormat("yyyy년 MM월 dd일").format(new Date()), bodyFont);
            dateP.setAlignment(Element.ALIGN_RIGHT);
            dateP.setSpacingAfter(30);
            document.add(dateP);

            // (2) 분석 대상 (이미지 포함)
            document.add(new Paragraph("1. 분석 대상 정보", headerFont));
            document.add(new LineSeparator()); // 가로선
            
            PdfPTable infoTable = new PdfPTable(2); // 2열 테이블
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1, 2}); // 이미지(1) : 텍스트(2) 비율
            infoTable.setSpacingBefore(10);
            infoTable.setSpacingAfter(30);

            // [좌측] 로고 이미지 삽입
            PdfPCell imageCell = new PdfPCell();
            imageCell.setBorder(Rectangle.NO_BORDER);
            try {
                // DB에 있는 경로(URL 또는 로컬경로)로 이미지 로드
                if (brand.getCurrentLogoPath() != null) {
                    Image logo = Image.getInstance(brand.getCurrentLogoPath());
                    logo.scaleToFit(120, 120); // 크기 조절
                    imageCell.addElement(logo);
                } else {
                    imageCell.addElement(new Paragraph("(이미지 없음)", bodyFont));
                }
            } catch (Exception e) {
                // 이미지를 못 불러와도 리포트는 나와야 함
                imageCell.addElement(new Paragraph("[이미지 로드 실패]", bodyFont));
            }
            infoTable.addCell(imageCell);

            // [우측] 텍스트 정보
            PdfPCell textCell = new PdfPCell();
            textCell.setBorder(Rectangle.NO_BORDER);
            textCell.addElement(new Paragraph("• 상표명 : " + (brand.getBrandName() != null ? brand.getBrandName() : "(로고 전용)"), bodyFont));
            textCell.addElement(new Paragraph("• 분류 : " + brand.getCategory(), bodyFont));
            textCell.addElement(new Paragraph("• 요청자 ID : " + userId, bodyFont));
            infoTable.addCell(textCell);

            document.add(infoTable);


            // (3) 종합 진단 결과 (박스 디자인)
            document.add(new Paragraph("2. AI 종합 진단", headerFont));
            document.add(new LineSeparator());
            
            PdfPTable resultTable = new PdfPTable(1);
            resultTable.setWidthPercentage(100);
            resultTable.setSpacingBefore(10);
            resultTable.setSpacingAfter(30);
            
            PdfPCell resultCell = new PdfPCell();
            resultCell.setBackgroundColor(new Color(245, 245, 245)); // 연한 회색 배경
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


            // (4) 상세 분석 (막대 그래프 차트 구현)
            document.add(new Paragraph("3. 상세 유사도 분석 (낮을수록 좋습니다)", headerFont));
            document.add(new Paragraph("\n"));

            // [차트 1] 텍스트 유사도
            document.add(new Paragraph(String.format("• 텍스트 유사도 : %.1f %%", textSim), bodyFont));
            document.add(createBarChart(textSim)); // 안전하게 변환된 float 값 전달
            document.add(new Paragraph("\n"));

            // [차트 2] 이미지 유사도
            document.add(new Paragraph(String.format("• 이미지 유사도 : %.1f %%", imageSim), bodyFont));
            document.add(createBarChart(imageSim)); 
            
            // (5) 하단 면책 조항
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

    // 📊 [Helper] 막대 그래프 생성 메서드 (테이블 셀 배경색 이용)
    private PdfPTable createBarChart(float percentage) throws DocumentException {
        // 최대 100% 기준
        if (percentage > 100) percentage = 100;
        
        PdfPTable table = new PdfPTable(2); // 2칸짜리 테이블 (채워진 부분 / 빈 부분)
        table.setWidthPercentage(80); // 전체 너비의 80%만 사용
        table.setHorizontalAlignment(Element.ALIGN_LEFT);
        
        // 막대 색상 결정 (위험할수록 빨간색)
        Color barColor;
        if (percentage >= 50) barColor = new Color(220, 50, 50); // 빨강 (위험)
        else if (percentage >= 30) barColor = new Color(255, 165, 0); // 주황 (주의)
        else barColor = new Color(50, 180, 50); // 초록 (안전)

        // 1. 채워진 부분 (유사도 %)
        PdfPCell cell1 = new PdfPCell(new Phrase(""));
        cell1.setBackgroundColor(barColor);
        cell1.setBorder(Rectangle.NO_BORDER);
        cell1.setFixedHeight(10); // 막대 두께
        
        // 2. 빈 부분 (나머지 %)
        PdfPCell cell2 = new PdfPCell(new Phrase(""));
        cell2.setBackgroundColor(Color.LIGHT_GRAY);
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setFixedHeight(10);

        // 비율 설정 (유사도가 0이면 에러나므로 최소 1% 보장)
        float width1 = (percentage < 1) ? 1 : percentage;
        float width2 = 100 - width1;
        
        table.setWidths(new float[]{width1, width2});
        
        table.addCell(cell1);
        table.addCell(cell2);
        
        return table;
    }
}