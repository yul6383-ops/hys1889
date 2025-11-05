// 관리자 페이지 JavaScript

// 카테고리 데이터
const categories = {
    '합판': ['일반합판', '코팅합판', '방수합판'],
    'MDF': ['일반MDF', '고밀도MDF'],
    '각목': ['소나무각목', 'SPF각목'],
    '구조목': ['집성목', 'LVL'],
    '도어': ['아펠도어', 'ABS도어', '멤브레인도어', '타공도어', '키즈도어', '기능성도어', '핸들', '경첩', '부자재', '도어시스템', '도어프레임'],
    '몰딩': ['걸레받이', '문선', '코너몰딩']
};

// 제품 데이터 배열
let products = [];
let editingProductId = null;

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateDashboard();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 제품 추가 폼
    document.getElementById('addProductForm').addEventListener('submit', handleProductSubmit);
    
    // 이미지 업로드
    document.getElementById('imageInput').addEventListener('change', previewImage);
    
    // 검색
    document.getElementById('searchInput').addEventListener('keyup', searchProducts);
    
    // 필터
    document.getElementById('filterCategory').addEventListener('change', filterProducts);
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // 탭별 동작
    if(tabName === 'manage') {
        displayProducts();
    } else if(tabName === 'dashboard') {
        updateDashboard();
    } else if(tabName === 'add') {
        resetForm();
    }
}

// 소분류 업데이트
function updateSubCategories() {
    const mainCat = document.getElementById('mainCategory').value;
    const subCatSelect = document.getElementById('subCategory');
    
    subCatSelect.innerHTML = '<option value="">선택하세요</option>';
    
    if(mainCat && categories[mainCat]) {
        categories[mainCat].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            option.textContent = sub;
            subCatSelect.appendChild(option);
        });
    }
}

// 이미지 미리보기
function previewImage(event) {
    const file = event.target.files[0];
    if(file) {
        // 파일 크기 체크 (5MB)
        if(file.size > 5 * 1024 * 1024) {
            showAlert('이미지 파일은 5MB 이하여야 합니다.', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `
                <div class="image-preview-item">
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-btn" onclick="removeImage()" type="button">×</button>
                </div>
            `;
        }
        reader.readAsDataURL(file);
    }
}

// 이미지 제거
function removeImage() {
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imageInput').value = '';
}

// 제품 추가/수정 처리
function handleProductSubmit(e) {
    e.preventDefault();
    
    const imagePreview = document.getElementById('imagePreview').querySelector('img');
    if(!imagePreview && !editingProductId) {
        showAlert('제품 이미지를 업로드해주세요.', 'error');
        return;
    }

    const product = {
        id: editingProductId || Date.now(),
        mainCategory: document.getElementById('mainCategory').value,
        subCategory: document.getElementById('subCategory').value,
        name: document.getElementById('productName').value,
        code: document.getElementById('productCode').value,
        description: document.getElementById('productDescription').value,
        spec: document.getElementById('productSpec').value,
        badge: document.getElementById('productBadge').value === 'true',
        image: imagePreview ? imagePreview.src : '',
        createdAt: editingProductId ? products.find(p => p.id === editingProductId).createdAt : new Date().toISOString()
    };

    if(editingProductId) {
        // 수정
        const index = products.findIndex(p => p.id === editingProductId);
        products[index] = product;
        showAlert('제품이 성공적으로 수정되었습니다!', 'success');
        editingProductId = null;
    } else {
        // 추가
        products.push(product);
        showAlert('제품이 성공적으로 추가되었습니다!', 'success');
    }

    saveProducts();
    resetForm();
    updateDashboard();
}

// 폼 초기화
function resetForm() {
    document.getElementById('addProductForm').reset();
    removeImage();
    editingProductId = null;
}

// 제품 목록 표시
function displayProducts() {
    const tbody = document.getElementById('productsList');
    
    if(products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">제품이 없습니다. 제품을 추가해주세요.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image || 'https://via.placeholder.com/60'}" alt="${p.name}"></td>
            <td>${p.name}</td>
            <td>${p.code}</td>
            <td>${p.mainCategory}</td>
            <td>${p.subCategory}</td>
            <td>${p.badge ? '<span class="badge badge-new">NEW</span>' : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editProduct(${p.id})">수정</button>
                    <button class="delete-btn" onclick="deleteProduct(${p.id})">삭제</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 제품 삭제
function deleteProduct(id) {
    if(confirm('정말 이 제품을 삭제하시겠습니까?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        displayProducts();
        updateDashboard();
        showAlert('제품이 삭제되었습니다.', 'success');
    }
}

// 제품 수정
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if(!product) return;

    // 탭 전환
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('add').classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    
    // 폼에 데이터 채우기
    document.getElementById('mainCategory').value = product.mainCategory;
    updateSubCategories();
    setTimeout(() => {
        document.getElementById('subCategory').value = product.subCategory;
    }, 100);
    document.getElementById('productName').value = product.name;
    document.getElementById('productCode').value = product.code;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productSpec').value = product.spec;
    document.getElementById('productBadge').value = product.badge ? 'true' : 'false';
    
    if(product.image) {
        document.getElementById('imagePreview').innerHTML = `
            <div class="image-preview-item">
                <img src="${product.image}" alt="Preview">
                <button class="remove-btn" onclick="removeImage()" type="button">×</button>
            </div>
        `;
    }

    editingProductId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 제품 검색
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.code.toLowerCase().includes(searchTerm)
    );
    displayFilteredProducts(filtered);
}

// 카테고리 필터
function filterProducts() {
    const category = document.getElementById('filterCategory').value;
    if(category === 'all') {
        displayProducts();
    } else {
        const filtered = products.filter(p => p.mainCategory === category);
        displayFilteredProducts(filtered);
    }
}

// 필터된 제품 표시
function displayFilteredProducts(filtered) {
    const tbody = document.getElementById('productsList');
    
    if(filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">검색 결과가 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.image || 'https://via.placeholder.com/60'}" alt="${p.name}"></td>
            <td>${p.name}</td>
            <td>${p.code}</td>
            <td>${p.mainCategory}</td>
            <td>${p.subCategory}</td>
            <td>${p.badge ? '<span class="badge badge-new">NEW</span>' : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editProduct(${p.id})">수정</button>
                    <button class="delete-btn" onclick="deleteProduct(${p.id})">삭제</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 대시보드 업데이트
function updateDashboard() {
    // 통계 업데이트
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('hapProducts').textContent = products.filter(p => p.mainCategory === '합판').length;
    document.getElementById('doorProducts').textContent = products.filter(p => p.mainCategory === '도어').length;
    document.getElementById('otherProducts').textContent = products.filter(p => 
        !['합판', '도어'].includes(p.mainCategory)
    ).length;

    // 최근 제품 5개
    const recent = products.slice(-5).reverse();
    const tbody = document.getElementById('recentProductsList');
    
    if(recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">제품이 없습니다.</td></tr>';
    } else {
        tbody.innerHTML = recent.map(p => `
            <tr>
                <td><img src="${p.image || 'https://via.placeholder.com/60'}" alt="${p.name}"></td>
                <td>${p.name}</td>
                <td>${p.code}</td>
                <td>${p.mainCategory} / ${p.subCategory}</td>
                <td>${p.badge ? '<span class="badge badge-new">NEW</span>' : '-'}</td>
            </tr>
        `).join('');
    }
}

// 알림 표시
function showAlert(message, type) {
    const alert = document.getElementById('alertBox');
    alert.textContent = message;
    alert.className = `alert ${type} show`;
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 3000);
}

// 로컬 스토리지에 저장
function saveProducts() {
    localStorage.setItem('hysProducts', JSON.stringify(products));
}

// 로컬 스토리지에서 불러오기
function loadProducts() {
    const saved = localStorage.getItem('hysProducts');
    if(saved) {
        products = JSON.parse(saved);
    }
}

// 로그아웃 (제품 페이지로 이동)
function logout() {
    if(confirm('제품 페이지로 이동하시겠습니까?')) {
        window.location.href = 'JEPOM.html';
    }
}