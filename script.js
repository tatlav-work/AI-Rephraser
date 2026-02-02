(function () {
    const inputText = document.getElementById('inputText');
    const charCounter = document.getElementById('charCounter');
    const limitAlert = document.getElementById('limitAlert');
    const rephraseBtn = document.getElementById('rephraseBtn');
    const outputText = document.getElementById('outputText');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    const intensityPicker = document.getElementById('intensityPicker');
    const intensityHiddenInput = document.getElementById('intensity');
    const tooltip = document.getElementById('sliderTooltip');

    const tips = {
        "1": "Минимальный перефраз",
        "2": "Сбалансированный перефраз",
        "3": "Творческий перефраз"
    };

    async function startRephrasing() {
        const text = inputText.value.trim();
        if (!text || rephraseBtn.disabled) return;

        const payload = {
            text: text,
            style: document.getElementById('modeSelect').value,
            language: document.getElementById('languageSelect').value,
            intensity: intensityHiddenInput.value
        };

        loader.classList.remove('hidden');
        rephraseBtn.disabled = true;

        try {
            const response = await fetch('https://ai-rephraser-api.onrender.com/rephrase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.result) {
                outputText.textContent = data.result;
            } else {
                throw new Error(data.error || "Ошибка обработки");
            }
        } catch (error) {
            outputText.textContent = "Сервер недоступен. Запустите app.py или проверьте подключение.";
        } finally {
            loader.classList.add('hidden');
            rephraseBtn.disabled = false;
        }
    }

    // Обработка ввода и счетчик символов
    inputText.addEventListener('input', () => {
        let count = inputText.value.length;
        charCounter.textContent = `${count} / 5000`;
        
        if (outputText.textContent !== "Результат появится здесь...") {
            outputText.textContent = "Результат появится здесь...";
        }

        if (count >= 5000) {
            charCounter.classList.add('warning');
            limitAlert.classList.remove('hidden');
        } else {
            charCounter.classList.remove('warning');
            limitAlert.classList.add('hidden');
        }
    });

    // Обработка горячих клавиш (Enter)
    inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            startRephrasing();
        }
    });

    rephraseBtn.addEventListener('click', startRephrasing);

    clearBtn.addEventListener('click', () => {
        inputText.value = "";
        charCounter.textContent = "0 / 5000";
        outputText.textContent = "Результат появится здесь...";
        inputText.focus();
    });

    copyBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        if (!text || text === "Результат появится здесь...") return;
        
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.classList.add('success');
            setTimeout(() => copyBtn.classList.remove('success'), 1500);
        });
    });

    // Управление интенсивностью
    intensityPicker.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
        const btn = e.target.closest('.segment');
        if (btn) tooltip.textContent = tips[btn.dataset.value];
    });

    intensityPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment');
        if (!btn) return;
        document.querySelectorAll('.segment').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        intensityHiddenInput.value = btn.dataset.value;
    });
})();


