(function() {
    'use strict';

    // Hàm chờ và tìm radio buttons
    function waitForRadios(maxAttempts = 10, interval = 500) {
        let attempts = 0;
        
        const checkInterval = setInterval(() => {
            attempts++;
            const radios = document.querySelectorAll('input[type="radio"]');
            
            console.log(`Lần thử ${attempts}: Tìm thấy ${radios.length} radio buttons`);
            
            if (radios.length > 0) {
                clearInterval(checkInterval);
                startAutofill(radios);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                
                // Thử tìm trong iframe
                const iframes = document.querySelectorAll('iframe');
                console.log(`Tìm thấy ${iframes.length} iframes`);
                
                if (iframes.length > 0) {
                    alert(`❌ Không tìm thấy radio buttons!\n\nCó thể câu hỏi nằm trong iframe.\nThử các cách sau:\n1. Đợi trang load xong rồi chạy lại\n2. Click vào vùng câu hỏi trước\n3. Chạy script trong iframe`);
                } else {
                    alert(`❌ Không tìm thấy radio buttons!\n\nThử:\n1. Đợi trang load xong\n2. Cuộn xuống xem câu hỏi\n3. Chạy lại script`);
                }
            }
        }, interval);
    }

    function startAutofill(allRadios) {
        console.log(`\n=== Bắt đầu autofill với ${allRadios.length} radio buttons ===`);
        
        // Nhập đáp án
        let input = prompt(
            `Tìm thấy ${allRadios.length} radio buttons!\n\n` +
            "Nhập đáp án (cách nhau bởi dấu phẩy):\n" +
            "Ví dụ: A,C,B,D hoặc a,c,b,d hoặc 0,2,1,3\n" +
            "(A/a/0 = đáp án đầu, B/b/1 = đáp án thứ 2, ...)"
        );

        if (!input || input.trim() === "") {
            alert("Bạn chưa nhập đáp án!");
            return;
        }

        // Tách và chuẩn hóa đáp án
        let answers = input.split(",").map(a => a.trim().toUpperCase());

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
        console.log(`Đã group thành ${questions.length} câu hỏi`);

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

            // Chuyển đổi đáp án sang index
            let pos = answerMap[answer];
            
            if (pos === undefined) {
                console.error(`Câu ${idx + 1}: Đáp án "${answer}" không hợp lệ`);
                failCount++;
                return;
            }

            if (pos >= options.length) {
                console.error(`Câu ${idx + 1}: Đáp án "${answer}" vượt quá số lựa chọn (${options.length})`);
                failCount++;
                return;
            }

            // Click vào đáp án
            try {
                options[pos].click();
                
                // Thử dispatch event nếu click không hoạt động
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
                console.log(`✓ Câu ${idx + 1}: Đã chọn đáp án ${answer} (vị trí ${pos})`);
            } catch (e) {
                console.error(`✗ Câu ${idx + 1}: Lỗi - ${e.message}`);
                failCount++;
            }
        });

        // Thông báo kết quả
        const message = `
✅ Hoàn thành!

Đã chọn: ${successCount} câu
Thất bại: ${failCount} câu
Tổng câu hỏi: ${questions.length}
Đáp án nhập: ${answers.length}

${successCount < questions.length ? '\n⚠️ Kiểm tra lại các câu chưa được chọn!' : ''}
        `.trim();

        console.log("\n" + message);
        alert(message);

        // Cuộn đến câu đầu tiên để xem kết quả
        if (questions.length > 0 && questions[0].length > 0) {
            questions[0][0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Bắt đầu
    console.log("=== Script Autofill v2 ===");
    console.log("Đang tìm radio buttons...");
    
    // Thử tìm ngay lập tức
    const immediateRadios = document.querySelectorAll('input[type="radio"]');
    if (immediateRadios.length > 0) {
        console.log(`Tìm thấy ngay ${immediateRadios.length} radio buttons`);
        startAutofill(immediateRadios);
    } else {
        console.log("Chưa tìm thấy, đang chờ trang load...");
        waitForRadios();
    }

})();
