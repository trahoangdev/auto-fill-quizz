// ============================================
// AUTO FILL QUIZ - DÀNH CHO IFRAME
// ============================================
// Dùng khi câu hỏi nằm trong iframe
// ============================================

(function() {
    'use strict';

    console.log('🔍 Tìm kiếm trong iframe...');

    // Tìm iframe
    const iframe = document.querySelector('iframe');
    
    if (!iframe) {
        alert('❌ Không tìm thấy iframe!');
        return;
    }

    console.log('✓ Tìm thấy iframe:', iframe.src);

    // Lấy document của iframe
    let iframeDoc;
    try {
        iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    } catch (e) {
        alert('❌ Không thể truy cập iframe (cross-origin)!\n\nThử:\n1. Mở iframe trong tab mới\n2. Chạy script trực tiếp trong đó');
        console.error('Cross-origin error:', e);
        return;
    }

    if (!iframeDoc) {
        alert('❌ Không thể truy cập nội dung iframe!');
        return;
    }

    console.log('✓ Đã truy cập được iframe document');

    // Hỏi selector (có thể để trống)
    let customSelector = prompt(
        '🎯 Nhập CSS Selector trong iframe (hoặc để trống):\n\n' +
        'Ví dụ:\n' +
        '  #quiz-container\n' +
        '  .questions-wrapper\n' +
        '  form\n\n' +
        'Để trống nếu không biết selector:'
    );

    // Hỏi đáp án
    let answersInput = prompt(
        '📝 Nhập đáp án (cách nhau bởi dấu phẩy):\n\n' +
        'Ví dụ: A,C,B,D hoặc a,c,b,d hoặc 0,2,1,3'
    );

    if (!answersInput || answersInput.trim() === '') {
        alert('❌ Bạn chưa nhập đáp án!');
        return;
    }

    // Hàm tìm radio buttons trong iframe
    function findRadiosInIframe(selector) {
        let radios = null;
        
        if (selector && selector.trim()) {
            console.log(`[Auto Fill] Tìm trong iframe với selector: "${selector}"`);
            try {
                const container = iframeDoc.querySelector(selector);
                if (container) {
                    radios = container.querySelectorAll('input[type="radio"]');
                    console.log(`[Auto Fill] ✓ Tìm thấy ${radios.length} radio buttons`);
                } else {
                    console.error(`[Auto Fill] ✗ Không tìm thấy element với selector: "${selector}"`);
                }
            } catch (e) {
                console.error(`[Auto Fill] ✗ Selector không hợp lệ: "${selector}"`, e);
            }
        }
        
        // Nếu không có selector hoặc không tìm thấy, tìm toàn iframe
        if (!radios || radios.length === 0) {
            console.log('[Auto Fill] Tìm trong toàn iframe');
            radios = iframeDoc.querySelectorAll('input[type="radio"]');
        }
        
        return radios;
    }

    // Hàm chờ tìm radio buttons
    function waitForRadios(maxAttempts = 30, interval = 500) {
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            const radios = findRadiosInIframe(customSelector);
            
            console.log(`[Auto Fill] Lần thử ${attempts}/${maxAttempts}: Tìm thấy ${radios.length} radio buttons`);
            
            if (radios.length > 0) {
                clearInterval(checkInterval);
                startAutofill(radios);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                alert('❌ Không tìm thấy câu hỏi trong iframe!\n\nThử:\n1. Đợi iframe load xong\n2. Cuộn xuống trong iframe\n3. Kiểm tra selector');
            }
        }, interval);
    }

    // Hàm điền đáp án
    function startAutofill(allRadios) {
        console.log(`\n[Auto Fill] Bắt đầu với ${allRadios.length} radio buttons`);
        
        // Tách và chuẩn hóa đáp án
        const answers = answersInput.split(',').map(a => a.trim().toUpperCase());
        console.log(`[Auto Fill] Đáp án: ${answers.join(', ')}`);

        // Group radio buttons theo name
        const groupedByName = {};
        allRadios.forEach(radio => {
            const name = radio.name || radio.id || 'unknown';
            if (!groupedByName[name]) {
                groupedByName[name] = [];
            }
            groupedByName[name].push(radio);
        });

        const questions = Object.values(groupedByName);
        console.log(`[Auto Fill] Tìm thấy ${questions.length} câu hỏi`);

        if (questions.length === 0) {
            alert('❌ Không thể phân tích câu hỏi!');
            return;
        }

        // Map chuyển đổi đáp án
        const answerMap = {
            'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5,
            '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5
        };

        let successCount = 0;
        let failCount = 0;

        // Điền từng câu
        questions.forEach((options, idx) => {
            const answer = answers[idx];
            
            if (!answer) {
                console.warn(`[Auto Fill] Câu ${idx + 1}: Không có đáp án`);
                failCount++;
                return;
            }

            const pos = answerMap[answer];
            
            if (pos === undefined) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án "${answer}" không hợp lệ`);
                failCount++;
                return;
            }

            if (pos >= options.length) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án "${answer}" vượt quá số lựa chọn (${options.length})`);
                failCount++;
                return;
            }

            // Click vào đáp án
            try {
                options[pos].click();
                options[pos].checked = true;
                options[pos].dispatchEvent(new Event('change', { bubbles: true }));
                options[pos].dispatchEvent(new Event('click', { bubbles: true }));
                
                // Highlight
                const parent = options[pos].closest('label, .option, div, li');
                if (parent) {
                    parent.style.backgroundColor = '#d4edda';
                    parent.style.border = '2px solid #28a745';
                    parent.style.transition = 'all 0.3s';
                }

                successCount++;
                console.log(`[Auto Fill] ✓ Câu ${idx + 1}: Chọn ${answer} (vị trí ${pos})`);
            } catch (e) {
                console.error(`[Auto Fill] ✗ Câu ${idx + 1}: Lỗi - ${e.message}`);
                failCount++;
            }
        });

        // Hiển thị thông báo trong iframe
        showNotification(successCount, failCount, questions.length);

        // Cuộn đến câu đầu tiên trong iframe
        if (questions.length > 0 && questions[0].length > 0) {
            setTimeout(() => {
                questions[0][0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }

    // Hiển thị thông báo trong iframe
    function showNotification(success, fail, total) {
        const notification = iframeDoc.createElement('div');
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; z-index: 999999; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 20px 30px; border-radius: 12px; 
                        box-shadow: 0 8px 32px rgba(0,0,0,0.3); font-family: Arial; 
                        animation: slideIn 0.3s ease-out;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
                    ${fail === 0 ? '✅ Hoàn thành!' : '⚠️ Hoàn thành một phần'}
                </div>
                <div style="font-size: 14px;">
                    ✓ Đã chọn: <strong>${success}</strong> câu<br>
                    ${fail > 0 ? `✗ Thất bại: <strong>${fail}</strong> câu<br>` : ''}
                    📝 Tổng: <strong>${total}</strong> câu
                </div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        iframeDoc.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Bắt đầu
    console.log('[Auto Fill] Script iframe đã chạy');
    if (customSelector) {
        console.log(`[Auto Fill] Sử dụng selector: "${customSelector}"`);
    }
    
    const immediateRadios = findRadiosInIframe(customSelector);
    if (immediateRadios.length > 0) {
        console.log(`[Auto Fill] Tìm thấy ngay ${immediateRadios.length} radio buttons`);
        startAutofill(immediateRadios);
    } else {
        console.log('[Auto Fill] Chưa tìm thấy, đang chờ...');
        waitForRadios();
    }

})();
