let posts = JSON.parse(localStorage.getItem('posts')) || [];
const ADMIN_PASSWORD = '8420';

window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('postList')) {
        displayPosts();
        updateAdminButton(); // 버튼 상태 업데이트
    }
    
    const writeForm = document.getElementById('writeForm');
    if (writeForm) {
        writeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPost();
        });
    }
});

// 관리자 모드 토글 함수
function toggleAdminMode() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        // 현재 관리자 모드면 -> 로그아웃
        if (confirm('관리자 모드를 종료하시겠습니까?')) {
            localStorage.removeItem('isAdmin');
            alert('관리자 모드가 종료되었습니다.');
            location.reload();
        }
    } else {
        // 현재 일반 모드면 -> 로그인
        const password = prompt('관리자 비밀번호를 입력하세요:');
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('isAdmin', 'true');
            alert('관리자 모드로 전환되었습니다.');
            location.reload();
        } else if (password !== null) {
            alert('비밀번호가 틀렸습니다.');
        }
    }
}

// 버튼 텍스트 업데이트 함수
function updateAdminButton() {
    const adminBtn = document.getElementById('adminToggleBtn');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (adminBtn) {
        if (isAdmin) {
            adminBtn.textContent = '관리자 모드 종료';
            adminBtn.style.backgroundColor = '#dc3545'; // 빨간색
        } else {
            adminBtn.textContent = '관리자 로그인';
            adminBtn.style.backgroundColor = '#007bff'; // 파란색
        }
    }
}

// 관리자 로그아웃 (기존 함수는 제거 가능)
function adminLogout() {
    if (confirm('관리자 모드를 종료하시겠습니까?')) {
        localStorage.removeItem('isAdmin');
        alert('관리자 모드가 종료되었습니다.');
        location.reload();
    }
}

// 게시글 삭제
function deletePost(index) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        alert('관리자만 삭제할 수 있습니다.');
        return;
    }
    
    if (confirm('정말 삭제하시겠습니까?')) {
        const actualIndex = posts.length - 1 - index;
        posts.splice(actualIndex, 1);
        localStorage.setItem('posts', JSON.stringify(posts));
        alert('게시글이 삭제되었습니다.');
        displayPosts();
    }
}

// 게시글 보기
function viewPost(index) {
    const actualIndex = posts.length - 1 - index;
    window.location.href = `order-view.html?index=${actualIndex}`;
}

// 게시글 목록 표시
function displayPosts() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const postList = document.getElementById('postList');
    postList.innerHTML = '';
    
    if (posts.length === 0) {
        postList.innerHTML = '<tr><td colspan="' + (isAdmin ? '6' : '5') + '" style="padding: 40px;">등록된 게시글이 없습니다.</td></tr>';
        return;
    }
    
    posts.slice().reverse().forEach((post, index) => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        
        row.innerHTML = `
            <td>${posts.length - index}</td>
            <td style="text-align: left;">${post.isSecret ? '🔒 ' : ''}${post.title}</td>
            <td>${post.author}</td>
            <td>${post.date}</td>
            <td>${post.views || 0}</td>
            ${isAdmin ? '<td><button class="delete-btn" onclick="event.stopPropagation(); deletePost(' + index + ')">삭제</button></td>' : ''}
        `;
        
        // 행 전체 클릭 이벤트
        row.addEventListener('click', function(e) {
            if (!e.target.classList.contains('delete-btn')) {
                viewPost(index);
            }
        });
        
        postList.appendChild(row);
    });
    
    // 버튼 상태 업데이트
    updateAdminButton();
}

// 게시글 작성
function submitPost() {
    const newPost = {
        author: document.getElementById('author').value,
        password: document.getElementById('password').value,
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        isSecret: document.getElementById('isSecret').checked,
        date: new Date().toISOString().split('T')[0],
        views: 0
    };
    
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    // alert('게시글이 등록되었습니다.'); // 이 줄 삭제 또는 주석 처리
    window.location.href = 'order.html';
}