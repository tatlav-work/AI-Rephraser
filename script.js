(function () {
    const inputText = document.getElementById('inputText');
    const charCounter = document.getElementById('charCounter');
    const limitAlert = document.getElementById('limitAlert');
    const rephraseBtn = document.getElementById('rephraseBtn');
    const outputText = document.getElementById('outputText');
    const loader = document.getElementById('loader');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const clearBtn = document.getElementById('clearBtn');
    const languageSelect = document.getElementById('languageSelect');
    
    const intensityPicker = document.getElementById('intensityPicker');
    const intensityHiddenInput = document.getElementById('intensity');
    const tooltip = document.getElementById('sliderTooltip');
    const tokenDisplay = document.getElementById('tokenCount');
    const historySelect = document.getElementById('historySelect');
    const customStyleRow = document.getElementById('customStyleRow');
    const customStyleInput = document.getElementById('customStyleInput');
    const tokenModal = document.getElementById('tokenModal');
    const tokenModalBtn = document.getElementById('tokenModalBtn');

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
        "1": { en: "Chill ✨", ru: "Лёгкий ✨" },
        "2": { en: "Creative 🎨", ru: "Творческий 🎨" },
        "3": { en: "Wild 🔥", ru: "Дикий 🔥" }
    };

    // Логика управления лимитами (токены)
    let tokens = 100;
    const TOKENS_PER_GEN = 10;
    const history = [];

    function updateTokenDisplay() {
        const lang = languageSelect.value;
        const gensLeft = Math.floor(tokens / TOKENS_PER_GEN);
        if (lang === 'ru') {
            tokenDisplay.textContent = `${tokens} (${gensLeft} генераций)`;
        } else {
            tokenDisplay.textContent = `${tokens} (${gensLeft} runs)`;
        }
    }

    function showTokenModal() {
        if (!tokenModal) return;
        tokenModal.classList.remove('hidden');
        rephraseBtn.disabled = true;
    }

    function updateTokens() {
        if (tokens < TOKENS_PER_GEN) {
            showTokenModal();
            return false;
        }
        tokens -= TOKENS_PER_GEN;
        updateTokenDisplay();
        return true;
    }

    function renderHistory() {
        if (!historySelect) return;
        const lang = languageSelect.value;
        historySelect.innerHTML = '';
        const baseOption = document.createElement('option');
        baseOption.value = '';
        baseOption.textContent = lang === 'ru' ? 'История пуста' : 'No history yet';
        historySelect.appendChild(baseOption);

        history.forEach((item, index) => {
            const opt = document.createElement('option');
            opt.value = String(index);
            const labelBase = lang === 'ru' ? 'Запрос' : 'Run';
            opt.textContent = `${labelBase} #${history.length - index}`;
            historySelect.appendChild(opt);
        });
    }

    // Основная функция запроса к API
    async function startRephrasing() {
        const text = inputText.value.trim();
        const currentLang = languageSelect.value;

        if (!text || rephraseBtn.disabled) return;
        
        if (!updateTokens()) return;

        const styleValue = document.getElementById('modeSelect').value;
        const payload = {
            text: text,
            style: styleValue,
            language: currentLang,
            intensity: intensityHiddenInput.value
        };

        if (styleValue === 'custom') {
            payload.customStyle = customStyleInput ? customStyleInput.value.trim() : '';
        }

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

                history.unshift({
                    input: text,
                    output: data.result,
                    style: styleValue,
                    lang: currentLang,
                    intensity: intensityHiddenInput.value
                });
                if (history.length > 20) history.pop();
                renderHistory();
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
    languageSelect.addEventListener('change', (e) => {
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

        updateTokenDisplay();
        renderHistory();
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

    // Копирование в буфер обмена с визуальным тултипом
    function handleCopyClick(event) {
        const btn = event.currentTarget;
        const text = outputText.textContent;
        const lang = languageSelect.value;
        const placeholder = translations[lang].res_placeholder;

        if (!text || text === placeholder) return;
        
        navigator.clipboard.writeText(text).then(() => {
            const tooltipEl = btn.querySelector('.copy-tooltip');
            btn.classList.add('success');
            if (tooltipEl) {
                tooltipEl.textContent = translations[lang].copied;
                btn.classList.add('show-tooltip');
            }

            setTimeout(() => {
                btn.classList.remove('success');
                btn.classList.remove('show-tooltip');
            }, 1600);
        });
    }

    copyButtons.forEach(btn => {
        btn.addEventListener('click', handleCopyClick);
    });

    // Управление уровнем креативности
    intensityPicker.addEventListener('mousemove', (e) => {
        const lang = languageSelect.value;
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

    if (historySelect) {
        historySelect.addEventListener('change', (e) => {
            const idx = e.target.value;
            if (idx === '') return;
            const item = history[Number(idx)];
            if (!item) return;
            outputText.textContent = item.output;
        });
    }

    document.getElementById('modeSelect').addEventListener('change', (e) => {
        const value = e.target.value;
        if (!customStyleRow) return;
        if (value === 'custom') {
            customStyleRow.classList.remove('hidden');
        } else {
            customStyleRow.classList.add('hidden');
        }
    });

    if (tokenModalBtn) {
        tokenModalBtn.addEventListener('click', () => {
            window.location.href = 'https://your-product.com/auth'; // TODO: заменить на реальный путь аутентификации/оплаты
        });
    }

    // Инициализация
    updateTokenDisplay();
    renderHistory();
})();
