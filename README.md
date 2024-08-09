# ocr_api
make use of ocr tools with fastapi

## Requirements
```
rapidocr_onnxruntime
fastapi
numpy
pillow
```

## Usage
```bash
python api.py
```

```bash
curl -X POST "http://localhost:8089/api/ocr" \
     -F "image=@/path/to/your/image.jpg" \
     -F "join_str= " \
     -F "pad_ratio=0.3"
```

or visit `http://localhost:8089/html/index.html`