from openai import OpenAI
from config.settings import MODEL
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI()

def call_llm(system_prompt, user_input, temperature=0.3):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ],
        temperature=temperature
    )
    return response.choices[0].message.content