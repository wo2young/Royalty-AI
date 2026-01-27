from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from analyzer import BrandAnalyzer
from io import BytesIO
from PIL import Image
import uvicorn

app = FastAPI(title="Royalty AI Model Server")
analyzer = BrandAnalyzer()

# 텍스트 입력을 위한 규격 정의
class TextQuery(BaseModel):
    query: str

@app.get("/")
def health_check():
    return {"status": "online", "message": "Royalty AI Model Server is running"}

# 1. 텍스트 벡터화 API
@app.post("/api/v1/embed/text")
async def embed_text(data: TextQuery):
    # analyzer의 텍스트 벡터 추출 함수 호출
    vector = analyzer.get_text_vector(data.query)
    return {"vector": vector.tolist()}

# 2. 이미지 벡터화 API
@app.post("/api/v1/embed/image")
async def embed_image(file: UploadFile = File(...)):
    # 업로드된 파일을 이미지로 변환
    contents = await file.read()
    img = Image.open(BytesIO(contents)).convert('RGB')
    
    # analyzer의 이미지 벡터 추출 (어제 수정한 로직 활용)
    img_tensor = analyzer.img_transform(img).unsqueeze(0)
    import torch
    with torch.no_grad():
        img_vec = analyzer.img_model(img_tensor).flatten().numpy().tolist()
    
    return {"vector": img_vec}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)