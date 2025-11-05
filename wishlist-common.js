// 장바구니 공통 기능 - 모든 페이지에서 사용

// 장바구니 개수 업데이트 함수
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const countElement = document.querySelector('.wishlist-count');
    
    if (countElement) {
        const count = wishlist.length;
        countElement.textContent = count;
        
        if (count > 0) {
            countElement.style.display = 'flex';
        } else {
            countElement.style.display = 'none';
        }
    }
}

// 페이지 로드 시 장바구니 개수 표시
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCount();
    
    // 다른 탭에서 장바구니가 변경되었을 때도 업데이트
    window.addEventListener('storage', function(e) {
        if (e.key === 'wishlist') {
            updateWishlistCount();
        }
    });
});

// 장바구니 변경 이벤트를 감지하기 위한 커스텀 이벤트
window.addEventListener('wishlistUpdated', function() {
    updateWishlistCount();
});