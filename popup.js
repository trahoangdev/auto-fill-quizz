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

// Call Gemini API
async function callGeminiAPI(apiKey, questions) {
    console.log('[AI] === START callGeminiAPI ===');
    console.log('[AI] API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');
    console.log('[AI] Questions count:', questions.length);
    
    // REST API endpoint cho Gemini - Dùng gemini-2.5-flash với maxOutputTokens cao
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    console.log('[AI] API URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));
    
    // Tạo prompt với đủ thông tin để AI trả lời chính xác
    const prompt = questions.map((q, i) => {
        const multi = q.type === 'checkbox' ? ' [MULTI-SELECT]' : '';
        const questionText = q.question.substring(0, 200); // Tăng lên 200 ký tự
        const options = q.options.map((opt, j) => {
            const optText = opt.substring(0, 150); // Tăng lên 150 ký tự
            return `${String.fromCharCode(65 + j)}. ${optText}`;
        }).join('\n');
        
        return `Question ${i+1}${multi}:\n${questionText}\n\nOptions:\n${options}\n\nAnswer (letter only):`;
    }).join('\n\n---\n\n');
    
    console.log('[AI] Prompt length:', prompt.length);
    console.log('[AI] Prompt preview:', prompt.substring(0, 200) + '...');
    
    try {
        console.log('[AI] === FETCHING API ===');
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{
                        text: "You are an expert quiz assistant. Read each question carefully and select the MOST CORRECT answer based on the content provided. For single-choice questions, respond with ONE letter (A, B, C, or D). For MULTI-SELECT questions, respond with multiple letters if needed (e.g., AB, ACD). ONLY respond with the letter(s), no explanation."
                    }]
                },
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,  // Tăng nhẹ để linh hoạt hơn
                    maxOutputTokens: 2000,  // Tăng cao hơn nữa
                    candidateCount: 1,
                    topP: 0.95,
                    topK: 40
                }
            })
        });
        
        console.log('[AI] Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[AI] Error response:', errorText);
            let errorMessage = 'API request failed';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch (e) {
                errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('[AI] Response data:', JSON.stringify(data, null, 2));
        
        // Kiểm tra finishReason
        if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
            console.error('[AI] ❌ Response was cut off due to MAX_TOKENS');
            throw new Error('AI response was cut off. Try reducing the number of questions per batch.');
        }
        
        // Kiểm tra các trường hợp response khác nhau
        let answer = null;
        
        // Thử nhiều cách parse response
        try {
            // Cách 1: Standard Gemini response
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                answer = data.candidates[0].content.parts[0].text;
                console.log('[AI] Found answer via: candidates[0].content.parts[0].text');
            }
            // Cách 2: Alternative structure
            else if (data.candidates?.[0]?.output) {
                answer = data.candidates[0].output;
                console.log('[AI] Found answer via: candidates[0].output');
            }
            // Cách 3: Direct text
            else if (data.candidates?.[0]?.text) {
                answer = data.candidates[0].text;
                console.log('[AI] Found answer via: candidates[0].text');
            }
            // Cách 4: Response text
            else if (data.text) {
                answer = data.text;
                console.log('[AI] Found answer via: data.text');
            }
            // Cách 5: Response content
            else if (data.content) {
                answer = data.content;
                console.log('[AI] Found answer via: data.content');
            }
            // Cách 6: Response message
            else if (data.message) {
                answer = data.message;
                console.log('[AI] Found answer via: data.message');
            }
            // Cách 7: Gemini 2.0 structure
            else if (data.candidates?.[0]?.message?.content) {
                answer = data.candidates[0].message.content;
                console.log('[AI] Found answer via: candidates[0].message.content');
            }
        } catch (e) {
            console.error('[AI] Error parsing response:', e);
        }
        
        if (!answer) {
            console.error('[AI] ❌ No answer found in response structure');
            console.error('[AI] Response keys:', Object.keys(data));
            if (data.candidates && data.candidates[0]) {
                console.error('[AI] Candidate keys:', Object.keys(data.candidates[0]));
                if (data.candidates[0].content) {
                    console.error('[AI] Content keys:', Object.keys(data.candidates[0].content));
                }
            }
            console.error('[AI] Full response:', data);
            
            // Thử stringify toàn bộ để tìm text
            const fullText = JSON.stringify(data);
            console.error('[AI] Full response as string:', fullText);
            
            throw new Error('No answer from AI. Response structure: ' + Object.keys(data).join(', '));
        }
        
        answer = answer.trim();
        console.log('[AI] ✅ Raw answer:', answer);
        
        // Clean up answer - chỉ lấy phần đáp án
        let cleanAnswer = answer
            .replace(/```/g, '')
            .replace(/\n/g, '')
            .replace(/đáp án:/gi, '')
            .replace(/answer:/gi, '')
            .replace(/:/g, '')
            .trim();
        
        // Tìm pattern đáp án
        const match = cleanAnswer.match(/([A-F0-9,]+)/i);
        if (match) {
            cleanAnswer = match[1];
        }
        
        console.log('[AI] Clean answer:', cleanAnswer);
        
        // Validate format
        if (!/^[A-F0-9,]+$/i.test(cleanAnswer)) {
            console.warn('[AI] Answer format invalid:', cleanAnswer);
            throw new Error('Invalid answer format from AI: ' + cleanAnswer);
        }
        
        return cleanAnswer.toUpperCase();
        
    } catch (error) {
        console.error('[AI] Gemini API Error:', error);
        throw error;
    }
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
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // Save last tab
            chrome.storage.local.set({ lastTab: targetTab });
        });
    });
    
    // Restore last tab
    chrome.storage.local.get(['lastTab'], (result) => {
        if (result.lastTab) {
            const tab = document.querySelector(`.tab[data-tab="${result.lastTab}"]`);
            if (tab) tab.click();
        }
    });
    
    // Manual tab elements
    const answersInput = document.getElementById('answers');
    const openIframeBtn = document.getElementById('openIframeBtn');
    const fillBtn = document.getElementById('fillBtn');
    
    // AI tab elements
    const apiKeyInput = document.getElementById('apiKey');
    const questionInput = document.getElementById('questionInput');
    const askAiBtn = document.getElementById('askAiBtn');
    const singleAnswerDiv = document.getElementById('singleAnswer');
    const aiAnswersInput = document.getElementById('aiAnswers');
    const fillAiBtn = document.getElementById('fillAiBtn');
    const clearAiBtn = document.getElementById('clearAiBtn');
    
    // Load saved data
    chrome.storage.local.get(['lastAnswers', 'lastAiAnswers', 'geminiApiKey'], (result) => {
        if (result.lastAnswers) {
            answersInput.value = result.lastAnswers;
        }
        if (result.lastAiAnswers) {
            aiAnswersInput.value = result.lastAiAnswers;
        }
        if (result.geminiApiKey) {
            apiKeyInput.value = result.geminiApiKey;
        }
    });
    
    // Save API key when changed
    apiKeyInput.addEventListener('change', () => {
        chrome.storage.local.set({ geminiApiKey: apiKeyInput.value });
    });
    
    // Auto-save AI answers when user types
    aiAnswersInput.addEventListener('input', () => {
        chrome.storage.local.set({ lastAiAnswers: aiAnswersInput.value });
    });
    
    // Clear AI answers
    clearAiBtn.addEventListener('click', () => {
        if (confirm('Xóa tất cả đáp án đã lưu?')) {
            aiAnswersInput.value = '';
            chrome.storage.local.set({ lastAiAnswers: '' });
            showStatus('✅ Đã xóa đáp án!', 'success');
        }
    });
    
    answersInput.focus();
    answersInput.select();
    
    // Ask AI for single question
    askAiBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const questionText = questionInput.value.trim();
        
        if (!apiKey) {
            showStatus('❌ Vui lòng nhập Gemini API Key!', 'error');
            apiKeyInput.focus();
            return;
        }
        
        if (!questionText) {
            showStatus('❌ Vui lòng paste câu hỏi vào!', 'error');
            questionInput.focus();
            return;
        }
        
        try {
            showStatus('🤖 Đang hỏi AI...', 'info');
            singleAnswerDiv.style.display = 'none';
            
            // Tạo prompt đơn giản cho 1 câu hỏi
            const prompt = `${questionText}\n\nAnswer with ONLY the letter (A, B, C, or D). If multiple answers, combine them (e.g., AB, ACD).`;
            
            const answer = await callGeminiAPI(apiKey, [{
                question: questionText,
                options: ['A', 'B', 'C', 'D'],
                type: 'radio'
            }]);
            
            if (answer) {
                singleAnswerDiv.textContent = `Đáp án: ${answer}`;
                singleAnswerDiv.style.display = 'block';
                
                // Auto append to AI answers input
                const currentAnswers = aiAnswersInput.value.trim();
                if (currentAnswers) {
                    aiAnswersInput.value = currentAnswers + ',' + answer;
                } else {
                    aiAnswersInput.value = answer;
                }
                
                // Save to storage immediately
                chrome.storage.local.set({ lastAiAnswers: aiAnswersInput.value });
                
                // Highlight the answers input briefly
                aiAnswersInput.style.background = '#d4edda';
                aiAnswersInput.style.borderColor = '#28a745';
                setTimeout(() => {
                    aiAnswersInput.style.background = '';
                    aiAnswersInput.style.borderColor = '';
                }, 500);
                
                showStatus(`✅ Đã thêm "${answer}" vào đáp án!`, 'success');
                
                // Clear question input for next question
                questionInput.value = '';
                questionInput.focus();
            } else {
                showStatus('❌ AI không thể trả lời!', 'error');
            }
            
        } catch (error) {
            const errorMsg = error.message || error.toString();
            showStatus('❌ Lỗi: ' + errorMsg, 'error');
            console.error('[Single Q] Error:', error);
        }
    });
    
    // AI Answer button (old - keep for backward compatibility)
    const aiAnswerBtn = document.getElementById('aiAnswerBtn');
    if (aiAnswerBtn) {
        aiAnswerBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        
        console.log('[DEBUG] AI button clicked');
        console.log('[DEBUG] API Key length:', apiKey.length);
        
        if (!apiKey) {
            showStatus('❌ Vui lòng nhập Gemini API Key!', 'error');
            apiKeyInput.focus();
            return;
        }
        
        try {
            showStatus('🤖 Đang quét câu hỏi...', 'info');
            console.log('[DEBUG] Getting active tab...');
            
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('[DEBUG] Tab:', tab.id, tab.url);
            
            // Inject script to extract questions
            console.log('[DEBUG] Extracting questions...');
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractQuestions
            });
            
            const questions = results[0].result;
            console.log('[DEBUG] Questions found:', questions ? questions.length : 0);
            console.log('[DEBUG] Questions:', questions);
            
            if (!questions || questions.length === 0) {
                showStatus('❌ Không tìm thấy câu hỏi!', 'error');
                alert('Không tìm thấy câu hỏi trên trang!\n\nĐảm bảo trang có radio buttons hoặc checkboxes.');
                return;
            }
            
            showStatus(`🤖 Đang hỏi AI (${questions.length} câu)...`, 'info');
            console.log('[DEBUG] Calling Gemini API...');
            
            // Chia nhỏ câu hỏi thành batch 1 câu (gemini-2.5-flash có thinking tokens)
            const batchSize = 1;
            const allAnswers = [];
            
            for (let i = 0; i < questions.length; i += batchSize) {
                const batch = questions.slice(i, i + batchSize);
                const batchNum = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(questions.length / batchSize);
                
                showStatus(`🤖 Đang hỏi AI batch ${batchNum}/${totalBatches} (${batch.length} câu)...`, 'info');
                console.log(`[DEBUG] Processing batch ${batchNum}/${totalBatches}`);
                
                const batchAnswers = await callGeminiAPI(apiKey, batch);
                console.log(`[DEBUG] Batch ${batchNum} answers:`, batchAnswers);
                
                allAnswers.push(batchAnswers);
                
                // Đợi 1 giây giữa các batch để tránh rate limit
                if (i + batchSize < questions.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            const answers = allAnswers.join(',');
            console.log('[DEBUG] All answers received:', answers);
            
            if (answers) {
                answersInput.value = answers;
                await chrome.storage.local.set({ lastAnswers: answers });
                showStatus(`✅ AI đã trả lời! (${answers.split(',').length} đáp án)`, 'success');
                fillBtn.focus();
            } else {
                showStatus('❌ AI không thể trả lời!', 'error');
                alert('AI không trả về đáp án!\n\nKiểm tra Console để biết chi tiết.');
            }
            
        } catch (error) {
            const errorMsg = error.message || error.toString();
            showStatus('❌ Lỗi: ' + errorMsg, 'error');
            console.error('[DEBUG] AI Error:', error);
            console.error('[DEBUG] Error stack:', error.stack);
            alert('Lỗi: ' + errorMsg + '\n\nXem Console để biết chi tiết.');
        }
        });
    }
    
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
    
    // Fill answers button (Manual tab)
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
    
    // Fill answers button (AI tab)
    fillAiBtn.addEventListener('click', async () => {
        const answers = aiAnswersInput.value.trim();

        if (!answers) {
            showStatus('❌ Vui lòng nhập đáp án!', 'error');
            aiAnswersInput.focus();
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
    
    // Keyboard shortcuts
    questionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            askAiBtn.click();
        }
    });
    
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
