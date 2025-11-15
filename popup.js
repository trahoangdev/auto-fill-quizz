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

    function waitForInputs(maxAttempts = 30, interval = 500) {
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
        
        // Debug: Kiểm tra thứ tự inputs
        console.log('\n[Auto Fill] === Thứ tự inputs trong allInputs ===');
        allInputs.forEach((input, idx) => {
            console.log(`[Auto Fill] ${idx}: name="${input.name}", type="${input.type}", value="${input.value}"`);
        });
        
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
        
        // Debug: Hiển thị thứ tự câu hỏi
        console.log('\n[Auto Fill] === Thứ tự câu hỏi ===');
        nameOrder.forEach((name, idx) => {
            const opts = grouped[name];
            const values = opts.map(o => o.value).join(',');
            console.log(`[Auto Fill] Câu ${idx + 1}: name="${name}", type="${opts[0].type}", options=${opts.length}, values=[${values}], firstIndex=${firstAppearance[name]}`);
        });
        
        console.log(`\n[Auto Fill] === Tổng kết ===`);
        console.log(`[Auto Fill] Tổng inputs: ${allInputs.length}`);
        console.log(`[Auto Fill] Tổng câu hỏi: ${questions.length}`);
        console.log(`[Auto Fill] Đáp án nhập: ${answers.length} (${answers.join(', ')})`);
        
        if (answers.length !== questions.length) {
            console.warn(`[Auto Fill] ⚠️ CẢNH BÁO: Số đáp án (${answers.length}) ≠ Số câu hỏi (${questions.length})`);
        }
        
        // Debug: Hiển thị thứ tự câu hỏi
        console.log('\n[Auto Fill] === Thứ tự câu hỏi ===');
        nameOrder.forEach((name, idx) => {
            const opts = grouped[name];
            console.log(`[Auto Fill] Câu ${idx + 1}: name="${name}", type="${opts[0].type}", options=${opts.length}`);
        });

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

            // Debug: Log thông tin câu hỏi
            console.log(`\n[Auto Fill] --- Câu ${idx + 1} ---`);
            console.log(`[Auto Fill] Name: ${options[0].name}, Type: ${options[0].type}`);
            console.log(`[Auto Fill] Đáp án nhập: "${answer}"`);

            // Phân tích đáp án - có thể nhiều ký tự (AB, CD, 012...)
            const positions = [];
            for (let char of answer) {
                const pos = ANSWER_MAP[char];
                console.log(`[Auto Fill]   Ký tự "${char}" → vị trí ${pos}`);
                if (pos !== undefined && pos < options.length) {
                    positions.push(pos);
                }
            }

            console.log(`[Auto Fill] Các vị trí sẽ chọn: [${positions.join(', ')}]`);

            if (positions.length === 0) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án không hợp lệ`);
                fail++;
                return;
            }

            const isCheckbox = options[0].type === 'checkbox';
            console.log(`[Auto Fill] Loại: ${isCheckbox ? 'checkbox' : 'radio'}`);
            
            // Nếu là radio mà chọn nhiều đáp án
            if (!isCheckbox && positions.length > 1) {
                console.warn(`[Auto Fill] ⚠️ Câu ${idx + 1}: Radio button với ${positions.length} đáp án - Sẽ thử chọn tất cả (có thể là nhiều nhóm radio)`);
                // Không splice - cho phép chọn nhiều radio
            }

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
                const answerText = positions.map(p => String.fromCharCode(65 + p)).join('');
                console.log(`[Auto Fill] ✓ Câu ${idx + 1}: ${answerText} (${isCheckbox ? 'checkbox' : 'radio'})`);
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
    
    const radios = allInputs.filter(i => i.type === 'radio');
    const checkboxes = allInputs.filter(i => i.type === 'checkbox');
    
    if (allInputs.length > 0) {
        console.log(`[Auto Fill] Found ${radios.length} radio, ${checkboxes.length} checkbox`);
        processAnswers(allInputs);
    } else {
        console.log('[Auto Fill] Waiting...');
        waitForInputs();
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
