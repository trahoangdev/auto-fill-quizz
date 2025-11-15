(function() {
    'use strict';

    // Hàm chờ và tìm inputs (radio + checkbox)
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
            
            console.log(`Lần thử ${attempts}: Tìm thấy ${radios.length} radio, ${checkboxes.length} checkbox`);
            
            if (allInputs.length > 0) {
                clearInterval(checkInterval);
                startAutofill(allInputs);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                
                const iframes = document.querySelectorAll('iframe');
                console.log(`Tìm thấy ${iframes.length} iframes`);
                
                if (iframes.length > 0) {
                    alert(`❌ Không tìm thấy câu hỏi!\n\nCó thể câu hỏi nằm trong iframe.\nThử các cách sau:\n1. Đợi trang load xong rồi chạy lại\n2. Click vào vùng câu hỏi trước\n3. Chạy script trong iframe`);
                } else {
                    alert(`❌ Không tìm thấy câu hỏi!\n\nThử:\n1. Đợi trang load xong\n2. Cuộn xuống xem câu hỏi\n3. Chạy lại script`);
                }
            }
        }, interval);
    }

    function startAutofill(allInputs) {
        const radios = allInputs.filter(i => i.type === 'radio');
        const checkboxes = allInputs.filter(i => i.type === 'checkbox');
        
        console.log(`\n=== Bắt đầu autofill: ${radios.length} radio, ${checkboxes.length} checkbox ===`);
        
        // Debug: Kiểm tra thứ tự inputs
        console.log('\n=== Thứ tự inputs trong allInputs ===');
        allInputs.forEach((input, idx) => {
            console.log(`${idx}: name="${input.name}", type="${input.type}", value="${input.value}"`);
        });
        
        // Nhập đáp án
        let input = prompt(
            `✅ Tìm thấy ${questions.length} câu hỏi (${radios.length} radio, ${checkboxes.length} checkbox)\n\n` +
            "📝 Nhập đáp án (cách nhau bởi dấu phẩy):\n\n" +
            "Ví dụ:\n" +
            "• Chọn 1: A,C,B,D\n" +
            "• Chọn nhiều: AB,C,BD,A\n" +
            "• Dùng số: 0,12,1,03\n\n" +
            "(A/0 = đáp án đầu, B/1 = thứ 2, ...)"
        );

        if (!input || input.trim() === "") {
            alert("❌ Bạn chưa nhập đáp án!");
            return;
        }

        // Tách đáp án theo dấu phẩy
        let answers = input.split(",").map(a => a.trim().toUpperCase());
        
        // Validation
        if (answers.length !== questions.length) {
            const confirm = window.confirm(
                `⚠️ Cảnh báo:\n\n` +
                `Số đáp án: ${answers.length}\n` +
                `Số câu hỏi: ${questions.length}\n\n` +
                `Có thể thiếu hoặc thừa đáp án!\n\n` +
                `Bạn có muốn tiếp tục?`
            );
            if (!confirm) return;
        }

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
        console.log(`Đã group thành ${questions.length} câu hỏi`);
        
        // Debug: Hiển thị thứ tự câu hỏi
        console.log('\n=== Thứ tự câu hỏi ===');
        nameOrder.forEach((name, idx) => {
            const opts = groupedByName[name];
            const values = opts.map(o => o.value).join(',');
            console.log(`Câu ${idx + 1}: name="${name}", type="${opts[0].type}", options=${opts.length}, values=[${values}], firstIndex=${firstAppearance[name]}`);
        });
        
        console.log(`\n=== Tổng kết ===`);
        console.log(`Tổng inputs: ${allInputs.length}`);
        console.log(`Tổng câu hỏi: ${questions.length}`);
        console.log(`Đáp án nhập: ${answers.length} (${answers.join(', ')})`);
        
        if (answers.length !== questions.length) {
            console.warn(`⚠️ CẢNH BÁO: Số đáp án (${answers.length}) ≠ Số câu hỏi (${questions.length})`);
        }

        if (questions.length === 0) {
            alert("❌ Không thể group câu hỏi!");
            return;
        }

        // Map chuyển đổi đáp án
        const answerMap = {
            "A": 0, "B": 1, "C": 2, "D": 3, "E": 4, "F": 5,
            "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5
        };

        let successCount = 0;
        let failCount = 0;

        questions.forEach((options, idx) => {
            let answer = answers[idx];
            if (!answer) {
                console.warn(`Câu ${idx + 1}: Không có đáp án`);
                failCount++;
                return;
            }

            // Debug: Log thông tin câu hỏi
            console.log(`\n--- Câu ${idx + 1} ---`);
            console.log(`Name: ${options[0].name}, Type: ${options[0].type}`);
            console.log(`Số options: ${options.length}`);
            console.log(`Đáp án nhập: "${answer}"`);

            // Phân tích đáp án - có thể là nhiều ký tự (AB, CD, 012, ...)
            const positions = [];
            for (let char of answer) {
                const pos = answerMap[char];
                console.log(`  Ký tự "${char}" → vị trí ${pos}`);
                if (pos !== undefined && pos < options.length) {
                    positions.push(pos);
                }
            }

            console.log(`Các vị trí sẽ chọn: [${positions.join(', ')}]`);

            if (positions.length === 0) {
                console.error(`Câu ${idx + 1}: Đáp án "${answer}" không hợp lệ`);
                failCount++;
                return;
            }

            // Kiểm tra loại câu hỏi
            const isCheckbox = options[0].type === 'checkbox';
            console.log(`Loại: ${isCheckbox ? 'checkbox' : 'radio'}`);
            
            // Nếu là radio mà chọn nhiều đáp án
            if (!isCheckbox && positions.length > 1) {
                console.warn(`⚠️ Câu ${idx + 1}: Radio button với ${positions.length} đáp án - Sẽ thử chọn tất cả (có thể là nhiều nhóm radio)`);
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
                console.log(`✓ Câu ${idx + 1}: Đã chọn ${selectedCount} đáp án: ${answerText} (${isCheckbox ? 'checkbox' : 'radio'})`);
            } catch (e) {
                console.error(`✗ Câu ${idx + 1}: Lỗi - ${e.message}`);
                failCount++;
            }
        });

        // Thông báo kết quả
        const allSuccess = successCount === questions.length && failCount === 0;
        const icon = allSuccess ? '✅' : (failCount > 0 ? '❌' : '⚠️');
        
        const message = `
${icon} ${allSuccess ? 'Hoàn thành!' : 'Hoàn thành một phần'}

✓ Đã chọn: ${successCount}/${questions.length} câu
${failCount > 0 ? `✗ Thất bại: ${failCount} câu\n` : ''}
${successCount < questions.length ? '⚠️ Kiểm tra lại các câu chưa được chọn!\n' : ''}
💡 Xem Console (F12) để biết chi tiết
        `.trim();

        console.log("\n" + message);
        alert(message);

        // Cuộn đến câu đầu tiên để xem kết quả
        if (questions.length > 0 && questions[0].length > 0) {
            questions[0][0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Bắt đầu
    console.log("=== Script Autofill v2.1 (Hỗ trợ Radio + Checkbox) ===");
    console.log("Đang tìm câu hỏi...");
    
    // Thử tìm ngay lập tức - Lấy theo đúng thứ tự DOM
    const immediateInputs = Array.from(document.querySelectorAll('input')).filter(
        input => input.type === 'radio' || input.type === 'checkbox'
    );
    
    const immediateRadios = immediateInputs.filter(i => i.type === 'radio');
    const immediateCheckboxes = immediateInputs.filter(i => i.type === 'checkbox');
    
    if (immediateInputs.length > 0) {
        console.log(`Tìm thấy ngay ${immediateRadios.length} radio, ${immediateCheckboxes.length} checkbox`);
        startAutofill(immediateInputs);
    } else {
        console.log("Chưa tìm thấy, đang chờ trang load...");
        waitForInputs();
    }

})();
