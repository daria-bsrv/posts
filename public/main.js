let posts = [];
let users = [];
let comments = [];
let currentAuthorFilter = null;

const authorList = document.getElementById('author-list');
const postsContainer = document.getElementById('posts-container');
const favoritesList = document.getElementById('favorites-list');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const commentsList = document.getElementById('comments-list');
const closeModal = document.querySelector('#modal .close');

const modalForm = document.getElementById('modal-form');
const formClose = document.querySelector('.form-close');
const createPostForm = document.getElementById('create-post-form');
const createBtn = document.querySelector('.create-btn');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');

// Элементы для редактирования
const editModal = document.getElementById('edit-modal');
const editClose = document.querySelector('.edit-close');
const editForm = document.getElementById('edit-post-form');

async function fetchData() {
  try {
    const [postsRes, usersRes, commentsRes] = await Promise.all([
      fetch('http://localhost:3000/posts'),
      fetch('http://localhost:3000/users'),
      fetch('http://localhost:3000/comments')
    ]);

    posts = await postsRes.json();
    users = await usersRes.json();
    comments = await commentsRes.json();

    posts = posts.map(p => ({ ...p, likes: p.likes || 0 }));

    populateAuthors();
    renderPosts();
    renderFavorites();
    populateUserSelect(); // Заполняем селект при загрузке

  } catch (err) {
    console.error("Ошибка загрузки:", err);
  }
}

function populateUserSelect() {
  const select = document.getElementById('user-select');
  select.innerHTML = '<option></option>';

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    select.appendChild(option);
  });
}

function populateAuthors() {
  authorList.innerHTML = '';

  const allLi = document.createElement('li');
  allLi.textContent = "Все";
  allLi.classList.add("active");
  allLi.addEventListener("click", () => filterByAuthor(null));
  authorList.appendChild(allLi);

  const lastNames = new Set();

  posts.forEach(p => {
    const user = users.find(u => u.id === p.userId);
    if (user) {
      const ln = user.name.split(" ").pop();
      lastNames.add(ln);
    }
  });

  lastNames.forEach(ln => {
    const li = document.createElement('li');
    li.textContent = ln;
    li.addEventListener("click", () => filterByAuthor(ln));
    authorList.appendChild(li);
  });
}

function filterByAuthor(lastName) {
  currentAuthorFilter = lastName;

  [...authorList.children].forEach(li => {
    li.classList.toggle("active", li.textContent === (lastName || "Все"));
  });

  renderPosts();
}

function renderPosts() {
  postsContainer.innerHTML = '';

  const filtered = currentAuthorFilter
    ? posts.filter(p => {
      const u = users.find(u => u.id === p.userId);
      return u && u.name.split(" ").pop() === currentAuthorFilter;
    })
    : posts;

  filtered.forEach(post => {
    const user = users.find(u => u.id === post.userId);
    const lastName = user ? user.name.split(" ").pop() : "Неизвестно";
    const isFav = isFavorite(post.id);

    const div = document.createElement('div');
    div.className = "post";

    div.innerHTML = `
    <h3>Тема:${post.title}</h3> 
      <p><strong>Автор:</strong> ${lastName}</p>
      <p>${post.body.substring(0, 100)}${post.body.length > 100 ? "..." : ""}</p>
      <div class="post-actions">
        <button class="read-more" data-id="${post.id}">Read More</button>
        <button class="edit-post" data-id="${post.id}">✏️ Редактировать</button>
        <button class="delete-post" data-id="${post.id}">Удалить</button>
      </div>
      <div class="like">
        <svg width="16" height="16">
          <path class="like-path" data-idpost="${post.id}"
                fill="rgb(168, 84, 207)"
                d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 
                 4.736 3.562-3.248 8 1.314"/>
        </svg>
        <span>${post.likes}</span>
      </div>
      <div class="favorite">
        <svg width="22" height="22" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         x="0px" y="0px" viewBox="0 0 329.899 329.899" style="enable-background:new 0 0 329.899 329.899;" 
         xml:space="preserve"><g> <path class="favorite-path ${isFav ? "favorite-active" : ""}" data-idpost="${post.id}" fill="${isFav ? "rgba(111, 66, 170, 1)" : "rgba(119, 64, 177, 0.47)"}" d="M260.086,0H69.846C54.368,0,41.788,12.58,41.788,28.04v287.428c0,4.78,2.366,
         9.235,6.308,11.926s8.965,3.255,13.417,1.495 l103.441-40.875l103.454,40.875c1.699,0.679,3.501,1.003,5.29,1.003c2.847,0,
         5.687-0.841,8.101-2.492 c3.957-2.684,6.312-7.146,6.312-11.919V28.04C288.123,12.58,275.543,0,260.086,0z M213.033,158.674l-25.137,18.264l9.596,29.556 c0.643,1.981-0.06,4.155-1.741,5.374c-0.853,0.606-1.837,0.919-2.822,0.919c-0.991,0-1.981-0.312-2.834-0.919l-25.134-18.261 l-25.136,18.261c-1.684,1.219-3.966,1.219-5.645,0c-1.678-1.219-2.405-3.387-1.753-5.374l9.61-29.556l-25.142-18.264 c-1.684-1.225-2.387-3.39-1.748-5.374c0.64-1.981,2.486-3.327,4.576-3.327h31.068l9.611-29.54c1.273-3.966,7.842-3.966,9.139,0 l9.599,29.54h31.075c2.084,0,3.921,1.346,4.569,3.327C215.423,155.278,214.714,157.449,213.033,158.674z"/>
         </g></svg>
         <span class="fav">${isFav ? "В избранном" : "Добавить в избранное"}</span>
      </div>
    `;

    postsContainer.appendChild(div);
  });
}

function renderFavorites() {
  favoritesList.innerHTML = '';

  const favoriteIds = getFavoritePosts();
  const favoritePosts = posts.filter(p => favoriteIds.includes(p.id));

  if (favoritePosts.length === 0) {
    favoritesList.innerHTML = '<li>Пусто</li>';
    return;
  }

  favoritePosts.forEach(post => {
    const li = document.createElement('li');
    li.textContent = post.title;
    li.style.cursor = 'pointer';
    li.style.padding = '8px';
    li.style.margin = '5px 0';
    li.style.borderRadius = '4px';
    li.style.backgroundColor = '#e5ccfc';
    li.addEventListener('click', () => showPostModal(post.id));
    favoritesList.appendChild(li);
  });
}

postsContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-post')) {
    const id = Number(e.target.dataset.id);

    if (!confirm("Удалить этот пост?")) return;

    try {
      await fetch(`http://localhost:3000/posts/${id}`, {
        method: "DELETE"
      });
      posts = posts.filter(p => Number(p.id) !== id);
      renderPosts();
      populateAuthors();
      renderFavorites();
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  }

  // Обработчик редактирования
  if (e.target.classList.contains('edit-post')) {
    const id = Number(e.target.dataset.id);
    openEditModal(id);
  }
});

function openEditModal(postId) {
  const post = posts.find(p => Number(p.id) === postId);
  if (!post) return;

  document.getElementById('edit-title').value = post.title;
  document.getElementById('edit-body').value = post.body;

  // Заполняем селект авторов
  const select = document.getElementById('edit-user-select');
  select.innerHTML = '';

  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    if (user.id == post.userId) option.selected = true;
    select.appendChild(option);
  });

  editModal.dataset.postId = postId;
  editModal.style.display = "block";
}

function showPostModal(postId) {
  const post = posts.find(p => Number(p.id) === Number(postId));
  if (!post) return;

  modalTitle.textContent = post.title;
  modalBody.textContent = post.body;
  modal.dataset.postId = postId; // Сохраняем ID для комментариев

  renderComments(postId);
  modal.style.display = "block";
}

function renderComments(postId) {
  const postComments = comments.filter(c => c.postId == postId);
  commentsList.innerHTML = '';

  postComments.forEach(c => {
    const li = document.createElement("li");
    li.className = "comment";
    li.innerHTML = `<p><strong>${c.name}</strong></p>
  <p>${c.body}</p>`;
    commentsList.appendChild(li);
  });
}

postsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("read-more")) {
    const id = Number(e.target.dataset.id);
    showPostModal(id);
  }
});

postsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("like-path")) {
    const id = Number(e.target.dataset.idpost);
    const post = posts.find(p => Number(p.id) === id);

    post.likes++;
    e.target.closest(".like").querySelector("span").textContent = post.likes;

    fetch(`http://localhost:3000/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes: post.likes })
    });
  }
});

postsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("favorite-path")) {
    const id = Number(e.target.dataset.idpost);
    addFavoritePost(id);
    renderPosts();
    renderFavorites();
  }
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

createBtn.addEventListener("click", () => {
  modalForm.style.display = "block";
});

formClose.addEventListener("click", () => {
  modalForm.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modalForm) modalForm.style.display = "none";
});

createPostForm.addEventListener("submit", async e => {
  e.preventDefault();
  const title = document.getElementById('new-title').value.trim();
  const body = document.getElementById('new-body').value.trim();
  const userId = document.getElementById('user-select').value; // Исправлено: userId вместо user

  const newPost = { title, body, userId, likes: 0 };

  try {
    const res = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    });

    const createdPost = await res.json();
    createdPost.id = Number(createdPost.id);
    posts.push(createdPost);

    renderPosts();
    populateAuthors();
    renderFavorites();

    modalForm.style.display = "none";
    createPostForm.reset();

  } catch (error) {
    console.error("Ошибка создания поста:", error);
  }
});

// Обработчик редактирования
editForm.addEventListener('submit', async e => {
  e.preventDefault();
  const postId = editModal.dataset.postId;
  const title = document.getElementById('edit-title').value;
  const body = document.getElementById('edit-body').value;
  const userId = document.getElementById('edit-user-select').value;

  try {
    await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId })
    });

    // Обновляем локальные данные
    const post = posts.find(p => p.id == postId);
    post.title = title;
    post.body = body;
    post.userId = userId;

    renderPosts();
    populateAuthors();
    editModal.style.display = "none";
  } catch (err) {
    console.error('Ошибка редактирования:', err);
  }
});

// Закрытие модального окна редактирования
editClose.addEventListener('click', () => {
  editModal.style.display = 'none';
});

window.addEventListener('click', e => {
  if (e.target === editModal) editModal.style.display = 'none';
});

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const postId = modal.dataset.postId;
  const body = commentInput.value;

  try {
    const res = await fetch("http://localhost:3000/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: Number(postId),
        body,
        name: "Пользователь",
        email: "user@example.com"
      })
    });

    const newComment = await res.json();
    comments.push(newComment);
    renderComments(postId);
    commentInput.value = "";
  } catch (err) {
    console.error("Ошибка добавления комментария:", err);
  }
});

const btnLight = document.getElementById('light-theme');
const btnDark = document.getElementById('dark-theme');

let browserTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
browserTheme = browserTheme ? 'dark' : 'light';

let theme = localStorage.getItem('theme') || browserTheme;
if (theme === browserTheme) {
  btnDark.checked = true;
} else {
  btnLight.checked = true;
  const link = document.createElement('link');
  link.rel = "stylesheet";
  link.href = "light.css";
  link.id = "light-style";
  document.querySelector('head').append(link);
}

btnDark.addEventListener("change", () => {
  localStorage.setItem('theme', 'dark');
  const lightStyle = document.getElementById('light-style');
  if (lightStyle) lightStyle.remove();
});

btnLight.addEventListener("change", () => {
  localStorage.setItem('theme', 'light');
  const lightStyle = document.getElementById('light-style');
  if (!lightStyle) {
    const link = document.createElement('link');
    link.rel = "stylesheet";
    link.href = "light.css";
    link.id = "light-style";
    document.querySelector('head').append(link);
  }
});

let count;
const STORAGE_KEY = 'pageReloadCount';
let storedValue = localStorage.getItem(STORAGE_KEY) || 0;
storedValue = parseInt(storedValue);
count = storedValue + 1;
localStorage.setItem(STORAGE_KEY, count);

const counterElement = document.getElementById('reload-count');
if (counterElement) {
  counterElement.textContent = count;
}

const FAV_STORAGE_KEY = 'favoritePosts';

function getFavoritePosts() {
  const stored = localStorage.getItem(FAV_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function addFavoritePost(postId) {
  const favs = getFavoritePosts();
  const index = favs.indexOf(postId);
  if (index === -1) favs.push(postId);
  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
}

function isFavorite(postId) {
  const favs = getFavoritePosts();
  return favs.includes(parseInt(postId));
}

document.addEventListener("DOMContentLoaded", fetchData);