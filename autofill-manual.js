// ============================================
// AUTO FILL QUIZ - SCRIPT THỦ CÔNG
// ============================================
// Cách dùng:
// 1. Mở trang bài thi
// 2. Nhấn F12 → Console
// 3. Copy toàn bộ script này và paste vào Console
// 4. Nhập đáp án khi được hỏi
// ============================================

(function() {
    'use strict';

    // Hỏi đáp án
    let answersInput = prompt(
        '📝 Nhập đáp án (cách nhau bởi dấu phẩy):\n\n' +
        'Ví dụ: A,C,B,D hoặc a,c,b,d hoặc 0,2,1,3\n' +
        '(A/a/0 = đáp án đầu, B/b/1 = đáp án thứ 2, ...)'
    );

    if (!answersInput || answersInput.trim() === '') {
        alert('❌ Bạn chưa nhập đáp án!');
        return;
    }

    // Hàm tìm radio buttons
    function findRadios(selector) {
        let radios = null;
        
        if (selector && selector.trim()) {
            console.log(`[Auto Fill] Tìm trong selector: "${selector}"`);
            try {
                const container = document.querySelector(selector);
                if (container) {
                    radios = container.querySelectorAll('input[type="radio"]');
                    console.log(`[Auto Fill] ✓ Tìm thấy ${radios.length} radio buttons trong "${selector}"`);
                } else {
                    console.error(`[Auto Fill] ✗ Không tìm thấy element với selector: "${selector}"`);
                }
            } catch (e) {
                console.error(`[Auto Fill] ✗ Selector không hợp lệ: "${selector}"`, e);
            }
        }
        
        // Nếu không có selector hoặc không tìm thấy, tìm toàn trang
        if (!radios || radios.length === 0) {
            console.log('[Auto Fill] Tìm trong toàn trang');
            radios = document.querySelectorAll('input[type="radio"]');
            
            // Thử tìm trong iframe
            if (radios.length === 0) {
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        const iframeRadios = iframe.contentDocument?.querySelectorAll('input[type="radio"]');
                        if (iframeRadios && iframeRadios.length > 0) {
                            radios = iframeRadios;
                        }
                    } catch (e) {
                        // Cross-origin iframe
                    }
                });
            }
        }
        
        return radios;
    }

    // Hàm chờ tìm radio buttons
    function waitForRadios(maxAttempts = 10, interval = 500) {
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            const radios = findRadios(customSelector);
            
            console.log(`[Auto Fill] Lần thử ${attempts}/${maxAttempts}: Tìm thấy ${radios.length} radio buttons`);
            
            if (radios.length > 0) {
                clearInterval(checkInterval);
                startAutofill(radios);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                alert('❌ Không tìm thấy câu hỏi trắc nghiệm!\n\nThử:\n1. Kiểm tra selector\n2. Đợi trang load xong\n3. Xem Console để biết chi tiết');
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

        // Hiển thị thông báo
        showNotification(successCount, failCount, questions.length);

        // Cuộn đến câu đầu tiên
        if (questions.length > 0 && questions[0].length > 0) {
            setTimeout(() => {
                questions[0][0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }

    // Hiển thị thông báo
    function showNotification(success, fail, total) {
        const notification = document.createElement('div');
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
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Bắt đầu
    console.log('[Auto Fill] Script thủ công đã chạy');
    if (customSelector) {
        console.log(`[Auto Fill] Sử dụng selector: "${customSelector}"`);
    }
    
    const immediateRadios = findRadios(customSelector);
    if (immediateRadios.length > 0) {
        console.log(`[Auto Fill] Tìm thấy ngay ${immediateRadios.length} radio buttons`);
        startAutofill(immediateRadios);
    } else {
        console.log('[Auto Fill] Chưa tìm thấy, đang chờ...');
        waitForRadios();
    }

})();
