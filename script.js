let flashcards = [];
let currentIndex = 0;
let currentHSK = 'hsk1';

let responses = JSON.parse(localStorage.getItem('responses_v1') || '[]');
let writeIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => showPage(btn.dataset.page));
    });

    window.card = document.getElementById('card');
    window.front = document.getElementById('front');
    window.back = document.getElementById('back');

    const checkBtn = document.getElementById('checkBtn');
    if (checkBtn) checkBtn.addEventListener('click', checkAnswer);
    const setTargetBtn = document.getElementById('setTargetBtn');
    if (setTargetBtn) setTargetBtn.addEventListener('click', () => {
        const v = prompt('Nhập từ Trung làm chuẩn (ví dụ: 你好)');
        if (v !== null) {
            document.getElementById('targetDisplay').textContent = v.trim() || '—';
            alert('Đã đặt từ gốc: ' + (v.trim() || '—'));
        }
    });

    const clearBtn = document.getElementById('clearResponses');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        responses = [];
        saveResponses();
        renderResponses();
    });

    const useBtn = document.getElementById('useAsTarget');
    if (useBtn) useBtn.addEventListener('click', () => {
        if (flashcards.length) {
            const hanzi = flashcards[currentIndex].hanzi || '';
            document.getElementById('targetDisplay').textContent = hanzi || '—';
            document.getElementById('writeMeaning').textContent = flashcards[currentIndex].meaning || '';
            document.getElementById('writePinyin').textContent = flashcards[currentIndex].pinyin || '';
                    showPage('write');
                }
            });

    // write page controls
    const randomChk = document.getElementById('randomFromHSK');
    const autoNextChk = document.getElementById('autoNext');
    const nextRandomBtn = document.getElementById('nextRandomBtn');
    if (nextRandomBtn) nextRandomBtn.addEventListener('click', pickRandomForWrite);

    // display toggles (write page)
    const showHanzi = document.getElementById('showHanzi');
    const showPinyin = document.getElementById('showPinyin');
    const showMeaning = document.getElementById('showMeaning');
    function updateDisplays() {
        const targetEl = document.getElementById('targetDisplay');
        const pinyinEl = document.getElementById('writePinyin');
        const meaningEl = document.getElementById('writeMeaning');
        if (targetEl) targetEl.style.display = (showHanzi && showHanzi.checked) ? '' : 'none';
        if (pinyinEl) pinyinEl.style.display = (showPinyin && showPinyin.checked) ? '' : 'none';
        if (meaningEl) meaningEl.style.display = (showMeaning && showMeaning.checked) ? '' : 'none';
    }
    if (showHanzi) showHanzi.addEventListener('change', updateDisplays);
    if (showPinyin) showPinyin.addEventListener('change', updateDisplays);
    if (showMeaning) showMeaning.addEventListener('change', updateDisplays);
    // defaults: only meaning shown
    if (showHanzi) showHanzi.checked = false;
    if (showPinyin) showPinyin.checked = false;
    if (showMeaning) showMeaning.checked = true;
    setTimeout(updateDisplays, 30);

    loadHSK(currentHSK);
    renderResponses();
});

async function loadHSK(level) {
    try {
        const res = await fetch(level + '.json');
        flashcards = await res.json();
        currentIndex = 0;
        showCard();
        // if user is on write page and wants random, pick one
        const rp = document.getElementById('randomFromHSK');
        const writePage = document.getElementById('write');
            if (rp && rp.checked && writePage && writePage.style.display !== 'none') pickRandomForWrite();
    } catch (err) {
        console.warn('Không tìm thấy', level, err);
        flashcards = [];
        currentIndex = 0;
    }
}

function showCard() {
    if (!front || flashcards.length === 0) return;
    front.textContent = flashcards[currentIndex].hanzi || '';
    back.innerHTML = `\n    <p><strong>${flashcards[currentIndex].pinyin || ''}</strong></p>\n    <p>${flashcards[currentIndex].meaning || ''}</p>\n  `;
    card.classList.remove('flip');
}

function nextCard() {
    if (!flashcards.length) return;
    currentIndex = (currentIndex + 1) % flashcards.length;
    showCard();
}

function prevCard() {
    if (!flashcards.length) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    showCard();
}

function randomCard() {
    if (!flashcards.length) return;
    currentIndex = Math.floor(Math.random() * flashcards.length);
    showCard();
}

function changeHSK() {
    currentHSK = document.getElementById('hskSelect').value;
    loadHSK(currentHSK);
}

if (typeof card !== 'undefined' && card) card.addEventListener('click', () => card.classList.toggle('flip'));

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    const el = document.getElementById(id);
    if (el) el.style.display = '';
        // when showing write page, if random enabled pick one
        if (id === 'write') {
            const rp = document.getElementById('randomFromHSK');
            if (rp && rp.checked) pickRandomForWrite();
        }
}

function checkAnswer() {
    const target = (document.getElementById('targetDisplay').textContent || '').trim();
    const user = (document.getElementById('userInput').value || '').trim();
    const resultEl = document.getElementById('result');
    if (!target) { resultEl.textContent = 'Vui lòng đặt "Từ gốc" để so sánh.'; return; }

    const correct = target === user;
    const entry = { timestamp: Date.now(), target, user, correct };
    responses.unshift(entry);
    saveResponses();
    renderResponses();

    if (correct) { resultEl.textContent = 'Đúng! ✅'; resultEl.className = 'result ok'; }
    else { resultEl.textContent = `Sai. ❌ Đáp án: ${target}`; resultEl.className = 'result bad'; }

        // Auto-next behavior: if autoNext checked and randomFromHSK checked, pick another random
        const autoNext = document.getElementById('autoNext');
        const randomChk = document.getElementById('randomFromHSK');
        if (autoNext && autoNext.checked && randomChk && randomChk.checked && flashcards.length) {
            setTimeout(() => {
                pickRandomForWrite();
            }, 400);
        }
}

function pickRandomForWrite() {
    if (!flashcards || !flashcards.length) return;
    const idx = Math.floor(Math.random() * flashcards.length);
    writeIndex = idx;
    const card = flashcards[idx];
    document.getElementById('targetDisplay').textContent = card.hanzi || '';
    document.getElementById('writeMeaning').textContent = card.meaning || '';
    document.getElementById('writePinyin').textContent = card.pinyin || '';
    const userIn = document.getElementById('userInput');
    if (userIn) { userIn.value = ''; userIn.focus(); }
    const resultEl = document.getElementById('result'); if (resultEl) resultEl.textContent = '';
}

function saveResponses() { localStorage.setItem('responses_v1', JSON.stringify(responses.slice(0,200))); }

function renderResponses() {
    const list = document.getElementById('responsesList');
    if (!list) return;
    if (!responses.length) { list.innerHTML = 'Chưa có phản hồi nào.'; return; }
    list.innerHTML = responses.map(r => {
        const d = new Date(r.timestamp).toLocaleString();
        return `<div class="resp-item"><strong>${r.correct ? 'Đúng' : 'Sai'}</strong> — <span class="resp-target">${r.target}</span> | <span class="resp-user">${r.user}</span> <small class="muted">${d}</small></div>`;
    }).join('');
}

