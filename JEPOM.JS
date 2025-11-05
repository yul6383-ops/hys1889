// 찜하기 목록 관리
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// 찜하기 개수 업데이트
function updateWishlistCount() {
    const countElement = document.querySelector('.wishlist-count');
    if (countElement) {
        const count = wishlist.length;
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

// 페이지 로드 시 찜하기 상태 복원
function restoreWishlistState() {
    wishlist.forEach(item => {
        const cards = document.querySelectorAll(`[data-category="${item.category}"][data-main="${item.mainCategory}"]`);
        cards.forEach(card => {
            const productCode = card.querySelector('.product-code');
            if (productCode && productCode.textContent === item.code) {
                const favoriteBtn = card.querySelector('.favorite-btn');
                if (favoriteBtn) {
                    favoriteBtn.textContent = '♥';
                    favoriteBtn.style.color = 'red';
                }
            }
        });
    });
    updateWishlistCount();
}

// 페이지 로드시 관리자에서 추가한 제품 불러오기
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromAdmin();
    restoreWishlistState();
});

// 관리자에서 추가한 제품 로드
function loadProductsFromAdmin() {
    const saved = localStorage.getItem('hysProducts');
    const productsGrid = document.getElementById('productsGrid');
    
    if(!productsGrid) return;

    if(saved) {
        const products = JSON.parse(saved);
        
        // 저장된 제품들로 카드 추가 (기존 제품 유지)
        products.forEach(product => {
            const card = createAdminProductCard(product);
            productsGrid.appendChild(card);
        });
    }
}

// 관리자 제품 카드 생성
function createAdminProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.subCategory);
    card.setAttribute('data-main', product.mainCategory);
    card.style.display = 'none';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'https://via.placeholder.com/400x350/f5f5f5/999?text=' + encodeURIComponent(product.name)}" 
                 alt="${product.name}">
            ${product.badge ? '<span class="product-badge">NEW</span>' : ''}
            <button class="favorite-btn">♡</button>
        </div>
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-code">${product.code}</div>
        </div>
    `;
    
    return card;
}

// 아코디언 토글
function toggleAccordion(element, event) {
    event.preventDefault();
    
    const parentItem = element.closest('.main-category-item');
    const allItems = document.querySelectorAll('.main-category-item');
    const mainCategory = element.textContent.trim();
    
    // 다른 아코디언 닫기
    allItems.forEach(item => {
        if (item !== parentItem) {
            item.classList.remove('open');
            item.querySelector('.main-category-link').classList.remove('active');
        }
    });
    
    // 클릭한 아코디언 토글
    const isOpening = !parentItem.classList.contains('open');
    parentItem.classList.toggle('open');
    element.classList.toggle('active');
    
    // 아코디언을 열 때만 전체 제품 표시
    if (isOpening) {
        showAllInCategory(mainCategory);
    }
}

// 대분류의 모든 제품 표시
function showAllInCategory(mainCategory) {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        if (card.dataset.main === mainCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 카테고리 필터 기능
function filterCategory(category, event) {
    event.preventDefault();
    
    const cards = document.querySelectorAll('.product-card');
    const clickedLink = event.target;
    
    // 현재 열린 아코디언의 대분류 가져오기
    const openAccordion = document.querySelector('.main-category-item.open');
    if (!openAccordion) return;
    
    const mainCategory = openAccordion.querySelector('.main-category-link').textContent.trim();
    
    // 현재 열린 아코디언 내의 링크만 active 변경
    const links = openAccordion.querySelectorAll('.category-link, .subcategory-link');
    links.forEach(link => link.classList.remove('active'));
    
    // 클릭한 링크에 active 추가
    clickedLink.classList.add('active');
    
    // 제품 카드 필터링
    cards.forEach(card => {
        const cardMain = card.dataset.main;
        const cardCategory = card.dataset.category;
        
        if (cardMain !== mainCategory) {
            // 다른 대분류의 제품은 숨김
            card.style.display = 'none';
        } else if (category === 'all') {
            // 전체 선택 시 해당 대분류의 모든 제품 표시
            card.style.display = 'block';
        } else {
            // 특정 중분류 선택 시
            if (cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// 서브메뉴 토글 (하드웨어)
function toggleSubMenu(event) {
    event.preventDefault();
    const parentItem = event.target.closest('.category-item');
    parentItem.classList.toggle('expanded');
}

// 즐겨찾기 버튼
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('favorite-btn')) {
        e.stopPropagation();
        
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productCode = productCard.querySelector('.product-code').textContent;
        const productImage = productCard.querySelector('.product-image img').src;
        const category = productCard.dataset.category;
        const mainCategory = productCard.dataset.main;
        
        const productData = {
            name: productName,
            code: productCode,
            image: productImage,
            category: category,
            mainCategory: mainCategory
        };
        
        if (e.target.textContent === '♡') {
            // 찜하기 추가
            e.target.textContent = '♥';
            e.target.style.color = 'red';
            wishlist.push(productData);
        } else {
            // 찜하기 제거
            e.target.textContent = '♡';
            e.target.style.color = '';
            wishlist = wishlist.filter(item => item.code !== productCode);
        }
        
        // 로컬스토리지에 저장
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        
        // 커스텀 이벤트 발생 (다른 탭에서도 감지 가능)
        window.dispatchEvent(new Event('wishlistUpdated'));
    }
});

// 제품 클릭 시 모달 열기
document.addEventListener('click', function(e) {
    const productCard = e.target.closest('.product-card');
    if (productCard && !e.target.classList.contains('favorite-btn')) {
        openProductModal(productCard);
    }
});

// 제품 모달 열기
function openProductModal(productCard) {
    const productName = productCard.querySelector('.product-name').textContent;
    const productCode = productCard.querySelector('.product-code').textContent;
    const productImage = productCard.querySelector('.product-image img').src;
    const category = productCard.dataset.category;
    const mainCategory = productCard.dataset.main;
    
    // 모달 정보 채우기
    document.getElementById('modalTitle').textContent = productName;
    document.getElementById('modalSubtitle').textContent = productCode;
    document.getElementById('modalCategory').textContent = `${mainCategory} / ${category}`;
    document.getElementById('modalMainImage').src = productImage;
    
    // 기본 설명 (제품별로 다르게 설정 가능)
    let description = `${productName}은(는) 고품질 자재로 제작된 제품입니다. `;
    description += `다양한 공간에 잘 어우러지는 디자인으로 실용성과 심미성을 모두 갖추고 있습니다.`;
    document.getElementById('modalDescription').textContent = description;
    
    // SPEC 정보
    const specList = document.getElementById('modalSpec');
    specList.innerHTML = `
        <li>• 제품명 : ${productName}</li>
        <li>• 제품코드 : ${productCode}</li>
        <li>• 종류 : ${category}</li>
        <li>• 규격 : 상담 문의</li>
    `;
    
    // 찜하기 버튼 상태 설정
    const modalShareBtn = document.querySelector('.modal-btn-share');
    const isWishlisted = wishlist.some(item => item.code === productCode);
    
    if (isWishlisted) {
        modalShareBtn.innerHTML = '<span style="color: red;">♥</span> 찜하기';
        modalShareBtn.classList.add('wishlisted');
    } else {
        modalShareBtn.innerHTML = '<span>♡</span> 찜하기';
        modalShareBtn.classList.remove('wishlisted');
    }
    
    // 찜하기 버튼에 데이터 저장
    modalShareBtn.dataset.productName = productName;
    modalShareBtn.dataset.productCode = productCode;
    modalShareBtn.dataset.productImage = productImage;
    modalShareBtn.dataset.category = category;
    modalShareBtn.dataset.mainCategory = mainCategory;
    
    // 모달 표시 - display를 먼저 설정
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    document.body.style.overflow = 'hidden'; // 스크롤 방지
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복원
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeModal();
    }
};

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 공유하기 (찜하기)
function shareProduct() {
    const modalShareBtn = document.querySelector('.modal-btn-share');
    const productCode = modalShareBtn.dataset.productCode;
    const productName = modalShareBtn.dataset.productName;
    const productImage = modalShareBtn.dataset.productImage;
    const category = modalShareBtn.dataset.category;
    const mainCategory = modalShareBtn.dataset.mainCategory;
    
    const productData = {
        name: productName,
        code: productCode,
        image: productImage,
        category: category,
        mainCategory: mainCategory
    };
    
    const isWishlisted = wishlist.some(item => item.code === productCode);
    
    if (!isWishlisted) {
        // 찜하기 추가
        wishlist.push(productData);
        modalShareBtn.innerHTML = '<span style="color: red;">♥</span> 찜하기';
        modalShareBtn.classList.add('wishlisted');
        
        // 제품 카드의 하트도 업데이트
        const productCards = document.querySelectorAll(`[data-category="${category}"][data-main="${mainCategory}"]`);
        productCards.forEach(card => {
            const cardCode = card.querySelector('.product-code');
            if (cardCode && cardCode.textContent === productCode) {
                const favoriteBtn = card.querySelector('.favorite-btn');
                if (favoriteBtn) {
                    favoriteBtn.textContent = '♥';
                    favoriteBtn.style.color = 'red';
                }
            }
        });
    } else {
        // 찜하기 제거
        wishlist = wishlist.filter(item => item.code !== productCode);
        modalShareBtn.innerHTML = '<span>♡</span> 찜하기';
        modalShareBtn.classList.remove('wishlisted');
        
        // 제품 카드의 하트도 업데이트
        const productCards = document.querySelectorAll(`[data-category="${category}"][data-main="${mainCategory}"]`);
        productCards.forEach(card => {
            const cardCode = card.querySelector('.product-code');
            if (cardCode && cardCode.textContent === productCode) {
                const favoriteBtn = card.querySelector('.favorite-btn');
                if (favoriteBtn) {
                    favoriteBtn.textContent = '♡';
                    favoriteBtn.style.color = '';
                }
            }
        });
    }
    
    // 로컬스토리지에 저장
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event('wishlistUpdated'));
}

// 뷰 전환 기능
document.addEventListener('DOMContentLoaded', function() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');
    
    if(viewBtns.length > 0 && productsGrid) {
        viewBtns.forEach((btn, index) => {
            btn.addEventListener('click', function() {
                // 모든 버튼에서 active 제거
                viewBtns.forEach(b => b.classList.remove('active'));
                
                // 클릭한 버튼에 active 추가
                this.classList.add('active');
                
                // 그리드 레이아웃 변경
                if (index === 0) {
                    // 2열 보기
                    productsGrid.classList.remove('grid-4');
                } else {
                    // 4열 보기
                    productsGrid.classList.add('grid-4');
                }
            });
        });
    }
});