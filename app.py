import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq

app = Flask(__name__)
CORS(app)

# Используем ключ из переменных окружения
API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=API_KEY)

@app.route('/rephrase', methods=['POST'])
def rephrase():
    try:
        data = request.json
        user_text = data.get('text', '')
        style = data.get('style', 'professional')
        language = data.get('language', 'en') # По умолчанию теперь English
        intensity = data.get('intensity', '1')

        # Улучшенный промпт для более точного следования выбранным настройкам
        prompt = (
            f"Role: Expert AI Writing Assistant.\n"
            f"Task: Rephrase the provided text using the following parameters:\n"
            f"1. Target Language: {language} (Response MUST be in this language).\n"
            f"2. Writing Style: {style}.\n"
            f"3. Creativity Level: {intensity} out of 3 (1 = literal rephrase, 3 = complete creative transformation).\n\n"
            f"Specific Instructions:\n"
            f"- If style is 'smm', incorporate appropriate emojis to increase engagement.\n"
            f"- If style is 'official', use formal vocabulary and complex sentence structures.\n"
            f"- If Creativity Level is 3, feel free to change the structure significantly while keeping the core meaning.\n"
            f"- Return ONLY the rephrased text. No explanations, no intros, no quotes."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_text}
            ],
            temperature=0.7, # Немного подняли температуру для большей "магии" на уровне 3
        )

        return jsonify({"result": response.choices[0].message.content.strip()})
    
    except Exception as e:
        print(f"Error occurred: {str(e)}") # Логируем ошибку для отладки
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Порт 5000 стандартный для Render
    app.run(host='0.0.0.0', port=5000)
