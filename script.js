(function () {
    const inputText = document.getElementById('inputText');
    const charCounter = document.getElementById('charCounter');
    const rephraseBtn = document.getElementById('rephraseBtn');
    const outputText = document.getElementById('outputText');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const langSelect = document.getElementById('languageSelect');
    const intensityPicker = document.getElementById('intensityPicker');
    const tooltip = document.getElementById('sliderTooltip');

    let energy = localStorage.getItem('magic_energy') || 400;
    let history = JSON.parse(localStorage.getItem('magic_history')) || [];

    const translations = {
        en: {
            title: "AI Magic Rephrase ✨",
            subtitle: "Transform your writing with AI magic",
            res_placeholder: "Result will appear here...",
            btn_rephrase: "Rephrase It! 🚀",
            energy: "energy left",
            history_title: "Recent Magic ✨",
            tips: { "1": "Chill", "2": "Balanced", "3": "God Mode" }
        },
        ru: {
            title: "AI Магия Текста ✨",
            subtitle: "Преврати свои мысли в шедевр",
            res_placeholder: "Результат появится здесь...",
            btn_rephrase: "Перефразировать! 🚀",
            energy: "энергии осталось",
            history_title: "Недавняя магия ✨",
            tips: { "1": "Спокойно", "2": "Сбалансированно", "3": "На всю мощь" }
        }
    };

    function updateUI() {
        const lang = langSelect.value;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        outputText.placeholder = translations[lang].res_placeholder;
        document.getElementById('tokenCount').textContent = `${energy} ${translations[lang].energy}`;
        renderHistory();
    }

    // Тултипы Magic Level
    intensityPicker.addEventListener('mousemove', (e) => {
        const btn = e.target.closest('.segment');
        if (btn) {
            const lang = langSelect.value;
            tooltip.textContent = translations[lang].tips[btn.dataset.value];
            tooltip.style.opacity = '1';
            tooltip.style.left = (e.clientX + 15) + 'px';
            tooltip.style.top = (e.clientY - 30) + 'px';
        }
    });

    intensityPicker.addEventListener('mouseleave', () => tooltip.style.opacity = '0');

    intensityPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment');
        if (!btn) return;
        document.querySelectorAll('.segment').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('intensity').value = btn.dataset.value;
    });

    // Очистка (Только левое поле!)
    clearBtn.addEventListener('click', () => {
        inputText.value = "";
        charCounter.textContent = "0 / 5000";
        inputText.focus();
    });

    // Логика перефраза
    async function startRephrasing() {
        const text = inputText.value.trim();
        if (!text || energy < 100) return;

        loader.classList.remove('hidden');
        rephraseBtn.disabled = true;

        try {
            const response = await fetch('https://ai-rephraser-api.onrender.com/rephrase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    style: document.getElementById('modeSelect').value,
                    language: langSelect.value,
                    intensity: document.getElementById('intensity').value
                })
            });
            const data = await response.json();
            
            if (data.result) {
                outputText.textContent = data.result;
                outputText.classList.remove('output-placeholder');
                energy -= 100;
                localStorage.setItem('magic_energy', energy);
                saveToHistory(data.result);
                updateUI();
            }
        } catch (e) {
            console.error(e);
        } finally {
            loader.classList.add('hidden');
            rephraseBtn.disabled = false;
        }
    }

    function saveToHistory(res) {
        history.unshift(res);
        if (history.length > 3) history.pop();
        localStorage.setItem('magic_history', JSON.stringify(history));
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = history.map(h => `<div class="history-item">${h.substring(0, 60)}...</div>`).join('');
    }

    rephraseBtn.addEventListener('click', startRephrasing);
    langSelect.addEventListener('change', updateUI);
    
    copyBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        if (!text || text.includes('...')) return;
        navigator.clipboard.writeText(text).then(() => {
            copyBtn.classList.add('success');
            setTimeout(() => copyBtn.classList.remove('success'), 2000);
        });
    });

    updateUI();
})();
