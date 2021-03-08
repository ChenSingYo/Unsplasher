/* eslint-disable no-undef */
const followingList = JSON.parse(localStorage.getItem('followList', '')) || []
const mainPanel = document.querySelector('#main-container')
const userContent = document.querySelector('.modal-content')
const searchForm = document.querySelector('.form-control')
const BASE_URL = 'https://api.unsplash.com/'
const clientID = 'client_id=Jb3jHPMSvjP7CBjQfbO-qfKTcdf2l6UEHU65RbVpZ4A'
const urlSearchTerm = 'query=model-face&orientation=portrait'
const pageSetting = 'per_page=30&page='
const INDEX_URL = `${BASE_URL}search/photos?&${urlSearchTerm}&${clientID}&${pageSetting}`
const USERS_PER_PAGE = 20
const totalUserNumber = 180
const USERS = []
let filteredUsers = []

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
    .catch(error => console.log(error))
}
// function: 渲染分頁欄位
function addPageHtml (PageNum) {
  for (let page = 1; page <= PageNum; page++) {
    paginator.innerHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
}

// function: 將名單切割，每一頁20個user
function getUsersByPage (page) {
  const data = filteredUsers.length ? filteredUsers : USERS
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// function: 加入追蹤清單
function addToFollowing (id) {
  const userToFollow = USERS.find(USER => USER.id === id)
  if (followingList.some(UESR => UESR.id === id)) {
    return alert('already added to list')
  } else {
    followingList.push(userToFollow)
    localStorage.setItem('followList', JSON.stringify(followingList))
  }
}

// 計算頁數，將HTML渲染到頁面中
function renderPaginator (amount) {
  // 若無搜尋字串，則將總資料的筆數作為引數去做分頁
  if (amount === 0) { amount = USERS.length }
  const PageNum = Math.ceil(amount / USERS_PER_PAGE)
  paginator.innerHTML = ''
  addPageHtml(PageNum)
}

// 將從API取得的資料放進容器(User)中
// API限定一頁只能取30筆資料，因此利用迴圈增加資料數
for (let pageNum = 1; pageNum <= 6; pageNum++) {
  axios
    .get(INDEX_URL + pageNum)
    .then((response) => {
      USERS.push(...response.data.results) // 取得users資料後，製作分頁欄與渲染畫面
      renderPaginator(totalUserNumber)
      renderUserList(getUsersByPage(1))
    })
}

// 監聽搜尋欄位，搜尋結果隨keyword變化
searchForm.addEventListener('keyup', (e) => {
  const keyword = e.target.value.trim().toLowerCase()
  filteredUsers = USERS.filter((item) => // 從users中篩選出符合字串
    item.user.name.toLowerCase().includes(keyword)
  )
  if (filteredUsers.length >= 1) {
    renderPaginator(filteredUsers.length)
    renderUserList(getUsersByPage(1))
  } else {
    searchForm.value = keyword
    mainPanel.innerHTML = '<h3>Not getting any results.</h3>'
    paginator.innerHTML = ''
  }
})

// 在main-container中掛上監聽器，點擊後顯示使用者資料
mainPanel.addEventListener('click', (e) => {
  if (e.target.matches('.info-overlay')) {
    showUserModal(e.target.dataset.id)
  }
})

// 在個人彈出式頁面掛上監聽器，點擊後把id加到追蹤清單
userContent.addEventListener('click', (e) => {
  if (e.target.matches('#btn-following')) {
    addToFollowing(e.target.dataset.id)
  }
})

// 在paginator中掛上監聽器，點擊後載入到另一頁
paginator.addEventListener('click', (e) => {
  // 透過 dataset 取得被點擊的頁數
  const pageNum = Number(e.target.dataset.page)
  renderUserList(getUsersByPage(pageNum))
})
