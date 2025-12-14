import User from "./data.js";

function pageChanger() {
  const app = document.querySelector('.app');
  if (!app) return;

  const sections = app.querySelectorAll(':scope > section');
  if (sections.length === 0) return;

  let activeIndex = 0;

  sections.forEach((section, i) => {
    if (section.classList.contains('screen--active')) activeIndex = i;
  });

  const nextIndex = (activeIndex + 1) % sections.length;

  sections[activeIndex].classList.remove('screen--active');
  sections[nextIndex].classList.add('screen--active');
}

function testUserHandler(){
  const main = window.main;

  const user1 = new User("젤리뽀", 0, 0, 6);
  const user2 = new User("뽀리젤", 0, 0, 6);

  const button = document.getElementById('user-changer');

  if(button.dataset.user == "1"){
    main.setUser(user2);
    button.dataset.user = "2";
  }else{
    main.setUser(user1);
    button.dataset.user = "1";
  }

  main.updateUserData();
}

window.pageChanger = pageChanger;
window.testUserHandler = testUserHandler;