from dotenv import load_dotenv
import os
load_dotenv()

SERVER_URL = os.getenv("SERVER_URL", "0.0.0.0")  # Default to 0.0.0.0 if not set
PORT = os.getenv("PORT", "8900")  # Ensure PORT is set correctly
ENV = os.getenv("ENV", "dev")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")