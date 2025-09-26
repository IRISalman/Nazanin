// --- Constants ---
const TARGET_YEAR = 2025;
const TARGET_MONTH = 9; 
const TARGET_DAY = 27;

const START_YEAR = 2007;

// Days in each month (for non-leap year 2025)
const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// HTML Elements
const yearEl = document.getElementById('year-counter');
const monthEl = document.getElementById('month-counter');
const dayEl = document.getElementById('day-counter');

const timerDisplayEl = document.querySelector('.timer-display'); 
const monthUnit = document.getElementById('month-unit');
const dayUnit = document.getElementById('day-unit');

// Final Message Elements
const finalMessageContainer = document.getElementById('final-message-container');
const originalMessageEl = document.getElementById('original-message');
const crossedOutMessageEl = document.getElementById('crossed-out-message');
const dateMessageEl = document.getElementById('date-message');
const crossOutLineEl = document.getElementById('cross-out-line');


// --- Helper Functions ---
function formatNumber(num) {
    return String(num).padStart(2, '0');
}

function animateValueChange(element, newValue, duration, ease = "power2.inOut") {
    gsap.to(element, {
        duration: duration / 2, 
        y: -10,
        opacity: 0,
        ease: "power2.in",
        onComplete: () => {
             element.textContent = formatNumber(newValue); 
             gsap.set(element, { y: 10 }); 
             
             gsap.to(element, { 
                duration: duration / 2,
                y: 0,
                opacity: 1,
                ease: "power2.out",
             });
        }
    });
}

// تابع برای افکت تایپ نوشتاری
function typeEffect(element, textToType, duration) {
    const timePerChar = duration / textToType.length;
    let typedText = '';
    let charIndex = 0;

    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (charIndex < textToType.length) {
                typedText += textToType.charAt(charIndex);
                element.textContent = typedText;
                charIndex++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, timePerChar * 1000); 
    });
}


// --- GSAP Timeline Logic ---
const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

// --- Initial Setup (Hiding all final message elements) ---
gsap.set([monthUnit, dayUnit], { opacity: 0, scale: 0.8, visibility: 'hidden' }); 
gsap.set(finalMessageContainer, { opacity: 0, scale: 0.8, visibility: 'hidden' }); 
gsap.set(crossedOutMessageEl, { opacity: 0, visibility: 'hidden' });
gsap.set(dateMessageEl, { opacity: 0, visibility: 'hidden' }); 
gsap.set(crossOutLineEl, { width: 0, opacity: 0, visibility: 'hidden' }); 
// برای افکت تایپ، متن نهایی را در ابتدا خالی می‌کنیم
crossedOutMessageEl.textContent = ''; 

yearEl.textContent = START_YEAR;
monthEl.textContent = '01';
dayEl.textContent = '01';


// 1. Year Count Phase (2007 to 2025): 15 seconds
const YEAR_COUNT_DURATION = 15;
const YEARS_TO_COUNT = TARGET_YEAR - START_YEAR;
const YEAR_STEP_DURATION = YEAR_COUNT_DURATION / YEARS_TO_COUNT;

let currentYear = START_YEAR;

for (let i = 0; i < YEARS_TO_COUNT; i++) {
    tl.add(function() {
        currentYear++;
        animateValueChange(yearEl, currentYear, YEAR_STEP_DURATION);
    }, `+=${i === 0 ? 0 : YEAR_STEP_DURATION}`); 
}

// 2. Month/Day Reveal and Position Shift Phase (at 15 second mark)
tl.add(function() {
    
    gsap.to(timerDisplayEl, { duration: 0.8, y: -30, ease: "power2.out" });
    
    gsap.to([monthUnit, dayUnit], { 
        duration: 0.5, 
        opacity: 1, 
        scale: 1,
        visibility: 'visible', 
        ease: "back.out(1.7)" 
    });
    
    animateValueChange(yearEl, TARGET_YEAR, 0.1);

}, ">"); 


// 3. Synchronized Calendar Count Phase (10 seconds)
const CALENDAR_COUNT_DURATION = 10; 
const DAYS_TO_SIMULATE = 270; 

let currentMonth = 1;
let currentDay = 1;
let lastProgressFloor = 0;

const calendarSim = { dayProgress: 0 };

tl.add(function() {
    gsap.to(calendarSim, {
        dayProgress: DAYS_TO_SIMULATE,
        duration: CALENDAR_COUNT_DURATION,
        ease: "none", 
        onUpdate: function() {
            const progressFloor = Math.floor(calendarSim.dayProgress);
            
            if (progressFloor > lastProgressFloor) {
                currentDay++;
                
                // Calendar logic
                if (currentDay > DAYS_IN_MONTH[currentMonth]) {
                    if (currentMonth === TARGET_MONTH && currentDay > TARGET_DAY) {
                        currentDay = TARGET_DAY; 
                    } 
                    else {
                        currentDay = 1; 
                        currentMonth++; 
                        if (currentMonth > TARGET_MONTH) {
                            currentMonth = TARGET_MONTH;
                        }
                    }
                }
                
                animateValueChange(dayEl, currentDay, 0.1); 
                animateValueChange(monthEl, currentMonth, 0.1);
                
                lastProgressFloor = progressFloor;
            }
        },
        onComplete: function() {
            // Final stabilization
            animateValueChange(dayEl, TARGET_DAY, 0.1);
            animateValueChange(monthEl, TARGET_MONTH, 0.1);

            // --- FINAL REVEAL ANIMATION (THE WEDNESDAY EFFECT) ---
            
            // Step 1: Reveal the main message container
            gsap.to(finalMessageContainer, { 
                duration: 0.5, 
                opacity: 1, 
                scale: 1, 
                visibility: 'visible' 
            });

            // Step 2: Show original message
            gsap.set(originalMessageEl, { opacity: 1, visibility: 'visible', display: 'block' });

            // Calculate position of the line dynamically
            const originalMessageRect = originalMessageEl.getBoundingClientRect();
            const containerRect = finalMessageContainer.getBoundingClientRect();

            gsap.set(crossOutLineEl, {
                width: 0, 
                x: originalMessageRect.left - containerRect.left + (originalMessageRect.width / 2), 
                y: originalMessageRect.top - containerRect.top + (originalMessageRect.height / 2),
                opacity: 1,
                visibility: 'visible',
                display: 'block' 
            });
            
            // GSAP Timeline for the final text reveal
            const textRevealTl = gsap.timeline();

            // Step 3: Draw the cross-out line
            textRevealTl.to(crossOutLineEl, {
                duration: 0.4,
                width: originalMessageRect.width + 10, 
                ease: "power2.inOut",
            })
            // Step 4: Fade out original text
            .to(originalMessageEl, { 
                duration: 0.3, 
                opacity: 0,
                onComplete: () => { gsap.set(originalMessageEl, { visibility: 'hidden', display: 'none' }); } 
            }, "+=0.1") 
            .to(crossOutLineEl, { 
                duration: 0.3, 
                opacity: 0,
                onComplete: () => { gsap.set(crossOutLineEl, { visibility: 'hidden', display: 'none' }); }
            }, "<")
            
            // Step 5: **افکت تایپ** متن نهایی (Birthday yes, Happy never)
            .add(function() {
                const finalWednesdayText = "💀 Birthday yes, Happy never 🖤";
                gsap.set(crossedOutMessageEl, { opacity: 1, visibility: 'visible' }); 
                
                // 1.5 ثانیه زمان برای تایپ
                return typeEffect(crossedOutMessageEl, finalWednesdayText, 1.5);
                
            }, "+=0.2") // 0.2 ثانیه تأخیر پس از محو شدن
            
            // Step 6: نمایش تاریخ
            .to(dateMessageEl, { 
                duration: 0.5, 
                opacity: 1,
                visibility: 'visible' 
            }, ">"); // بلافاصله بعد از اتمام تایپ

        }
    });

}, ">"); 

// --- Run Animation ---
window.onload = () => {
    tl.play();
};
