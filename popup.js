// ============================================
// AUTO FILL QUIZ - EXTENSION OPTIMIZED
// ============================================

// Global timeout variable
let statusTimeout;

// Hiển thị trạng thái
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type} show`;
    statusDiv.style.display = 'flex';

    if (statusTimeout) clearTimeout(statusTimeout);

    statusTimeout = setTimeout(() => {
        statusDiv.classList.remove('show');
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 400);
    }, 3000);
}

// Extract questions from page
function extractQuestions() {
    const questions = [];

    // Lấy tất cả inputs theo đúng thứ tự DOM
    const allInputs = Array.from(document.querySelectorAll('input')).filter(
        input => input.type === 'radio' || input.type === 'checkbox'
    );

    if (allInputs.length === 0) return [];

    // Group theo name
    const grouped = {};
    const firstAppearance = {};

    allInputs.forEach((input, index) => {
        const key = input.name || input.id || 'unknown';
        if (!grouped[key]) {
            grouped[key] = [];
            firstAppearance[key] = index;
        }
        grouped[key].push(input);
    });

    // Sắp xếp theo thứ tự xuất hiện
    const nameOrder = Object.keys(grouped).sort((a, b) => firstAppearance[a] - firstAppearance[b]);

    // Extract question text and options
    nameOrder.forEach((name, idx) => {
        const options = grouped[name];
        const firstInput = options[0];

        // Tìm câu hỏi (thường ở parent elements)
        let questionText = '';
        let parent = firstInput.closest('.question, .quiz-question, div, fieldset, form');

        if (parent) {
            // Lấy text của heading hoặc label
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, legend, .question-text, .quiz-title');
            if (heading) {
                questionText = heading.textContent.trim();
            } else {
                // Fallback: lấy text đầu tiên
                const textNodes = Array.from(parent.childNodes).filter(node =>
                    node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                );
                if (textNodes.length > 0) {
                    questionText = textNodes[0].textContent.trim();
                }
            }
        }

        // Lấy các options
        const optionTexts = options.map(opt => {
            const label = document.querySelector(`label[for="${opt.id}"]`) || opt.closest('label');
            return label ? label.textContent.trim() : opt.value;
        });

        questions.push({
            number: idx + 1,
            question: questionText || `Câu ${idx + 1}`,
            options: optionTexts,
            type: firstInput.type
        });
    });

    return questions;
}

// Call Gemini API (Preserved for future use)
async function callGeminiAPI(apiKey, questions) {
    console.log('[AI] === START callGeminiAPI ===');
    // ... logic hidden for manual mode ...
    // Returning dummy to prevent errors if ever called
    return null;
}

// Hàm autofill - inject vào trang
function autofillQuiz(answersInput) {
    const ANSWER_MAP = {
        'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    };

    function waitForInputs(maxAttempts = 10, interval = 500) {
        let attempts = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            // Lấy tất cả inputs theo đúng thứ tự DOM
            const allInputs = Array.from(document.querySelectorAll('input')).filter(
                input => input.type === 'radio' || input.type === 'checkbox'
            );

            const radios = allInputs.filter(i => i.type === 'radio');
            const checkboxes = allInputs.filter(i => i.type === 'checkbox');

            console.log(`[Auto Fill] Lần ${attempts}/${maxAttempts}: ${radios.length} radio, ${checkboxes.length} checkbox`);

            if (allInputs.length > 0) {
                clearInterval(checkInterval);
                processAnswers(allInputs);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                showAlert('❌ Không tìm thấy câu hỏi!\n\nĐảm bảo trang đã load xong.');
            }
        }, interval);
    }

    function processAnswers(allInputs) {
        const radios = allInputs.filter(i => i.type === 'radio');
        const checkboxes = allInputs.filter(i => i.type === 'checkbox');

        console.log(`[Auto Fill] Xử lý ${radios.length} radio, ${checkboxes.length} checkbox`);

        const answers = answersInput.split(',').map(a => a.trim().toUpperCase());

        // Group theo name và giữ thứ tự xuất hiện trong DOM
        const grouped = {};
        const firstAppearance = {}; // Lưu vị trí xuất hiện đầu tiên của mỗi name

        allInputs.forEach((input, index) => {
            const key = input.name || input.id || 'unknown';
            if (!grouped[key]) {
                grouped[key] = [];
                firstAppearance[key] = index; // Lưu vị trí đầu tiên
            }
            grouped[key].push(input);
        });

        // Sắp xếp theo thứ tự xuất hiện thực tế trong DOM
        const nameOrder = Object.keys(grouped).sort((a, b) => firstAppearance[a] - firstAppearance[b]);

        // Lấy câu hỏi theo đúng thứ tự xuất hiện
        const questions = nameOrder.map(name => grouped[name]);
        console.log(`[Auto Fill] ${questions.length} câu hỏi`);

        if (questions.length === 0) {
            showAlert('❌ Không thể phân tích câu hỏi!');
            return;
        }

        let success = 0, fail = 0;

        questions.forEach((options, idx) => {
            const answer = answers[idx];
            if (!answer) {
                fail++;
                return;
            }

            // Phân tích đáp án - có thể nhiều ký tự (AB, CD, 012...)
            const positions = [];
            for (let char of answer) {
                const pos = ANSWER_MAP[char];
                if (pos !== undefined && pos < options.length) {
                    positions.push(pos);
                }
            }

            if (positions.length === 0) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án không hợp lệ`);
                fail++;
                return;
            }

            const isCheckbox = options[0].type === 'checkbox';

            try {
                // Chỉ bỏ chọn tất cả nếu là radio VÀ chỉ chọn 1 đáp án
                if (!isCheckbox && positions.length === 1) {
                    options.forEach(opt => opt.checked = false);
                }

                // Chọn từng đáp án
                positions.forEach(pos => {
                    const input = options[pos];
                    input.click();
                    input.checked = true;
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    // Highlight
                    const parent = input.closest('label, .option, div, li');
                    if (parent) {
                        Object.assign(parent.style, {
                            backgroundColor: '#d4edda',
                            border: '2px solid #28a745',
                            transition: 'all 0.3s'
                        });
                    }
                });

                success++;
            } catch (e) {
                console.error(`[Auto Fill] ✗ Câu ${idx + 1}:`, e);
                fail++;
            }
        });

        showNotification(success, fail, questions.length);

        // Scroll to first question
        if (questions[0]?.[0]) {
            setTimeout(() => {
                questions[0][0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    function showNotification(success, fail, total) {
        const notif = document.createElement('div');
        notif.innerHTML = `
            <div style="position:fixed;top:20px;right:20px;z-index:999999;
                background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);
                color:white;padding:20px 30px;border-radius:12px;
                box-shadow:0 8px 32px rgba(0,0,0,0.3);font-family:Arial;
                animation:slideIn 0.3s ease-out">
                <div style="font-size:18px;font-weight:bold;margin-bottom:10px">
                    ${fail === 0 ? '✅ Hoàn thành!' : '⚠️ Hoàn thành một phần'}
                </div>
                <div style="font-size:14px">
                    ✓ Đã chọn: <strong>${success}</strong> câu<br>
                    ${fail > 0 ? `✗ Thất bại: <strong>${fail}</strong> câu<br>` : ''}
                    📝 Tổng: <strong>${total}</strong> câu
                </div>
            </div>
            <style>@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}</style>
        `;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.transition = 'opacity 0.5s';
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 500);
        }, 5000);
    }

    function showAlert(msg) {
        alert(msg);
    }

    // Start
    console.log('[Auto Fill] Started (Radio + Checkbox support)');

    // Lấy tất cả inputs theo đúng thứ tự DOM
    const allInputs = Array.from(document.querySelectorAll('input')).filter(
        input => input.type === 'radio' || input.type === 'checkbox'
    );

    if (allInputs.length > 0) {
        processAnswers(allInputs);
    } else {
        waitForInputs();
    }
}

// Main logic
document.addEventListener('DOMContentLoaded', () => {
    // Manual elements
    const answersInput = document.getElementById('answers');
    const openIframeBtn = document.getElementById('openIframeBtn');
    const fillBtn = document.getElementById('fillBtn');

    // Load saved data
    chrome.storage.local.get(['lastAnswers'], (result) => {
        if (result.lastAnswers) {
            answersInput.value = result.lastAnswers;
        }
    });

    if (answersInput) {
        answersInput.focus();
        answersInput.select();
    }

    // Open iframe button
    if (openIframeBtn) {
        openIframeBtn.addEventListener('click', async () => {
            try {
                showStatus('🔍 Đang tìm iframe...', 'info');

                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => document.querySelector('iframe')?.src || null
                });

                const iframeUrl = results[0].result;

                if (!iframeUrl) {
                    showStatus('❌ Không tìm thấy iframe!', 'error');
                    return;
                }

                await chrome.tabs.create({ url: iframeUrl, active: true });
                showStatus('✅ Đã mở iframe!', 'success');

                setTimeout(() => window.close(), 1000);

            } catch (error) {
                showStatus('❌ Lỗi: ' + error.message, 'error');
            }
        });
    }

    // Fill answers button
    if (fillBtn) {
        fillBtn.addEventListener('click', async () => {
            const answers = answersInput.value.trim();

            if (!answers) {
                showStatus('❌ Vui lòng nhập đáp án!', 'error');
                answersInput.focus();
                return;
            }

            try {
                await chrome.storage.local.set({ lastAnswers: answers });

                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: autofillQuiz,
                    args: [answers]
                });

                showStatus('✅ Đã điền đáp án!', 'success');
                setTimeout(() => window.close(), 1000);

            } catch (error) {
                showStatus('❌ Lỗi: ' + error.message, 'error');
            }
        });
    }

    // Keyboard shortcuts
    if (answersInput) {
        answersInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.ctrlKey) {
                    e.preventDefault();
                    if (fillBtn) fillBtn.click();
                }
            }
        });

        // Auto-fill on paste
        answersInput.addEventListener('paste', () => {
            setTimeout(() => {
                if (answersInput.value.trim() && fillBtn) {
                    // Just focus
                    fillBtn.focus();
                }
            }, 100);
        });
    }
});
