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
    const tokenDisplay = document.getElementById('tokenCount');

    // Локализация с системой Энергии
    const translations = {
        en: {
            title: "AI Magic Rephrase ✨",
            subtitle: "Transform your writing with AI magic",
            label_input: "Your Text",
            label_output: "Magic Result ✨",
            btn_rephrase: "Rephrase It! 🚀",
            energy_label: "Energy left:",
            energy_suffix: "energy",
            retries_suffix: "left",
            processing: "Processing...",
            limit_alert: "Character limit reached",
            label_model: "AI Model",
            label_lang: "Interface Language",
            label_style: "Style",
            creativity_title: "Creativity Level",
            opt_pro: "💼 Professional",
            opt_off: "👔 Official",
            opt_smm: "📱 Social Media",
            opt_cas: "😊 Casual",
            opt_kids: "👶 For Kids",
            opt_short: "⚡️ Shorten",
            res_placeholder: "Result will appear here...",
            copy_tooltip: "Copy result",
            copied: "Copied! ✅"
        },
        ru: {
            title: "AI Магия Перефраза ✨",
            subtitle: "Улучшите свой текст с помощью ИИ",
            label_input: "Ваш текст",
            label_output: "Магический результат ✨",
            btn_rephrase: "Перефразировать! 🚀",
            energy_label: "Энергии осталось:",
            energy_suffix: "энергии",
            retries_suffix: "осталось",
            processing: "Обработка...",
            limit_alert: "Лимит символов достигнут",
            label_model: "Модель ИИ",
            label_lang: "Язык интерфейса",
            label_style: "Стиль",
            creativity_title: "Креативность",
            opt_pro: "💼 Профессиональный",
            opt_off: "👔 Официальный",
            opt_smm: "📱 Соцсети",
            opt_cas: "😊 Повседневный",
            opt_kids: "👶 Для детей",
            opt_short: "⚡️ Сократить",
            res_placeholder: "Результат появится здесь...",
            copy_tooltip: "Скопировать результат",
            copied: "Скопировано! ✅"
        }
    };

    const tips = {
        "1": { en: "Minor edits", ru: "Минимальный перефраз" },
        "2": { en: "Balanced magic", ru: "Сбалансированный перефраз" },
        "3": { en: "Creative rewrite", ru: "Творческий перефраз" }
    };

    // Логика Energy (400 ед. = 4 попытки по 100)
    let energy = 400;

    function renderEnergy() {
        const lang = document.getElementById('languageSelect').value;
        const t = translations[lang];
        const attempts = Math.floor(energy / 100);
        tokenDisplay.innerHTML = `${energy} ${t.energy_suffix} <span style="opacity:0.6">(${attempts} ${t.retries_suffix})</span>`;
    }

    function updateEnergy() {
        if (energy <= 0) {
            const lang = document.getElementById('languageSelect').value;
            alert(lang === 'ru' ? "Энергия закончилась! 😱" : "Out of energy! 😱");
            return false;
        }
        energy -= 100;
        renderEnergy();
        return true;
    }

    async function startRephrasing() {
        const text = inputText.value.trim();
        const currentLang = document.getElementById('languageSelect').value;

        if (!text || rephraseBtn.disabled) return;
        if (!updateEnergy()) return;

        const payload = {
            text: text,
            style: document.getElementById('modeSelect').value,
            language: currentLang,
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

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const data = await response.json();
            if (data.result) {
                outputText.textContent = data.result;
            }
        } catch (error) {
            outputText.textContent = (currentLang === 'ru' ? "Ошибка: " : "Error: ") + error.message;
        } finally {
            loader.classList.add('hidden');
            rephraseBtn.disabled = false;
        }
    }

    // Смена языка
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) el.textContent = translations[lang][key];
        });
        
        inputText.placeholder = lang === 'ru' ? 'Введите текст...' : 'Type or paste your text here...';
        if (outputText.textContent.includes("Result") || outputText.textContent.includes("Результат")) {
            outputText.textContent = translations[lang].res_placeholder;
        }
        renderEnergy(); // Обновляем текст энергии при смене языка
    });

    inputText.addEventListener('input', () => {
        charCounter.textContent = `${inputText.value.length} / 5000`;
        if (inputText.value.length >= 5000) {
            charCounter.classList.add('warning');
            limitAlert.classList.remove('hidden');
        } else {
            charCounter.classList.remove('warning');
            limitAlert.classList.add('hidden');
        }
    });

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
        inputText.focus();
    });

    copyBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        const lang = document.getElementById('languageSelect').value;
        if (!text || text === translations[lang].res_placeholder) return;
        
        navigator.clipboard.writeText(text).then(() => {
            const originalTitle = copyBtn.title;
            copyBtn.title = translations[lang].copied;
            copyBtn.classList.add('success');
            setTimeout(() => {
                copyBtn.title = originalTitle;
                copyBtn.classList.remove('success');
            }, 2000);
        });
    });

    intensityPicker.addEventListener('mousemove', (e) => {
        const lang = document.getElementById('languageSelect').value;
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
        const btn = e.target.closest('.segment');
        if (btn) tooltip.textContent = tips[btn.dataset.value][lang];
    });

    intensityPicker.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment');
        if (!btn) return;
        document.querySelectorAll('.segment').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        intensityHiddenInput.value = btn.dataset.value;
    });

    // Инициализация энергии при загрузке
    renderEnergy();
})();
