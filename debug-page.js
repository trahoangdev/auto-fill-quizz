// ============================================
// DEBUG SCRIPT - Tìm hiểu cấu trúc trang
// ============================================
// Copy và paste vào Console để phân tích trang
// ============================================

(function() {
    console.clear();
    console.log('='.repeat(50));
    console.log('🔍 DEBUG: Phân tích cấu trúc trang');
    console.log('='.repeat(50));
    
    // 1. Kiểm tra radio buttons
    const radios = document.querySelectorAll('input[type="radio"]');
    console.log(`\n📊 Radio buttons: ${radios.length}`);
    
    if (radios.length > 0) {
        console.log('✅ Tìm thấy radio buttons!');
        radios.forEach((r, i) => {
            if (i < 5) {
                console.log(`  Radio ${i}: name="${r.name}", value="${r.value}", id="${r.id}"`);
            }
        });
    } else {
        console.log('❌ KHÔNG tìm thấy radio buttons!');
    }
    
    // 2. Kiểm tra tất cả input
    const allInputs = document.querySelectorAll('input');
    console.log(`\n📊 Tất cả input: ${allInputs.length}`);
    
    const inputTypes = {};
    allInputs.forEach(inp => {
        const type = inp.type || 'unknown';
        inputTypes[type] = (inputTypes[type] || 0) + 1;
    });
    
    console.log('Phân loại input:');
    Object.keys(inputTypes).forEach(type => {
        console.log(`  ${type}: ${inputTypes[type]}`);
    });
    
    // 3. Kiểm tra iframe
    const iframes = document.querySelectorAll('iframe');
    console.log(`\n📊 Iframe: ${iframes.length}`);
    
    if (iframes.length > 0) {
        iframes.forEach((iframe, i) => {
            console.log(`  Iframe ${i}: src="${iframe.src}"`);
            try {
                const iframeRadios = iframe.contentDocument?.querySelectorAll('input[type="radio"]');
                console.log(`    → Radio trong iframe: ${iframeRadios?.length || 0}`);
            } catch (e) {
                console.log(`    → Không truy cập được (cross-origin)`);
            }
        });
    }
    
    // 4. Tìm các element có thể chứa câu hỏi
    console.log('\n📊 Tìm kiếm elements:');
    const selectors = [
        'form',
        '[class*="quiz"]',
        '[class*="question"]',
        '[class*="test"]',
        '[id*="quiz"]',
        '[id*="question"]',
        '[role="radiogroup"]',
        'fieldset'
    ];
    
    selectors.forEach(sel => {
        try {
            const found = document.querySelectorAll(sel);
            if (found.length > 0) {
                console.log(`  ✓ ${sel}: ${found.length}`);
                // Kiểm tra có radio trong đó không
                found.forEach((el, i) => {
                    if (i < 3) {
                        const radiosInside = el.querySelectorAll('input[type="radio"]');
                        if (radiosInside.length > 0) {
                            console.log(`    → Element ${i} có ${radiosInside.length} radio buttons`);
                        }
                    }
                });
            }
        } catch (e) {
            // Selector không hợp lệ
        }
    });
    
    // 5. Tìm các element có nhiều input
    console.log('\n📊 Elements chứa nhiều input:');
    const allElements = document.querySelectorAll('*');
    const elementsWithInputs = [];
    
    allElements.forEach(el => {
        const inputs = el.querySelectorAll('input');
        if (inputs.length >= 4) {
            elementsWithInputs.push({
                tag: el.tagName,
                id: el.id,
                class: el.className,
                inputs: inputs.length
            });
        }
    });
    
    elementsWithInputs.sort((a, b) => b.inputs - a.inputs);
    elementsWithInputs.slice(0, 5).forEach((el, i) => {
        console.log(`  ${i + 1}. <${el.tag}> id="${el.id}" class="${el.class}" → ${el.inputs} inputs`);
    });
    
    // 6. Kiểm tra shadow DOM
    console.log('\n📊 Shadow DOM:');
    const elementsWithShadow = document.querySelectorAll('*');
    let shadowCount = 0;
    elementsWithShadow.forEach(el => {
        if (el.shadowRoot) {
            shadowCount++;
            const shadowRadios = el.shadowRoot.querySelectorAll('input[type="radio"]');
            if (shadowRadios.length > 0) {
                console.log(`  ✓ Tìm thấy ${shadowRadios.length} radio trong shadow DOM`);
            }
        }
    });
    console.log(`  Tổng elements có shadow DOM: ${shadowCount}`);
    
    // 7. Kết luận
    console.log('\n' + '='.repeat(50));
    console.log('📋 KẾT LUẬN:');
    console.log('='.repeat(50));
    
    if (radios.length > 0) {
        console.log('✅ Trang có radio buttons, script nên hoạt động!');
        console.log(`   Tổng: ${radios.length} radio buttons`);
    } else if (iframes.length > 0) {
        console.log('⚠️ Có thể câu hỏi nằm trong iframe');
        console.log('   Thử chạy script trong iframe context');
    } else if (allInputs.length > 0) {
        console.log('⚠️ Có input nhưng không phải radio');
        console.log('   Trang có thể dùng custom element');
    } else {
        console.log('❌ Không tìm thấy input nào!');
        console.log('   Có thể:');
        console.log('   1. Trang chưa load xong');
        console.log('   2. Câu hỏi load động (AJAX)');
        console.log('   3. Cần click vào tab/button để hiện câu hỏi');
    }
    
    console.log('\n💡 HƯỚNG DẪN:');
    if (elementsWithInputs.length > 0) {
        const best = elementsWithInputs[0];
        let selector = '';
        if (best.id) {
            selector = `#${best.id}`;
        } else if (best.class) {
            const firstClass = best.class.split(' ')[0];
            selector = `.${firstClass}`;
        } else {
            selector = best.tag.toLowerCase();
        }
        console.log(`   Thử dùng selector: "${selector}"`);
    }
    
    console.log('\n📸 Copy đoạn HTML của câu hỏi:');
    console.log('   1. F12 → Elements');
    console.log('   2. Tìm câu hỏi');
    console.log('   3. Chuột phải → Copy → Copy outerHTML');
    console.log('   4. Gửi cho developer');
    
    console.log('\n' + '='.repeat(50));
    
})();
