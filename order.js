// Firebase 모듈 가져오기
import { db, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, increment } from './firebacs-config.js';

const ADMIN_PASSWORD = '8420';

window.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드됨');
    if (document.getElementById('postList')) {
        displayPosts();
        updateAdminButton();
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
window.toggleAdminMode = function() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        if (confirm('관리자 모드를 종료하시겠습니까?')) {
            localStorage.removeItem('isAdmin');
            alert('관리자 모드가 종료되었습니다.');
            location.reload();
        }
    } else {
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
            adminBtn.style.backgroundColor = '#dc3545';
        } else {
            adminBtn.textContent = '관리자 로그인';
            adminBtn.style.backgroundColor = '#007bff';
        }
    }
}

// 게시글 삭제 (Firebase)
window.deletePost = async function(postId) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
        alert('관리자만 삭제할 수 있습니다.');
        return;
    }
    
    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            await deleteDoc(doc(db, 'posts', postId));
            alert('게시글이 삭제되었습니다.');
            displayPosts();
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }
}

// 게시글 보기
window.viewPost = function(postId) {
    window.location.href = `order-view.html?id=${postId}`;
}

// 게시글 목록 표시 (Firebase에서 가져오기)
async function displayPosts() {
    console.log('게시글 로딩 시작...');
    
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const postList = document.getElementById('postList');
    postList.innerHTML = '<tr><td colspan="5">로딩 중...</td></tr>';
    
    try {
        console.log('Firestore 쿼리 실행...');
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        console.log('가져온 게시글 수:', querySnapshot.size);
        
        postList.innerHTML = '';
        
        if (querySnapshot.empty) {
            console.log('게시글이 없습니다');
            postList.innerHTML = '<tr><td colspan="' + (isAdmin ? '6' : '5') + '" style="padding: 40px;">등록된 게시글이 없습니다.</td></tr>';
            return;
        }
        
        let index = 1;
        querySnapshot.forEach((docSnapshot) => {
            const post = docSnapshot.data();
            const postId = docSnapshot.id;
            
            console.log('게시글:', index, post);
            
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            
            row.innerHTML = `
                <td>${index}</td>
                <td style="text-align: left;">${post.isSecret ? '🔒 ' : ''}${post.title}</td>
                <td>${post.author}</td>
                <td>${post.date}</td>
                <td>${post.views || 0}</td>
                ${isAdmin ? '<td><button class="delete-btn" onclick="event.stopPropagation(); deletePost(\'' + postId + '\')">삭제</button></td>' : ''}
            `;
            
            row.addEventListener('click', function(e) {
                if (!e.target.classList.contains('delete-btn')) {
                    viewPost(postId);
                }
            });
            
            postList.appendChild(row);
            index++;
        });
        
    } catch (error) {
        console.error('게시글 로딩 오류:', error);
        console.error('오류 상세:', error.message);
        postList.innerHTML = '<tr><td colspan="5">게시글을 불러오는 중 오류가 발생했습니다: ' + error.message + '</td></tr>';
    }
    
    updateAdminButton();
}

// 게시글 작성 (Firebase에 저장)
async function submitPost() {
    const newPost = {
        author: document.getElementById('author').value,
        password: document.getElementById('password').value,
        title: document.getElementById('title').value,
        content: document.getElementById('content').value,
        isSecret: document.getElementById('isSecret').checked,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        views: 0
    };
    
    try {
        await addDoc(collection(db, 'posts'), newPost);
        window.location.href = 'order.html';
    } catch (error) {
        console.error('게시글 등록 오류:', error);
        alert('게시글 등록 중 오류가 발생했습니다.');
    }
}