import sys
from pathlib import Path
import json

sys.path.append(str(Path(__file__).resolve().parent.parent))
from rag.llm import generate_answer


system_prompt = """
You are a helpful interview preparation assistant.
Answer clearly and concisely.
"""


question = """
Explain what a binary search tree is in simple terms.
"""


answer = generate_answer(
    system_prompt,
    question
)


print("\n================ GEMINI RESPONSE ================\n")
print(answer)