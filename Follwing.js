/* eslint-disable no-undef */
const mainPanel = document.querySelector('#main-container')
const userContent = document.querySelector('.modal-content')
const BASE_URL = 'https://api.unsplash.com/'
const clientID = 'client_id=Jb3jHPMSvjP7CBjQfbO-qfKTcdf2l6UEHU65RbVpZ4A'
const USERS_PER_PAGE = 8
const USERS_TO_FOLLOW = JSON.parse(localStorage.getItem('followList'))

// function: 取得資料後渲染網頁
function renderUserList (data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="card-container">
        <img id="model-img" src="${item.urls.small}" alt="...">
        <div class="info-overlay" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
          <img id="user-img" src="${item.user.profile_image.large}"/>
          <p class="card-title">${item.user.name}</p>
        </div>
      </div>
      `
  })
  mainPanel.innerHTML = rawHTML
}

// function: 在彈出式視窗載入資料
function showUserModal (id) {
  const USER_URL = `${BASE_URL}photos/${id}?${clientID}`
  axios
    .get(USER_URL)
    .then((response) => {
      console.log(response)
      const userName = document.querySelector('#user-modal-name')
      const userLocation = document.querySelector('#user-modal-location')
      const userBio = document.querySelector('#user-modal-bio')
      const userImage = document.querySelector('#inside-user-image')
      const instagramLink = document.querySelector('#instagramLink')
      const unsplashLink = document.querySelector('#unsplashLink')
      const userID = document.querySelector('.btn-secondary')
      userName.innerText = `${response.data.user.name}`
      userLocation.innerHTML = `<b>Location:</b><br> ${response.data.user.location}`
      userBio.innerHTML = `<b>Self-Intro:</b><br>${response.data.user.bio}`
      instagramLink.setAttribute('href', 'https://www.instagram.com/' + response.data.user.instagram_username)
      unsplashLink.setAttribute('href', response.data.user.links.html)
      userImage.setAttribute('src', response.data.user.profile_image.large)
      userID.setAttribute('data-id', response.data.id)
    })
}
// function: 渲染分頁欄位
function addPageHtml (PageNum) {
  for (let page = 1; page <= PageNum; page++) {
    paginator.innerHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
}

// function: 將名單切割，每一頁10個user
function getUsersByPage (page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return USERS_TO_FOLLOW.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 計算頁數，將HTML渲染到頁面中
function renderPaginator (amount) {
  const PageNum = Math.ceil(USERS_TO_FOLLOW.length / USERS_PER_PAGE)
  addPageHtml(PageNum)
  renderUserList(getUsersByPage(1))
}

// 取消追蹤
function unfollowingUser (id) {
  console.log(id)
  const userBeingUnfollow = USERS_TO_FOLLOW.findIndex((user) => user.id === id)
  if (userBeingUnfollow === -1) return
  USERS_TO_FOLLOW.splice(userBeingUnfollow, 1)
  localStorage.setItem('followList', JSON.stringify(USERS_TO_FOLLOW))
  renderUserList(USERS_TO_FOLLOW)
  paginator.innerHTML = ''
  renderPaginator(getUsersByPage(1))
}

// 在main-container中掛上監聽器，點擊後顯示使用者資料
mainPanel.addEventListener('click', (e) => {
  console.log(e.target.dataset.id)
  if (e.target.matches('.info-overlay')) {
    showUserModal(e.target.dataset.id)
  }
})

// 在彈出式頁面掛上監聽器，點擊後把id從追蹤清單刪除
userContent.addEventListener('click', (e) => {
  if (e.target.matches('#btn-unfollowing')) {
    unfollowingUser(e.target.dataset.id)
  }
})

// 在paginator中掛上監聽器，點擊後載入到另一頁
paginator.addEventListener('click', (e) => {
  // 透過 dataset 取得被點擊的頁數
  const pageNum = Number(e.target.dataset.page)
  renderUserList(getUsersByPage(pageNum))
})

// renderUserList(USERS_TO_FOLLOW) 多餘的
renderPaginator(getUsersByPage(1))
