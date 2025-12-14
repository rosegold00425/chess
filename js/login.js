import { auth } from "./firebase.js";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import User from "./data.js";
import { getUserData } from "./dataManager.js";

const form = document.getElementById("login-form");
const emailEl = document.getElementById("login-email");
const pwEl = document.getElementById("login-pw");
const rememberEl = document.getElementById("remember-login");
const errorEl = document.getElementById("login-error");

const linkReset = document.getElementById("link-reset");
const linkSignup = document.getElementById("link-signup");

// 에러 메시지 한국어로 조금 보기 좋게
function humanizeAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "이메일 형식이 올바르지 않습니다.";
    case "auth/missing-password":
      return "비밀번호를 입력해 주세요.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/user-not-found":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "auth/too-many-requests":
      return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    default:
      return `로그인에 실패했습니다. (${code})`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const email = emailEl.value.trim();
  const password = pwEl.value;

  try {
    await setPersistence(
      auth,
      rememberEl.checked ? browserLocalPersistence : browserSessionPersistence
    );

    const cred = await signInWithEmailAndPassword(auth, email, password);

    console.log("login ok uid =", cred.user.uid);

    window.user = createUser(cred.user.uid);
    pageChange(1);

  } catch (err) {
    console.error(err);
    errorEl.textContent = humanizeAuthError(err.code);
    errorEl.style = "display: block";
  }
});

linkReset.addEventListener("click", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const email = emailEl.value.trim();
  if (!email) {
    errorEl.textContent = "먼저 이메일을 입력해 주세요.";
    errorEl.style = "display: block";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    errorEl.textContent = "비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해 주세요.";
    errorEl.style = "display: block";
  } catch (err) {
    console.error(err);
    errorEl.textContent = humanizeAuthError(err.code);
    errorEl.style = "display: block";
  }
});

linkSignup.addEventListener("click", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const email = emailEl.value.trim();
  const password = pwEl.value;

  if (!email || !password) {
    errorEl.textContent = "회원가입하려면 이메일과 비밀번호를 입력해 주세요.";
    errorEl.style = "display: block";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log("signup ok uid =", cred.user.uid);
    errorEl.textContent = "회원가입 완료! 로그인되었습니다.";
    errorEl.style = "display: block";
  } catch (err) {
    console.error(err);
    errorEl.textContent = humanizeAuthError(err.code);
    errorEl.style = "display: block";
  }
});

function changePage(num){
  const app = document.querySelector('.app');
  if (!app) return;

  const sections = app.querySelectorAll(':scope > section');
  if (sections.length === 0) return;

  const main = window.main;
  const user = window.user;
  main.setUser(user);
  main.updateUserData();

  let activeIndex = 0;

  sections.forEach((section, i) => {
    if (section.classList.contains('screen--active')) activeIndex = i;
  });

  const nextIndex = num;

  sections[activeIndex].classList.remove('screen--active');
  sections[nextIndex].classList.add('screen--active');
}

async function createUser(uid) {
    const userData = await getUserData(uid);
    console.log("userData loaded:", userData);

    const user = new User(
        userData.uid,
        userData.name,
        userData.cash,
        userData.score,
        userData.tier
    );
    
    window.user = user;
    return user;
}

onAuthStateChanged(auth, async(fbUser) => {
  if (fbUser) {
    console.log("already logged in:", fbUser.uid);
    const user = await createUser(fbUser.uid);
    changePage(1);
  }
});