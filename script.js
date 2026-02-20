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

    // Словарь локализации для мультиязычного интерфейса
    const translations = {
        en: {
            title: "AI Magic Rephrase ✨",
            subtitle: "Transform your writing with AI magic",
            label_input: "Your Text",
            label_output: "Magic Result ✨",
            btn_rephrase: "Rephrase It! 🚀",
            tokens_label: "Tokens left:",
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
            tokens_label: "Токенов осталось:",
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
        "1": { en: "Chill ✨", ru: "Спокойный ✨" },
    "2": { en: "Creative 🎨", ru: "Творческий 🎨" },
    "3": { en: "Wild 🔥", ru: "Дикий 🔥" }
    };

    // Логика управления лимитами (токены)
    let tokens = 400;

    function updateTokens() {
        if (tokens <= 0) {
            alert("Out of tokens! 😱\nPlease upgrade to PRO version to continue using our Magic Rephraser.");
            window.location.href = "#"; 
            return false;
        }
        tokens -= 100;
        tokenDisplay.textContent = tokens;
        return true;
    }

    // Основная функция запроса к API
    async function startRephrasing() {
        const text = inputText.value.trim();
        const currentLang = document.getElementById('languageSelect').value;

        if (!text || rephraseBtn.disabled) return;
        
        if (!updateTokens()) return;

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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.result) {
                outputText.textContent = data.result;
            } else {
                throw new Error("Empty response from server");
            }
        } catch (error) {
            console.error("Error details:", error);
            outputText.textContent = (currentLang === 'ru' ? "Ошибка: " : "Error: ") + error.message;
        } finally {
            loader.classList.add('hidden');
            rephraseBtn.disabled = false;
        }
    }

    // Обработчик смены языка интерфейса
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        
        inputText.placeholder = lang === 'ru' ? 'Введите текст...' : 'Type or paste your text here...';
        if (outputText.textContent.includes("Результат") || outputText.textContent.includes("Result")) {
            outputText.textContent = translations[lang].res_placeholder;
        }
    });

    // Мониторинг ввода текста
    inputText.addEventListener('input', () => {
        let count = inputText.value.length;
        charCounter.textContent = `${count} / 5000`;
        
        if (count >= 5000) {
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

    // Очистка поля ввода
    clearBtn.addEventListener('click', () => {
        inputText.value = "";
        charCounter.textContent = "0 / 5000";
        inputText.focus();
    });

    // Копирование в буфер обмена с обратной связью
    copyBtn.addEventListener('click', () => {
        const text = outputText.textContent;
        const lang = document.getElementById('languageSelect').value;
        const placeholder = translations[lang].res_placeholder;

        if (!text || text === placeholder) return;
        
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

    // Управление Magic Level и тултипом
const magicTooltip = document.getElementById('magic-tooltip');
const magicSegments = document.querySelectorAll('.segment');

magicSegments.forEach(segment => {
    segment.addEventListener('mouseenter', () => {
        const level = segment.getAttribute('data-level');
        const currentLang = document.getElementById('languageSelect').value || 'en';
        
        // Берем текст из нашего объекта tips
        magicTooltip.textContent = tips[level][currentLang];
        magicTooltip.classList.add('visible');

        // ВАЖНО: Прячем стандартный тултип, чтобы не было как на скрине
        segment.setAttribute('data-old-title', segment.title);
        segment.title = ''; 
    });

    segment.addEventListener('mousemove', (e) => {
        // Тултип плавно летает за мышкой
        magicTooltip.style.left = (e.clientX + 15) + 'px';
        magicTooltip.style.top = (e.clientY + 15) + 'px';
    });

    segment.addEventListener('mouseleave', () => {
        magicTooltip.classList.remove('visible');
        // Возвращаем title обратно для порядка
        segment.title = segment.getAttribute('data-old-title');
    });
});


