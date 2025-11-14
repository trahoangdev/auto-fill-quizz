(function() {
    'use strict';

    console.log("=== DEBUG: Bắt đầu phân tích cấu trúc trang ===");

    // Tìm tất cả input radio
    const allRadios = document.querySelectorAll('input[type="radio"]');
    console.log(`Tìm thấy ${allRadios.length} radio buttons`);

    if (allRadios.length === 0) {
        alert("❌ Không tìm thấy radio button nào!\nKiểm tra xem trang đã load xong chưa.");
        return;
    }

    // Phân tích cấu trúc
    console.log("\n=== Phân tích 5 radio đầu tiên ===");
    allRadios.forEach((radio, idx) => {
        if (idx < 5) {
            console.log(`\nRadio ${idx}:`);
            console.log("- Name:", radio.name);
            console.log("- Value:", radio.value);
            console.log("- ID:", radio.id);
            console.log("- Parent:", radio.parentElement?.tagName, radio.parentElement?.className);
            console.log("- Label:", radio.parentElement?.textContent?.trim().substring(0, 50));
        }
    });

    // Group theo name
    const groupedByName = {};
    allRadios.forEach(radio => {
        const name = radio.name;
        if (!groupedByName[name]) {
            groupedByName[name] = [];
        }
        groupedByName[name].push(radio);
    });

    const questionCount = Object.keys(groupedByName).length;
    console.log(`\n=== Tìm thấy ${questionCount} nhóm câu hỏi ===`);

    Object.keys(groupedByName).forEach((name, idx) => {
        if (idx < 3) {
            console.log(`\nNhóm "${name}": ${groupedByName[name].length} đáp án`);
        }
    });

    // Thử các selector phổ biến
    console.log("\n=== Thử các selector ===");
    const selectors = [
        'div[role="radiogroup"]',
        '.question',
        '.form-group',
        'fieldset',
        '[class*="question"]',
        '[class*="quiz"]',
        'form > div',
        '.radio-group'
    ];

    selectors.forEach(sel => {
        const found = document.querySelectorAll(sel);
        if (found.length > 0) {
            console.log(`✓ "${sel}": ${found.length} elements`);
        }
    });

    alert(`
📊 Kết quả phân tích:
- Radio buttons: ${allRadios.length}
- Nhóm câu hỏi: ${questionCount}

Xem Console (F12) để biết chi tiết!
    `.trim());

})();
