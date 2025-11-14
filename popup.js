// ============================================
// AUTO FILL QUIZ - EXTENSION OPTIMIZED
// ============================================

// Hiển thị trạng thái
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Hàm autofill - inject vào trang
function autofillQuiz(answersInput) {
    const ANSWER_MAP = {
        'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5,
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
    };

    function waitForRadios(maxAttempts = 30, interval = 500) {
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            const radios = document.querySelectorAll('input[type="radio"]');
            
            console.log(`[Auto Fill] Lần ${attempts}/${maxAttempts}: ${radios.length} radios`);
            
            if (radios.length > 0) {
                clearInterval(checkInterval);
                processAnswers(radios);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                showAlert('❌ Không tìm thấy câu hỏi!\n\nĐảm bảo trang đã load xong.');
            }
        }, interval);
    }

    function processAnswers(allRadios) {
        console.log(`[Auto Fill] Xử lý ${allRadios.length} radio buttons`);
        
        const answers = answersInput.split(',').map(a => a.trim().toUpperCase());
        
        // Group theo name
        const grouped = {};
        allRadios.forEach(radio => {
            const key = radio.name || radio.id || 'unknown';
            (grouped[key] = grouped[key] || []).push(radio);
        });

        const questions = Object.values(grouped);
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

            const pos = ANSWER_MAP[answer];
            if (pos === undefined || pos >= options.length) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án không hợp lệ`);
                fail++;
                return;
            }

            try {
                const radio = options[pos];
                radio.click();
                radio.checked = true;
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Highlight
                const parent = radio.closest('label, .option, div, li');
                if (parent) {
                    Object.assign(parent.style, {
                        backgroundColor: '#d4edda',
                        border: '2px solid #28a745',
                        transition: 'all 0.3s'
                    });
                }

                success++;
                console.log(`[Auto Fill] ✓ Câu ${idx + 1}: ${answer}`);
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
    console.log('[Auto Fill] Started');
    const radios = document.querySelectorAll('input[type="radio"]');
    
    if (radios.length > 0) {
        console.log(`[Auto Fill] Found ${radios.length} radios immediately`);
        processAnswers(radios);
    } else {
        console.log('[Auto Fill] Waiting for radios...');
        waitForRadios();
    }
}

// Main logic
document.addEventListener('DOMContentLoaded', () => {
    const answersInput = document.getElementById('answers');
    const openIframeBtn = document.getElementById('openIframeBtn');
    const fillBtn = document.getElementById('fillBtn');
    
    // Load saved answers
    chrome.storage.local.get(['lastAnswers'], (result) => {
        if (result.lastAnswers) {
            answersInput.value = result.lastAnswers;
        }
    });
    
    answersInput.focus();
    answersInput.select();
    
    // Open iframe button
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
    
    // Fill answers button
    fillBtn.addEventListener('click', async () => {
        const answers = answersInput.value.trim();

        if (!answers) {
            showStatus('❌ Vui lòng nhập đáp án!', 'error');
            answersInput.focus();
            return;
        }

        try {
            // Save answers
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
    
    // Keyboard shortcuts
    answersInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                e.preventDefault();
                fillBtn.click();
            }
        }
    });
    
    // Auto-fill on paste
    answersInput.addEventListener('paste', () => {
        setTimeout(() => {
            if (answersInput.value.trim()) {
                fillBtn.focus();
            }
        }, 100);
    });
});
