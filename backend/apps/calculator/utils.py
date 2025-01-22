# import torch
# from transformers import pipeline, BitsAndBytesConfig, AutoProcessor, LlavaForConditionalGeneration
# from PIL import Image

# # quantization_config = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.float16)
# quantization_config = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_compute_dtype=torch.float16
# )


# model_id = "llava-hf/llava-1.5-7b-hf"
# processor = AutoProcessor.from_pretrained(model_id)
# model = LlavaForConditionalGeneration.from_pretrained(model_id, quantization_config=quantization_config, device_map="auto")
# # pipe = pipeline("image-to-text", model=model_id, model_kwargs={"quantization_config": quantization_config})

# def analyze_image(image: Image):
#     prompt = "USER: <image>\nAnalyze the equation or expression in this image, and return answer in format: {expr: given equation in LaTeX format, result: calculated answer}"

#     inputs = processor(prompt, images=[image], padding=True, return_tensors="pt").to("cuda")
#     for k, v in inputs.items():
#         print(k,v.shape)

#     output = model.generate(**inputs, max_new_tokens=20)
#     generated_text = processor.batch_decode(output, skip_special_tokens=True)
#     for text in generated_text:
#         print(text.split("ASSISTANT:")[-1])

import google.generativeai as genai
import ast
import json
import re
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def clean_response(text: str) -> str:
    # Remove code block identifiers and markers
    text = re.sub(r'```\w*\n?', '', text)  # Removes ```python, ```json, etc.
    text = re.sub(r'```', '', text)
    # Remove any leading/trailing whitespace
    text = text.strip()
    return text

def analyze_image(img: Image, dict_of_vars: dict):
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. "
        f"IMPORTANT: You have access to previously defined variables in this dictionary: {dict_of_vars_str}. "
        f"ALWAYS check this dictionary first and use these values to solve expressions. "
        f"For example, if dict_of_vars is {{'x': 6}} and you see 'x^2', you should calculate 6^2 = 36. "
        f"Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). "
        f"Examples with variables: "
        f"1. If dict_of_vars = {{'x': 6}} and expression is 'x^2', return: [{{'expr': 'x^2', 'result': 36}}] "
        f"2. If dict_of_vars = {{'x': 2, 'y': 3}} and expression is 'x * y', return: [{{'expr': 'x * y', 'result': 6}}] "
        f"YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: "
        f"Following are the cases: "
        f"1. Simple mathematical expressions (including those with known variables): Return format: [{{'expr': 'expression', 'result': numerical_answer}}] "
        f"2. Set of Equations solving for variables: Return format: [{{'expr': 'variable', 'result': value, 'assign': true}}] "
        f"3. Assigning values to variables: Return format: [{{'expr': 'variable', 'result': value, 'assign': true}}] "
        f"4. Graphical Math problems: Return format: [{{'expr': 'problem description', 'result': 'numerical answer'}}] "
        f"5. Abstract Concepts: Return format: [{{'expr': 'drawing explanation', 'result': 'concept name'}}] "
        f"IMPORTANT RULES: "
        f"1. ALWAYS check dict_of_vars ({dict_of_vars_str}) first and use those values "
        f"2. For expressions with known variables, substitute and calculate the result "
        f"3. Return numerical results for expressions with known variables "
        f"4. NO markdown, NO code blocks, NO extra text "
        f"5. Use double quotes for strings "
        f"6. Numbers should not be quoted "
        f"7. Boolean values should be true or false (not quoted) "
        f"8. Return ONLY the array of dictionaries "
    )

    response = model.generate_content([prompt, img])
    print("Raw response:", response.text)

    try:
        # Clean the response first
        cleaned_text = clean_response(response.text)
        print("Cleaned response:", cleaned_text)

        # Try parsing methods in order
        try:
            # Method 1: Direct JSON parsing after converting single quotes to double
            cleaned_json = cleaned_text.replace("'", '"').replace("True", "true").replace("False", "false")
            answers = json.loads(cleaned_json)
        except json.JSONDecodeError:
            try:
                # Method 2: ast.literal_eval
                answers = ast.literal_eval(cleaned_text)
            except:
                # Method 3: More aggressive cleaning
                final_attempt = re.sub(r'[^\[\]{}"\',:0-9a-zA-Z\s+\-*/()=]', '', cleaned_text)
                answers = ast.literal_eval(final_attempt)

        # Ensure answers is a list
        if not isinstance(answers, list):
            answers = [answers]

        # Format and validate each answer
        formatted_answers = []
        for answer in answers:
            if isinstance(answer, dict):
                formatted_answer = {
                    'expr': str(answer.get('expr', '')),
                    'result': answer.get('result', ''),
                    'assign': bool(answer.get('assign', False))
                }
                formatted_answers.append(formatted_answer)

        print('Formatted answers:', formatted_answers)
        return formatted_answers

    except Exception as e:
        print(f"Error processing response: {e}")
        return []
