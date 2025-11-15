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
        'Ví dụ:\n' +
        '• Chọn 1: A,C,B,D\n' +
        '• Chọn nhiều: AB,C,BD,A\n' +
        '• Dùng số: 0,12,1,03\n\n' +
        '(A/0 = đáp án đầu, B/1 = thứ 2, ...)'
    );

    if (!answersInput || answersInput.trim() === '') {
        alert('❌ Bạn chưa nhập đáp án!');
        return;
    }

    // Hàm tìm radio/checkbox theo đúng thứ tự DOM
    function findInputs(selector) {
        let inputs = [];
        
        if (selector && selector.trim()) {
            console.log(`[Auto Fill] Tìm trong selector: "${selector}"`);
            try {
                const container = document.querySelector(selector);
                if (container) {
                    // Lấy theo đúng thứ tự DOM
                    inputs = Array.from(container.querySelectorAll('input')).filter(
                        input => input.type === 'radio' || input.type === 'checkbox'
                    );
                    const radios = inputs.filter(i => i.type === 'radio');
                    const checkboxes = inputs.filter(i => i.type === 'checkbox');
                    console.log(`[Auto Fill] ✓ Tìm thấy ${radios.length} radio, ${checkboxes.length} checkbox trong "${selector}"`);
                } else {
                    console.error(`[Auto Fill] ✗ Không tìm thấy element với selector: "${selector}"`);
                }
            } catch (e) {
                console.error(`[Auto Fill] ✗ Selector không hợp lệ: "${selector}"`, e);
            }
        }
        
        // Nếu không có selector hoặc không tìm thấy, tìm toàn trang
        if (inputs.length === 0) {
            console.log('[Auto Fill] Tìm trong toàn trang');
            // Lấy theo đúng thứ tự DOM
            inputs = Array.from(document.querySelectorAll('input')).filter(
                input => input.type === 'radio' || input.type === 'checkbox'
            );
            
            // Thử tìm trong iframe
            if (inputs.length === 0) {
                const iframes = document.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    try {
                        const iframeInputs = Array.from(iframe.contentDocument?.querySelectorAll('input') || []).filter(
                            input => input.type === 'radio' || input.type === 'checkbox'
                        );
                        if (iframeInputs.length > 0) {
                            inputs = iframeInputs;
                        }
                    } catch (e) {
                        // Cross-origin iframe
                    }
                });
            }
        }
        
        return inputs;
    }

    // Hàm chờ tìm inputs
    function waitForInputs(maxAttempts = 10, interval = 500) {
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            const inputs = findInputs(typeof customSelector !== 'undefined' ? customSelector : '');
            const radios = inputs.filter(i => i.type === 'radio');
            const checkboxes = inputs.filter(i => i.type === 'checkbox');
            
            console.log(`[Auto Fill] Lần thử ${attempts}/${maxAttempts}: ${radios.length} radio, ${checkboxes.length} checkbox`);
            
            if (inputs.length > 0) {
                clearInterval(checkInterval);
                startAutofill(inputs);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                alert('❌ Không tìm thấy câu hỏi trắc nghiệm!\n\nThử:\n1. Kiểm tra selector\n2. Đợi trang load xong\n3. Xem Console để biết chi tiết');
            }
        }, interval);
    }

    // Hàm điền đáp án
    function startAutofill(allInputs) {
        const radios = allInputs.filter(i => i.type === 'radio');
        const checkboxes = allInputs.filter(i => i.type === 'checkbox');
        
        console.log(`\n[Auto Fill] Bắt đầu với ${radios.length} radio, ${checkboxes.length} checkbox`);
        
        // Tách và chuẩn hóa đáp án
        const answers = answersInput.split(',').map(a => a.trim().toUpperCase());
        console.log(`[Auto Fill] Đáp án: ${answers.join(', ')}`);

        // Group inputs theo name và giữ thứ tự xuất hiện trong DOM
        const groupedByName = {};
        const firstAppearance = {}; // Lưu vị trí xuất hiện đầu tiên của mỗi name
        
        allInputs.forEach((input, index) => {
            const name = input.name || input.id || 'unknown';
            if (!groupedByName[name]) {
                groupedByName[name] = [];
                firstAppearance[name] = index; // Lưu vị trí đầu tiên
            }
            groupedByName[name].push(input);
        });

        // Sắp xếp theo thứ tự xuất hiện thực tế trong DOM
        const nameOrder = Object.keys(groupedByName).sort((a, b) => firstAppearance[a] - firstAppearance[b]);
        
        // Lấy câu hỏi theo đúng thứ tự xuất hiện
        const questions = nameOrder.map(name => groupedByName[name]);
        console.log(`[Auto Fill] Tìm thấy ${questions.length} câu hỏi`);
        
        // Debug: Hiển thị thứ tự câu hỏi
        console.log('\n[Auto Fill] === Thứ tự câu hỏi ===');
        nameOrder.forEach((name, idx) => {
            const opts = groupedByName[name];
            console.log(`[Auto Fill] Câu ${idx + 1}: name="${name}", type="${opts[0].type}", options=${opts.length}, firstIndex=${firstAppearance[name]}`);
        });

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

            // Debug: Log thông tin câu hỏi
            console.log(`\n[Auto Fill] --- Câu ${idx + 1} ---`);
            console.log(`[Auto Fill] Name: ${options[0].name}, Type: ${options[0].type}`);
            console.log(`[Auto Fill] Đáp án nhập: "${answer}"`);

            // Phân tích đáp án - có thể nhiều ký tự (AB, CD, 012...)
            const positions = [];
            for (let char of answer) {
                const pos = answerMap[char];
                console.log(`[Auto Fill]   Ký tự "${char}" → vị trí ${pos}`);
                if (pos !== undefined && pos < options.length) {
                    positions.push(pos);
                }
            }

            console.log(`[Auto Fill] Các vị trí sẽ chọn: [${positions.join(', ')}]`);

            if (positions.length === 0) {
                console.error(`[Auto Fill] Câu ${idx + 1}: Đáp án "${answer}" không hợp lệ`);
                failCount++;
                return;
            }

            const isCheckbox = options[0].type === 'checkbox';
            console.log(`[Auto Fill] Loại: ${isCheckbox ? 'checkbox' : 'radio'}`);
            
            // Nếu là radio mà chọn nhiều đáp án
            if (!isCheckbox && positions.length > 1) {
                console.warn(`[Auto Fill] ⚠️ Câu ${idx + 1}: Radio button với ${positions.length} đáp án - Sẽ thử chọn tất cả (có thể là nhiều nhóm radio)`);
                // Không splice - cho phép chọn nhiều radio
            }

            // Click vào các đáp án
            try {
                // Chỉ bỏ chọn tất cả nếu là radio VÀ chỉ chọn 1 đáp án
                if (!isCheckbox && positions.length === 1) {
                    options.forEach(opt => opt.checked = false);
                }
                
                let selectedCount = 0;
                
                // Chọn từng đáp án
                positions.forEach(pos => {
                    const input = options[pos];
                    
                    input.click();
                    input.checked = true;
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.dispatchEvent(new Event('click', { bubbles: true }));
                    
                    // Highlight
                    const parent = input.closest('label, .option, div, li');
                    if (parent) {
                        parent.style.backgroundColor = '#d4edda';
                        parent.style.border = '2px solid #28a745';
                        parent.style.transition = 'all 0.3s';
                    }
                    
                    selectedCount++;
                });

                successCount++;
                const answerText = positions.map(p => String.fromCharCode(65 + p)).join('');
                console.log(`[Auto Fill] ✓ Câu ${idx + 1}: ${answerText} (${selectedCount} đáp án, ${isCheckbox ? 'checkbox' : 'radio'})`);
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
    console.log('[Auto Fill] Script thủ công đã chạy (Hỗ trợ Radio + Checkbox)');
    const customSelector = typeof customSelector !== 'undefined' ? customSelector : '';
    if (customSelector) {
        console.log(`[Auto Fill] Sử dụng selector: "${customSelector}"`);
    }
    
    const immediateInputs = findInputs(customSelector);
    if (immediateInputs.length > 0) {
        const radios = immediateInputs.filter(i => i.type === 'radio');
        const checkboxes = immediateInputs.filter(i => i.type === 'checkbox');
        console.log(`[Auto Fill] Tìm thấy ngay ${radios.length} radio, ${checkboxes.length} checkbox`);
        startAutofill(immediateInputs);
    } else {
        console.log('[Auto Fill] Chưa tìm thấy, đang chờ...');
        waitForInputs();
    }

})();
