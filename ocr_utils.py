
from PIL import Image
import numpy as np 
from rapidocr_onnxruntime import RapidOCR

class OCR:
    def __init__(self):
        self.ocr = RapidOCR()
    
    def __call__(
        self, image, 
        join=False, 
        join_str:str="",
        pad_ratio:float=0,
        check_table=False, 
        input_type='filepath'
    ) -> list[str]:
        """ 
        font_mode = "standard" | "variant" | "none"
        input_type = "filepath" | "pil"
        """
        pad_ratio = np.clip(pad_ratio, 0, 1)
        if input_type == 'filepath':
            image = Image.open(image)
        
        img_width, img_height = image.size  # Get the image size in pixels
        if pad_ratio > 0:
            if image.mode != 'RGB':
                image = image.convert('RGB')
            shorter_edge = min(img_width, img_height)
            pad_size = int(shorter_edge * pad_ratio)
            # Padding the image
            new_width = img_width + 2 * pad_size
            new_height = img_height + 2 * pad_size
            new_image = Image.new("RGB", (new_width, new_height), 'white')  # Create new image with padding
            new_image.paste(image, (pad_size, pad_size, pad_size+img_width, pad_size+img_height))  # Paste the original image into centered
            image = new_image
            img_width, img_height = new_width, new_height

        # Calculate the figure size in inches
        result, _ = self.ocr(np.array(image))  # input: [str, np.ndarray, bytes, Path]
        
        texts = self.post_process(result, join, join_str)
        return texts

    def post_process(self, results, join=False, join_str:str="")->list[str]:
        texts = [item[1] for item in results]
        if join:
            return [join_str.join(texts)]
        else:
            return texts