const API_BASE_URL = 'https://v2.api.noroff.dev';
const API_POSTS_ENDPOINT = '/social/posts';

/**
 * Retrieves access token and the API key from localStorage.
 * Redirects to index.html if itsnot found.
 */
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
const formTitle = document.getElementById('formTitle');
const formMessage = document.getElementById('formMessage');

let allPosts = [];

/**
 * Takes care off filtering and rendering posts when the search button is clicked on.
 */
searchBtn.addEventListener('click', () => {
  const filteredPosts = filterPosts();
  renderPosts(filteredPosts);
} );


/**
 * Removes all localStorage data, and redirects to login page when logging out.
 */
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});


/**
 * Submits the post form.
 * Creates or updates a post based on presence of a post ID.
 * @param {Event} e - The form submission event.
 */
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

  if (response.ok) {
    formMessage.textContent = id ? 'Post updated!' : 'Post created!';
    formMessage.className = 'text-success mt-2';
    postForm.reset();
    postIdInput.value = '';
    formTitle.textContent = 'Create Post';
    fetchAndRenderPosts();
  } else {
    formMessage.textContent = 'Failed to submit post.';
    formMessage.className = 'text-danger mt-2';
  }
});

searchInput.addEventListener('input', () => renderPosts(filterPosts()));
filterSelect.addEventListener('change', () => renderPosts(filterPosts()));

/**
 * Filters the `allPosts` based on the current search and filter selection.
 * @returns {Array<Object>} array of filteredd post objects.
 * 
 * @example
 * const results = filterPosts();
 * renderPosts(results);
 */
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
  });
}

/**
 * Renders a array of posts as cards.
 * edit/delete functionality for posts owned by the current user.
 * 
 * @param {Array<Object>} posts - Array of post objects to render.
 * @returns {void}
 * 
 * @example
 * renderPosts(allPosts);
 */
async function fetchAndRenderPosts() {
  const res = await fetch(`${API_BASE_URL}${API_POSTS_ENDPOINT}?sort=created&sortOrder=desc&_author=true`, {
    headers,
  });

  const { data } = await res.json();
  allPosts = data;
  renderPosts(data);
}

function renderPosts(posts) {
  postContainer.innerHTML = '';
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const editingId = postIdInput.value;

  posts.forEach(post => {
    if (editingId && String(post.id) === editingId) return; 

    const card = document.createElement('div');
    card.className = 'card mb-3';

    const isEditable = post.author.name === currentUser.name;

    card.innerHTML = `
      <div class="card-body position-relative">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <p class="mb-0 fw-bold">${post.author.name}</p>
          <span class="badge bg-secondary">${post.id}</span>
        </div>

        <h5 class="card-title">${post.title}</h5>
        <p class="card-text">${post.body}</p>

        ${isEditable
          ? `
            <div class="d-flex">
              <button class="btn btn-sm me-2 edit-btn editDeleteBtn" data-id="${post.id}">Edit</button>
              <button class="btn btn-sm delete-btn editDeleteBtn" data-id="${post.id}">Delete</button>
              <div id="deleteMessage-${post.id}" class="mt-2"></div>
            </div>
          `
          : ""}
      </div>
    `;

    postContainer.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const post = allPosts.find(p => String(p.id) === btn.dataset.id);
      if (post) {
         postIdInput.value = post.id;
          titleInput.value = post.title;
          contentInput.value = post.body;
        formTitle.textContent = 'Edit Post';
        renderPosts(allPosts); // Hides the post while edit
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}));

  document.querySelectorAll('.delete-btn').forEach(btn =>
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.id;
      const deleteMessageDiv = document.getElementById(`deleteMessage-${postId}`);

      if (confirm('Are you sure you want to delete this post?')) {
        const res = await fetch(`${API_BASE_URL}${API_POSTS_ENDPOINT}/${postId}`, {
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
        }}}));}

fetchAndRenderPosts();



