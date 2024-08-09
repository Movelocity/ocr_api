from PIL import Image
from ocr_utils import OCR

ocr = OCR()

port = 8089
print(f"Service launching at 0.0.0.0:{port}")
print(f"open http://localhost:{port}")

from fastapi import FastAPI
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from io import BytesIO
app = FastAPI()
# Mount a static folder

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # 测试期间允许所有来源访问，部署时需注意替换成盖亚系统的 url
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def read_main():
    return {"message": "This is your main app"}

app.mount("/html", StaticFiles(directory="html"), name="static")

@app.post("/api/ocr")
async def invoke_ocr(
    image: UploadFile = File(...),
    join_str: str = Form(' '),
    pad_ratio: str = Form('0.3'),
):
    image_buffer = await image.read()
    pil_img = Image.open(BytesIO(image_buffer))  # 使用 BytesIO 将字节数据转化成为文件对象
    result_texts = ocr(pil_img, join=True, join_str=join_str.replace('\\n', '\n'), pad_ratio=eval(pad_ratio), check_table=False, input_type='pil')
    return {'result': result_texts[0]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="error")
