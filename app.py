import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

# Используем ключ из переменных окружения или напрямую (для локального теста)
API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=API_KEY)

@app.route('/rephrase', methods=['POST'])
def rephrase():
    try:
        data = request.json
        user_text = data.get('text', '')
        style = data.get('style', 'professional')
        language = data.get('language', 'ru')
        intensity = data.get('intensity', '1')

        prompt = (
            f"Role: Professional Editor. Task: Rephrase text.\n"
            f"Style: {style}. Language: {language}. Intensity: {intensity}/3.\n"
            f"Rules: Return ONLY the corrected text without any explanations or quotes."
        )

        response = client.chat.completions.create(
            odel="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_text}
            ],
            temperature=0.6,
        )

        return jsonify({"result": response.choices[0].message.content.strip()})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":

    app.run(host='0.0.0.0', port=5000)

