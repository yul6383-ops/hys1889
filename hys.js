const galleryContainer = document.querySelector('.gallery-container');
const galleryTrack = document.querySelector('.gallery-track');

let isDragging = false;
let startX;
let scrollLeft;
let velocity = 0;
let animationID;
let snapTimeout;
let lastX = 0;
let lastTime = Date.now();

const realItems = 6;
const cloneCount = 3;
const MAX_VELOCITY = 30;

// 초기 위치 설정
function initPosition() {
    const items = document.querySelectorAll('.gallery-item');
    if (items.length > 0) {
        const firstRealItem = items[cloneCount];
        const initialPosition = -firstRealItem.offsetLeft;
        galleryTrack.style.transform = `translateX(${initialPosition}px)`;
        requestAnimationFrame(() => updateActiveImage());
    }
}

// 무한 루프 체크 (개선)
function checkInfiniteLoop() {
    if (isDragging) return;
    
    const items = document.querySelectorAll('.gallery-item');
    if (items.length === 0) return;
    
    const currentX = getTranslateX(galleryTrack);
    const itemWidth = items[0].offsetWidth;
    const gap = 20;
    const slideWidth = itemWidth + gap;
    
    // 첫 번째 실제 이미지의 위치
    const firstRealItemOffset = items[cloneCount].offsetLeft;
    
    // 오른쪽 끝을 넘어갔을 때 (첫 번째 복제본보다 오른쪽)
    if (currentX > -firstRealItemOffset + slideWidth) {
        const offset = slideWidth * realItems;
        galleryTrack.style.transition = 'none';
        galleryTrack.style.transform = `translateX(${currentX - offset}px)`;
        scrollLeft = currentX - offset;
    }
    
    // 왼쪽 끝을 넘어갔을 때 (마지막 복제본보다 왼쪽)
    const lastRealItemOffset = items[cloneCount + realItems - 1].offsetLeft;
    if (currentX < -lastRealItemOffset - slideWidth) {
        const offset = slideWidth * realItems;
        galleryTrack.style.transition = 'none';
        galleryTrack.style.transform = `translateX(${currentX + offset}px)`;
        scrollLeft = currentX + offset;
    }
}

// 중앙 이미지 강조
let updateTimeout;
function updateActiveImage() {
    if (updateTimeout) return;
    
    updateTimeout = setTimeout(() => {
        const items = document.querySelectorAll('.gallery-item');
        const containerCenter = galleryContainer.offsetWidth / 2;
        const currentX = getTranslateX(galleryTrack);
        
        items.forEach(item => {
            const itemLeft = item.offsetLeft;
            const itemCenter = itemLeft + (item.offsetWidth / 2);
            const itemPosition = itemCenter + currentX;
            const distance = Math.abs(containerCenter - itemPosition);
            
            if (distance < item.offsetWidth / 2) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        updateTimeout = null;
    }, 16);
}

galleryContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - galleryContainer.offsetLeft;
    scrollLeft = getTranslateX(galleryTrack);
    lastX = e.pageX;
    lastTime = Date.now();
    cancelAnimationFrame(animationID);
    clearTimeout(snapTimeout);
    velocity = 0;
    galleryTrack.style.transition = 'none';
});

galleryContainer.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        applyMomentum();
    }
});

galleryContainer.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        applyMomentum();
    }
});

galleryContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    clearTimeout(snapTimeout);
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime < 16) return;
    
    const x = e.pageX - galleryContainer.offsetLeft;
    const deltaX = e.pageX - lastX;
    const walk = (x - startX) * 1.2;
    
    velocity = deltaX * 0.8;
    velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
    
    const newPosition = scrollLeft + walk;
    galleryTrack.style.transform = `translateX(${newPosition}px)`;
    
    lastX = e.pageX;
    lastTime = currentTime;
    
    requestAnimationFrame(() => {
        updateActiveImage();
    });
});

// 모멘텀 효과
function applyMomentum() {
    const friction = 0.92;
    
    function animate() {
        if (Math.abs(velocity) > 0.3) {
            velocity *= friction;
            
            const currentX = getTranslateX(galleryTrack);
            const newPosition = currentX + velocity;
            
            galleryTrack.style.transform = `translateX(${newPosition}px)`;
            
            checkInfiniteLoop();
            updateActiveImage();
            
            animationID = requestAnimationFrame(animate);
        } else {
            velocity = 0;
            checkInfiniteLoop(); // 마지막에 한 번 더 체크
            if (window.innerWidth <= 1200) {
                snapTimeout = setTimeout(() => {
                    snapToNearest();
                }, 250);
            }
        }
    }
    
    animate();
}

// 가장 가까운 이미지로 스냅
function snapToNearest() {
    if (window.innerWidth > 1200) return;
    
    const items = document.querySelectorAll('.gallery-item');
    const currentX = getTranslateX(galleryTrack);
    const containerCenter = galleryContainer.offsetWidth / 2;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    items.forEach((item, index) => {
        const itemLeft = item.offsetLeft;
        const itemCenter = itemLeft + (item.offsetWidth / 2);
        const itemPosition = itemCenter + currentX;
        const distance = Math.abs(containerCenter - itemPosition);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    
    const targetItem = items[closestIndex];
    const targetPosition = containerCenter - (targetItem.offsetLeft + targetItem.offsetWidth / 2);
    
    galleryTrack.style.transition = 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
    galleryTrack.style.transform = `translateX(${targetPosition}px)`;
    
    setTimeout(() => {
        galleryTrack.style.transition = 'none';
        checkInfiniteLoop();
        updateActiveImage();
    }, 400);
}

function getTranslateX(element) {
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m41;
}

// 터치 디바이스 지원
let lastTouchX = 0;
let lastTouchTime = Date.now();

galleryContainer.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - galleryContainer.offsetLeft;
    scrollLeft = getTranslateX(galleryTrack);
    lastTouchX = e.touches[0].pageX;
    lastTouchTime = Date.now();
    cancelAnimationFrame(animationID);
    clearTimeout(snapTimeout);
    velocity = 0;
    galleryTrack.style.transition = 'none';
});

galleryContainer.addEventListener('touchend', () => {
    if (isDragging) {
        isDragging = false;
        applyMomentum();
    }
});

galleryContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    clearTimeout(snapTimeout);
    
    const currentTime = Date.now();
    const deltaTime = currentTime - lastTouchTime;
    
    if (deltaTime < 16) return;
    
    const x = e.touches[0].pageX - galleryContainer.offsetLeft;
    const deltaX = e.touches[0].pageX - lastTouchX;
    const walk = (x - startX) * 1.2;
    
    velocity = deltaX * 0.8;
    velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity));
    
    const newPosition = scrollLeft + walk;
    galleryTrack.style.transform = `translateX(${newPosition}px)`;
    
    lastTouchX = e.touches[0].pageX;
    lastTouchTime = currentTime;
    
    requestAnimationFrame(() => {
        updateActiveImage();
    });
});

// 페이지 로드 시 초기화
window.addEventListener('load', () => {
    setTimeout(() => {
        initPosition();
    }, 100);
});

// 제품 카드 클릭 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            const productName = card.querySelector('h3').textContent.replace(' ⓘ', '');
            alert(`${productName} 상세 페이지로 이동합니다.`);
        });
    });
});