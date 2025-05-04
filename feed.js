const API_BASE_URL = 'https://v2.api.noroff.dev';
const API_POSTS_ENDPOINT = '/social/posts';

const accessToken = localStorage.getItem('accessToken');
const apiKey = localStorage.getItem('apiKey');

if (!accessToken || !apiKey) {
  window.location.href = 'index.html';
}

const headers = {
  Authorization: `Bearer ${accessToken}`,
  'X-Noroff-API-Key': apiKey,
  'Content-Type': 'application/json',
};

const postContainer = document.getElementById('postContainer');
const postForm = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('postContent');
const postIdInput = document.getElementById('postId');
const logoutBtn = document.getElementById('logoutBtn');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const searchBtn = document.getElementById('searchBtn');

let allPosts = [];

searchBtn.addEventListener('click', () => {
  console.log("Search button clicked")
  const filteredPosts = filterPosts();
  renderPosts(filteredPosts);
});

logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = postIdInput.value;
  const title = titleInput.value;
  const body = contentInput.value;

  const payload = JSON.stringify({ title, body });

  const url = id
    ? `${API_BASE_URL}${API_POSTS_ENDPOINT}/${id}`
    : `${API_BASE_URL}${API_POSTS_ENDPOINT}`;

  const method = id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers,
    body: payload,
  });

  const messageDiv = document.getElementById('formMessage'); 

  if (response.ok) {
    messageDiv.textContent = id ? 'Post updated!' : 'Post created!';
    messageDiv.className = 'text-success mt-2'; 
    postForm.reset();
    postIdInput.value = '';
    fetchAndRenderPosts();
  } else {
    messageDiv.textContent = 'Failed to submit post.';
    messageDiv.className = 'text-danger mt-2'; 
  }
});

searchInput.addEventListener('input', () => renderPosts(filterPosts()));
filterSelect.addEventListener('change', () => renderPosts(filterPosts()));

function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filterBy = filterSelect.value;
  return allPosts.filter(post => {
    if (!searchTerm) return true;
    if (filterBy === "title") {
      return post.title?.toLowerCase().includes(searchTerm);
    }
    if (filterBy === "author") {
      return post.author?.name?.toLowerCase().includes(searchTerm);
    }
    return (
      post.title?.toLowerCase().includes(searchTerm) ||
      post.author?.name?.toLowerCase().includes(searchTerm)
    );
  }
);}


async function fetchAndRenderPosts() {
  const res = await fetch(`${API_BASE_URL}${API_POSTS_ENDPOINT}?sort=created&sortOrder=desc&_author=true`, {
    headers,
  });
  const {data} = await res.json();
  console.log('Fetched posts:', data);
  allPosts = data;
  renderPosts(data);
}

function renderPosts(posts) {
  postContainer.innerHTML = '';

  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'card mb-3';

const currentUser = JSON.parse(localStorage.getItem("user"));

    card.innerHTML = `
      <div class="card-body position-relative">
        <!-- Author and Post ID -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <p class="mb-0 fw-bold">${post.author.name}</p>
          <span class="badge bg-secondary">${post.id}</span>
        </div>

        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${post.body}</p>

        ${post.author.name === currentUser.name
          ? `
            <div class="d-flex">
            <button class="btn btn-sm me-2 edit-btn editDeleteBtn" data-id="${post.id}">Edit</button>
            <div id="editMessage-${post.id}" class="mt-2"></div>

            <button class="btn btn-sm delete-btn editDeleteBtn" data-id="${post.id}">Delete</button>
            <div id="deleteMessage-${post.id}" class="mt-2"></div> 
            </div>
          `
          : ""}

        <button id="reactionBtn" class="btn btn-outline-primary btn-sm me-2 react-btn" data-id="${post.id}">⭐</button>
        <div id="reactionMessage-${post.id}" class="mt-2"></div> 

        <div class="mt-3">
          <input type="text" class="form-control form-control-sm comment-input" data-id="${post.id}" placeholder="Comment" />
          <button class="btn btn-sm btn-success mt-2 comment-btn" data-id="${post.id}">Comment</button>
          <div id="commentMessage-${post.id}" class="mt-2"></div> 
        </div>
      </div>
    `;

    postContainer.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const post = allPosts.find(p => p.id === btn.dataset.id);
      if (post) {
        postIdInput.value = post.id;
        titleInput.value = post.title;
        contentInput.value = post.body;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}));

  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', async () => {
      const deleteMessageDiv = document.getElementById(`deleteMessage-${btn.dataset.id}`);

      if (confirm('Are you sure you want to delete this post?')) {
        const res = await fetch(`${API_BASE_URL}${API_POSTS_ENDPOINT}/${btn.dataset.id}`, {
          method: 'DELETE',
          headers,
        });

        if (res.ok) {
          deleteMessageDiv.textContent = 'Post deleted successfully.';
          deleteMessageDiv.className = 'text-success mt-2'; 
          fetchAndRenderPosts();
        } else {
          deleteMessageDiv.textContent = 'Failed to delete post.';
          deleteMessageDiv.className = 'text-danger mt-2';
        }}
      }));

      
  document.querySelectorAll('.comment-btn').forEach(btn =>
    btn.addEventListener('click', async () => {
      const commentMessageDiv = document.getElementById(`commentMessage-${btn.dataset.id}`);
      const commentInput = document.querySelector(`.comment-input[data-id="${btn.dataset.id}"]`);
      const comment = commentInput.value;

      if (comment.trim()) {
        commentMessageDiv.textContent = 'Comment is added.';
        commentMessageDiv.className = 'text-success mt-2';
        commentInput.value = '';
      } else {
        commentMessageDiv.textContent = 'Please enter a coment.';
        commentMessageDiv.className = 'text-danger mt-2';
      }}));
}


fetchAndRenderPosts();
