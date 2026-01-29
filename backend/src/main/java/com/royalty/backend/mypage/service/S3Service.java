package com.royalty.backend.mypage.service; // 👈 패키지명이 mypage로 변경됨

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    // 이미지 업로드하고 URL 반환
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String fileName = createFileName(file.getOriginalFilename());
        
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentLength(file.getSize());
        objectMetadata.setContentType(file.getContentType());

        try (InputStream inputStream = file.getInputStream()) {
            // S3 업로드 (읽기 권한 Public 설정)
            amazonS3.putObject(new PutObjectRequest(bucket, fileName, inputStream, objectMetadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));
            
            // 업로드된 URL 반환
            return amazonS3.getUrl(bucket, fileName).toString();
            
        } catch (IOException e) {
            log.error("S3 파일 업로드 실패", e);
            throw new RuntimeException("파일 업로드에 실패했습니다.");
        }
    }

    // 파일명 중복 방지 (UUID)
    private String createFileName(String originalFileName) {
        return UUID.randomUUID().toString().concat("_" + originalFileName);
    }
}