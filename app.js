// State Variable
let enteredAmount = 0;
let html5QrCode = null;

// DOM Elements
const phases = {
    1: document.getElementById('phase-1'),
    2: document.getElementById('phase-2'),
    3: document.getElementById('phase-3'),
    4: document.getElementById('phase-4'),
    5: document.getElementById('phase-5')
};

const priceInput = document.getElementById('price-input');
const displayPrice = document.querySelector('.display-price');
const paidPrice = document.querySelector('.paid-price');
const paypaySound = new Audio('assets/PayPay-sound.mp3');

// Navigation Function
function goToPhase(targetPhase) {
    Object.values(phases).forEach(phase => phase.classList.add('hidden'));
    phases[targetPhase].classList.remove('hidden');

    // Auto focus on input box when reaching phase 3
    if (targetPhase === 3) {
        priceInput.value = '';
        priceInput.focus();
    }
}

// Event Listeners

// Phase 1 -> Phase 2 (Open Scanner)
document.getElementById('btn-to-scan').addEventListener('click', () => {
    goToPhase(2);
    startQrScanner();
});

// Phase 2 Cancel Button
document.getElementById('btn-cancel-scan').addEventListener('click', () => {
    stopQrScanner();
    goToPhase(1);
});

// Phase 3 -> Phase 4 (Confirm Amount)
document.getElementById('btn-to-confirm').addEventListener('click', () => {
    const amount = priceInput.value.trim();
    if (!amount || amount <= 0) {
        alert('Please enter an amount.');
        return;
    }
    enteredAmount = amount;
    displayPrice.textContent = `¥${enteredAmount}`;
    goToPhase(4);
});

// Phase 4 -> Phase 5 (Execute Payment)
document.getElementById('btn-pay').addEventListener('click', () => {
    // Rewind to start in case it was played recently
    paypaySound.currentTime = 0; 
    
    // Play the PayPay sound
    paypaySound.play().catch(err => {
        console.error("Audio playback error:", err);
    });

    paidPrice.textContent = `¥${enteredAmount}`;
    goToPhase(5);
});

// Phase 5 -> Phase 1 (Reset)
document.getElementById('btn-home').addEventListener('click', () => {
    goToPhase(1);
});

// --- QR SCANNER LOGIC ---
function startQrScanner() {
    html5QrCode = new Html5Qrcode("qr-reader");

    const config = { 
        fps: 10, 
        qrbox: { width: 220, height: 220 } 
    };

    // Camera facing back (environment)
    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(err => {
        console.error("Camera access failed:", err);
        alert("Camera permission required to scan QR codes.");
        goToPhase(1);
    });
}

function stopQrScanner() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error("Scanner stop failed:", err));
    }
}

function onScanSuccess(decodedText) {
    // Successfully scanned any QR code!
    stopQrScanner();
    goToPhase(3); // Moves directly to price input screen
}