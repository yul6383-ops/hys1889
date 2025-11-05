// order.js 수정 - viewPost 함수와 displayPosts 함수 수정

function viewPost(index) {
    const actualIndex = posts.length - 1 - index;
    window.location.href = `order-view.html?index=${actualIndex}`;
}

function adminLogin() {
    const password = prompt('관리자 비밀번호를 입력하세요:');
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('isAdmin', 'true');
        alert('관리자 모드로 전환되었습니다.');
        location.reload();
    } else {
        alert('비밀번호가 틀렸습니다.');
    }
}

// displayPosts 함수 시작 부분에 추가
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
        row.innerHTML = `
            <td>${posts.length - index}</td>
            <td style="cursor: pointer; text-align: left;" onclick="viewPost(${index})">${post.isSecret ? '🔒 ' : ''}${post.title}</td>
            <td>${post.author}</td>
            <td>${post.date}</td>
            <td>${post.views || 0}</td>
            ${isAdmin ? '<td><button class="delete-btn" onclick="event.stopPropagation(); deletePost(' + index + ')">삭제</button></td>' : ''}
        `;
        postList.appendChild(row);
    });
}