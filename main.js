//HTTP request Get, Post, Put, Delete
const API_URL = 'http://localhost:3000';

// ========== POSTS FUNCTIONS ==========

// Load all posts (including soft-deleted ones)
async function LoadPosts() {
    try {
        let res = await fetch(`${API_URL}/posts`);
        let data = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        
        for (const post of data) {
            // Apply deleted class if post is soft deleted
            const rowClass = post.isDeleted ? 'deleted' : '';
            const actionButtons = post.isDeleted 
                ? `<button class="restore-btn" onclick="RestorePost('${post.id}')">Restore</button>`
                : `<button onclick="EditPost('${post.id}')">Edit</button>
                   <button class="delete-btn" onclick="SoftDeletePost('${post.id}')">Delete</button>`;
            
            body.innerHTML += `
            <tr class="${rowClass}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>${actionButtons}</td>
            </tr>`;
        }
        
        // Also update the Post ID select dropdown
        LoadPostsToSelect();
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

// Load posts into the select dropdown for comments
async function LoadPostsToSelect() {
    try {
        let res = await fetch(`${API_URL}/posts`);
        let data = await res.json();
        let select = document.getElementById("comment_post_id_txt");
        
        // Keep the first option (-- Select Post --)
        select.innerHTML = '<option value="">-- Select Post --</option>';
        
        // Add all posts to the dropdown (including deleted ones, marked)
        for (const post of data) {
            const deletedTag = post.isDeleted ? ' (Deleted)' : '';
            select.innerHTML += `<option value="${post.id}">${post.id} - ${post.title}${deletedTag}</option>`;
        }
    } catch (error) {
        console.error("Error loading posts to select:", error);
    }
}


// Get max ID from all posts
async function GetMaxPostId() {
    try {
        let res = await fetch(`${API_URL}/posts`);
        let data = await res.json();
        
        if (data.length === 0) return 0;
        
        // Convert all IDs to numbers and find max
        const maxId = Math.max(...data.map(post => parseInt(post.id) || 0));
        return maxId;
    } catch (error) {
        console.error("Error getting max ID:", error);
        return 0;
    }
}

// Save or Update Post
async function SavePost() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;
    
    if (!title || !views) {
        alert("Please fill in all fields!");
        return;
    }
    
    let res;
    
    if (id) {
        // Update existing post
        res = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                title: title,
                views: views,
                isDeleted: false
            })
        });
    } else {
        // Create new post with auto-increment ID
        const maxId = await GetMaxPostId();
        const newId = String(maxId + 1);
        
        res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: views,
                isDeleted: false
            })
        });
    }
    
    if (res.ok) {
        console.log("Save successful!");
        ClearPostForm();
        LoadPosts();
    } else {
        alert("Error saving post!");
    }
}

// Soft Delete Post - adds isDeleted: true
async function SoftDeletePost(id) {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }
    
    try {
        // Get current post data
        let getRes = await fetch(`${API_URL}/posts/${id}`);
        let post = await getRes.json();
        
        // Update with isDeleted flag
        let res = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        });
        
        if (res.ok) {
            console.log("Post soft deleted successfully!");
            LoadPosts();
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}

// Restore soft-deleted post
async function RestorePost(id) {
    try {
        // Get current post data
        let getRes = await fetch(`${API_URL}/posts/${id}`);
        let post = await getRes.json();
        
        // Update with isDeleted = false
        let res = await fetch(`${API_URL}/posts/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: false
            })
        });
        
        if (res.ok) {
            console.log("Post restored successfully!");
            LoadPosts();
        }
    } catch (error) {
        console.error("Error restoring post:", error);
    }
}

// Edit Post - populate form
async function EditPost(id) {
    try {
        let res = await fetch(`${API_URL}/posts/${id}`);
        let post = await res.json();
        
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("views_txt").value = post.views;
    } catch (error) {
        console.error("Error loading post for edit:", error);
    }
}

// Clear Post Form
function ClearPostForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

// ========== COMMENTS FUNCTIONS ==========

// Load all comments
async function LoadComments() {
    try {
        let res = await fetch(`${API_URL}/comments`);
        let data = await res.json();
        let body = document.getElementById("comments-table-body");
        body.innerHTML = "";
        
        for (const comment of data) {
            body.innerHTML += `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td>${comment.postId}</td>
                <td>
                    <button onclick="EditComment('${comment.id}')">Edit</button>
                    <button class="delete-btn" onclick="DeleteComment('${comment.id}')">Delete</button>
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// Get max ID from all comments
async function GetMaxCommentId() {
    try {
        let res = await fetch(`${API_URL}/comments`);
        let data = await res.json();
        
        if (data.length === 0) return 0;
        
        // Convert all IDs to numbers and find max
        const maxId = Math.max(...data.map(comment => parseInt(comment.id) || 0));
        return maxId;
    } catch (error) {
        console.error("Error getting max comment ID:", error);
        return 0;
    }
}

// Save or Update Comment
async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_post_id_txt").value;
    
    if (!text || !postId) {
        alert("Please fill in all fields!");
        return;
    }
    
    let res;
    
    if (id) {
        // Update existing comment
        res = await fetch(`${API_URL}/comments/${id}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                text: text,
                postId: postId
            })
        });
    } else {
        // Create new comment with auto-increment ID
        const maxId = await GetMaxCommentId();
        const newId = String(maxId + 1);
        
        res = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: newId,
                text: text,
                postId: postId
            })
        });
    }
    
    if (res.ok) {
        console.log("Comment saved successfully!");
        ClearCommentForm();
        LoadComments();
    } else {
        alert("Error saving comment!");
    }
}

// Edit Comment - populate form
async function EditComment(id) {
    try {
        let res = await fetch(`${API_URL}/comments/${id}`);
        let comment = await res.json();
        
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_text_txt").value = comment.text;
        document.getElementById("comment_post_id_txt").value = comment.postId;
    } catch (error) {
        console.error("Error loading comment for edit:", error);
    }
}

// Delete Comment (hard delete)
async function DeleteComment(id) {
    if (!confirm("Are you sure you want to delete this comment?")) {
        return;
    }
    
    let res = await fetch(`${API_URL}/comments/${id}`, {
        method: 'DELETE'
    });
    
    if (res.ok) {
        console.log("Comment deleted successfully!");
        LoadComments();
    } else {
        alert("Error deleting comment!");
    }
}

// Clear Comment Form
function ClearCommentForm() {
    document.getElementById("comment_id_txt").value = "";
    document.getElementById("comment_text_txt").value = "";
    document.getElementById("comment_post_id_txt").value = "";
}

// ========== INITIALIZE ==========
// Load data when page loads
LoadPosts();
LoadComments();