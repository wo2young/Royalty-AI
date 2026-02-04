import boto3
import os
from botocore.exceptions import NoCredentialsError
from datetime import datetime
import uuid

class S3Uploader:
    def __init__(self):
        # 환경변수에서 키를 가져옵니다 (보안 필수!)
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("AWS_BUCKET_NAME")
        self.region = os.getenv("AWS_REGION", "ap-northeast-2")

        self.s3 = boto3.client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region
        )

    def upload_bytes(self, file_bytes, original_filename, folder="ai_generated"):
        """
        바이트 데이터를 받아서 S3에 업로드하고 URL을 반환하는 함수
        """
        try:
            # 1. 파일명 중복 방지 (UUID 사용)
            ext = original_filename.split('.')[-1]
            unique_name = f"{uuid.uuid4()}.{ext}"
            s3_path = f"{folder}/{unique_name}"

            # 2. S3 업로드 (Content-Type 설정 중요)
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=s3_path,
                Body=file_bytes,
                ContentType=f"image/{ext}" # 브라우저에서 바로 보이게 설정
                # ACL='public-read' # 버킷 정책에 따라 필요할 수도 있음
            )

            # 3. URL 생성
            url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{s3_path}"
            return url

        except NoCredentialsError:
            print("❌ AWS 자격 증명(Credentials)이 없습니다.")
            return None
        except Exception as e:
            print(f"❌ S3 업로드 실패: {e}")
            return None

# 전역 인스턴스 (필요한 곳에서 import해서 사용)
s3_loader = S3Uploader()