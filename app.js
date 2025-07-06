class FontContext {
    constructor() {
        this.fontSize = 'medium';
        this.subscribers = [];
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    setFontSize(size) {
        this.fontSize = size;
        this.updateUI();
        this.notifySubscribers();
    }

    getFontSize() {
        return this.fontSize;
    }

    updateUI() {
        document.body.className = `font-${this.fontSize}`;
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.fontSize));
    }
}


const fontContext = new FontContext();

let currentView = 'home';
let currentPostId = null;
let posts = [];


const domRefs = {
    postsContainer: null,
    postContent: null,
    commentTextarea: null,
    scrollTarget: null
};


document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {

    domRefs.postsContainer = document.getElementById('posts-container');
    domRefs.postContent = document.getElementById('post-content');
    fontContext.updateUI();
    setupEventListeners();
    loadPosts();
}

function setupEventListeners() {
    
    const fontToggle = document.getElementById('font-size-toggle');
    fontToggle.addEventListener('click', handleFontSizeToggle);
    fontContext.subscribe(updateFontSizeButtons);
}

function handleFontSizeToggle(event) {
    if (event.target.classList.contains('size-btn')) {
        const size = event.target.getAttribute('data-size');
        fontContext.setFontSize(size);
    }
}

function updateFontSizeButtons(currentSize) {
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-size') === currentSize) {
            btn.classList.add('active');
        }
    });
}


async function loadPosts() {
    try {
        showLoading(domRefs.postsContainer);
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        posts = data.slice(0, 10);
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        showError(domRefs.postsContainer, 'Failed to load posts');
    }
}
async function loadPost(postId) {
    try {
        showLoading(domRefs.postContent);
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Post not found');
        }
        const post = await response.json();
        renderPost(post);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    } catch (error) {
        console.error('Error loading post:', error);
        showError(domRefs.postContent, 'Failed to load post');
    }
}
function renderPosts() {
    const postsHTML = posts.map(post => `
        <div class="post-card" onclick="navigateToPost(${post.id})">
            <div class="post-meta">
                <span class="post-id">#${post.id}</span>
                <span class="user-id">User ${post.userId}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-excerpt">${escapeHtml(post.body.substring(0, 150))}...</p>
        </div>
    `).join('');

    domRefs.postsContainer.innerHTML = postsHTML;
}

function renderPost(post) {
    const postHTML = `
        <div class="post-article">
            <div class="post-badge">Post #${post.id}</div>
            <h1>${escapeHtml(post.title)}</h1>
            <div class="post-body">
                ${post.body.split('\n').map(paragraph =>
        `<p>${escapeHtml(paragraph)}</p>`
    ).join('')}
            </div>
            <div class="post-footer">
                <div class="post-info">
                    Article ID: ${post.id} • User ID: ${post.userId}
                </div>
                <button class="scroll-top-btn" onclick="scrollToTop()">
                    ↑ Scroll to Top
                </button>
            </div>
        </div>
        ${renderCommentBox()}
    `;

    domRefs.postContent.innerHTML = postHTML;


    domRefs.commentTextarea = document.getElementById('comment-textarea');


    setupCommentBoxListeners();
}

function renderCommentBox() {
    return `
        <div class="comment-box">
            <div class="comment-header">
                <h3 class="comment-title">Leave a Comment</h3>
                <button class="focus-btn" onclick="focusCommentBox()">
                    💬 Focus Comment
                </button>
            </div>
            <textarea 
                id="comment-textarea" 
                class="comment-textarea" 
                placeholder="Write your comment here..."
                maxlength="500"
            ></textarea>
            <div class="comment-footer">
                <span class="char-count">
                    <span id="char-count">0</span>/500 characters
                </span>
                <button class="submit-btn" onclick="submitComment()">
                    Post Comment
                </button>
            </div>
        </div>
    `;
}

function setupCommentBoxListeners() {
    const textarea = domRefs.commentTextarea;
    if (textarea) {
        textarea.addEventListener('input', updateCharCount);
    }
}

function updateCharCount() {
    const charCountSpan = document.getElementById('char-count');
    if (domRefs.commentTextarea && charCountSpan) {
        charCountSpan.textContent = domRefs.commentTextarea.value.length;
    }
}


function focusCommentBox() {
    if (domRefs.commentTextarea) {
        domRefs.commentTextarea.focus();
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function navigateToPost(postId) {
    currentView = 'post';
    currentPostId = postId;
    updateView();
    loadPost(postId);
}

function navigateHome() {
    currentView = 'home';
    currentPostId = null;
    updateView();
}

function updateView() {
    const homeView = document.getElementById('home-view');
    const postView = document.getElementById('post-view');

    if (currentView === 'home') {
        homeView.classList.remove('hidden');
        postView.classList.add('hidden');
    } else {
        homeView.classList.add('hidden');
        postView.classList.remove('hidden');
    }
}

function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(container, message) {
    container.innerHTML = `<div class="loading" style="color: #ef4444;">${message}</div>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function submitComment() {
    if (domRefs.commentTextarea) {
        const comment = domRefs.commentTextarea.value.trim();
        if (comment) {
            alert(`Comment submitted: "${comment}"`);
            domRefs.commentTextarea.value = '';
            updateCharCount();
        }
    }
}

const useEffectSimulation = {

    onMount: (callback) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    },

    onUpdate: (callback, dependencies) => {

        callback();
    }
};


function useContext(context) {
    return {
        fontSize: context.getFontSize(),
        setFontSize: context.setFontSize.bind(context)
    };
}
function useRef(initialValue) {
    return {
        current: initialValue
    };
}

