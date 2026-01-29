const API_URL = 'http://localhost:3001';

// DOM Elements
const postsTableBody = document.getElementById('postsTableBody');
const commentsTableBody = document.getElementById('commentsTableBody');
const postCount = document.getElementById('postCount');
const commentCount = document.getElementById('commentCount');

// Buttons
const btnAddPost = document.getElementById('btnAddPost');
const btnSavePost = document.getElementById('btnSavePost');
const btnAddComment = document.getElementById('btnAddComment');
const btnSaveComment = document.getElementById('btnSaveComment');

// Modals
const postModal = new bootstrap.Modal(document.getElementById('postModal'));
const commentModal = new bootstrap.Modal(document.getElementById('commentModal'));

// Data
let posts = [];
let comments = [];

// ============ LOAD DATA ============
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/posts`);
        posts = await response.json();
        renderPosts();
        updatePostDropdown();
    } catch (error) {
        console.error('Error loading posts:', error);
        postsTableBody.innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">
                Lỗi khi tải dữ liệu. Đảm bảo json-server đang chạy trên port 3000.
            </td></tr>
        `;
    }
}

async function loadComments() {
    try {
        const response = await fetch(`${API_URL}/comments`);
        comments = await response.json();
        renderComments();
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsTableBody.innerHTML = `
            <tr><td colspan="4" class="text-center text-danger">
                Lỗi khi tải dữ liệu. Đảm bảo json-server đang chạy trên port 3000.
            </td></tr>
        `;
    }
}

// ============ RENDER POSTS ============
function renderPosts() {
    if (posts.length === 0) {
        postsTableBody.innerHTML = `
            <tr><td colspan="5" class="text-center py-4">Chưa có post nào</td></tr>
        `;
        postCount.textContent = '0';
        return;
    }

    postsTableBody.innerHTML = posts.map(post => {
        const rowClass = post.isDeleted ? 'text-decoration-line-through text-muted' : '';
        const statusBadge = post.isDeleted 
            ? '<span class="badge bg-danger">Đã xóa</span>' 
            : '<span class="badge bg-success">Hoạt động</span>';
        
        return `
            <tr class="${rowClass}">
                <td class="fw-bold">#${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-warning" onclick="editPost('${post.id}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${post.isDeleted 
                            ? `<button class="btn btn-outline-success" onclick="restorePost('${post.id}')" title="Khôi phục">
                                <i class="fas fa-undo"></i>
                              </button>`
                            : `<button class="btn btn-outline-danger" onclick="softDeletePost('${post.id}')" title="Xóa mềm">
                                <i class="fas fa-trash"></i>
                              </button>`
                        }
                        <button class="btn btn-outline-dark" onclick="hardDeletePost('${post.id}')" title="Xóa vĩnh viễn">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    postCount.textContent = posts.length;
}

// ============ RENDER COMMENTS ============
function renderComments() {
    if (comments.length === 0) {
        commentsTableBody.innerHTML = `
            <tr><td colspan="4" class="text-center py-4">Chưa có comment nào</td></tr>
        `;
        commentCount.textContent = '0';
        return;
    }

    commentsTableBody.innerHTML = comments.map(comment => {
        const post = posts.find(p => p.id === comment.postId);
        const postTitle = post ? post.title : 'N/A';
        
        return `
            <tr>
                <td class="fw-bold">#${comment.id}</td>
                <td>${comment.text}</td>
                <td>
                    <span class="badge bg-info">${comment.postId}</span>
                    <small class="text-muted d-block">${postTitle}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-warning" onclick="editComment('${comment.id}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteComment('${comment.id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    commentCount.textContent = comments.length;
}

// ============ POST CRUD ============
btnAddPost.addEventListener('click', () => {
    document.getElementById('postModalTitle').textContent = 'Thêm Post';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    postModal.show();
});

async function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('postModalTitle').textContent = 'Sửa Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postViews').value = post.views;
    postModal.show();
}

btnSavePost.addEventListener('click', async () => {
    const id = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value.trim();
    const views = parseInt(document.getElementById('postViews').value);

    if (!title) {
        alert('Vui lòng nhập tiêu đề!');
        return;
    }

    const postData = {
        title,
        views,
        isDeleted: false
    };

    try {
        if (id) {
            // Update existing post
            await fetch(`${API_URL}/posts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        } else {
            // Create new post - auto increment ID
            const maxId = posts.length > 0 
                ? Math.max(...posts.map(p => parseInt(p.id))) 
                : 0;
            postData.id = String(maxId + 1);
            
            await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        }

        postModal.hide();
        await loadPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Lỗi khi lưu post!');
    }
});

async function softDeletePost(id) {
    if (!confirm('Bạn có chắc muốn xóa mềm post này?')) return;

    try {
        await fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: true })
        });
        await loadPosts();
    } catch (error) {
        console.error('Error soft deleting post:', error);
        alert('Lỗi khi xóa post!');
    }
}

async function restorePost(id) {
    if (!confirm('Bạn có chắc muốn khôi phục post này?')) return;

    try {
        await fetch(`${API_URL}/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: false })
        });
        await loadPosts();
    } catch (error) {
        console.error('Error restoring post:', error);
        alert('Lỗi khi khôi phục post!');
    }
}

async function hardDeletePost(id) {
    if (!confirm('Bạn có chắc muốn XÓA VĨNH VIỄN post này? Hành động này không thể hoàn tác!')) return;

    try {
        await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE'
        });
        await loadPosts();
        await loadComments(); // Reload comments in case some belong to deleted post
    } catch (error) {
        console.error('Error hard deleting post:', error);
        alert('Lỗi khi xóa vĩnh viễn post!');
    }
}

// ============ COMMENT CRUD ============
function updatePostDropdown() {
    const select = document.getElementById('commentPostId');
    select.innerHTML = '<option value="">Chọn Post...</option>' + 
        posts.filter(p => !p.isDeleted).map(post => 
            `<option value="${post.id}">${post.id} - ${post.title}</option>`
        ).join('');
}

btnAddComment.addEventListener('click', () => {
    document.getElementById('commentModalTitle').textContent = 'Thêm Comment';
    document.getElementById('commentForm').reset();
    document.getElementById('commentId').value = '';
    commentModal.show();
});

async function editComment(id) {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;

    document.getElementById('commentModalTitle').textContent = 'Sửa Comment';
    document.getElementById('commentId').value = comment.id;
    document.getElementById('commentText').value = comment.text;
    document.getElementById('commentPostId').value = comment.postId;
    commentModal.show();
}

btnSaveComment.addEventListener('click', async () => {
    const id = document.getElementById('commentId').value;
    const text = document.getElementById('commentText').value.trim();
    const postId = document.getElementById('commentPostId').value;

    if (!text || !postId) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const commentData = {
        text,
        postId
    };

    try {
        if (id) {
            // Update existing comment
            await fetch(`${API_URL}/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
        } else {
            // Create new comment - auto increment ID
            const maxId = comments.length > 0 
                ? Math.max(...comments.map(c => parseInt(c.id))) 
                : 0;
            commentData.id = String(maxId + 1);
            
            await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
        }

        commentModal.hide();
        await loadComments();
    } catch (error) {
        console.error('Error saving comment:', error);
        alert('Lỗi khi lưu comment!');
    }
});

async function deleteComment(id) {
    if (!confirm('Bạn có chắc muốn xóa comment này?')) return;

    try {
        await fetch(`${API_URL}/comments/${id}`, {
            method: 'DELETE'
        });
        await loadComments();
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Lỗi khi xóa comment!');
    }
}

// ============ INITIALIZE ============
async function init() {
    await loadPosts();
    await loadComments();
}

init();
