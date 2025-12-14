import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * userData/{uid} 문서를 보장(없으면 생성)하고 최종 유저 데이터를 반환
 * @param {object} params
 * @param {string} params.uid - Firebase Auth uid
 * @param {string|null} [params.name] - 표시 이름(없으면 기본값)
 * @param {string|null} [params.email] - 이메일(옵션)
 * @returns {Promise<object>} userData
 */
export async function getUserData(uid) {
  if (!uid) throw new Error("ensureUserDoc: uid is required");

  const ref = doc(db, "userData", uid);
  const snap = await getDoc(ref);

  // 문서가 있으면 그대로 반환
  if (snap.exists()) {
    return { uid, ...snap.data() };
  }

  // 문서가 없으면 기본값 생성
  const defaultData = {
    uid,
    name: "게스트",
    cash: 0,
    score: 0,
    tier: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 생성(덮어쓰기) — 최초 생성이므로 merge 필요 없음
  await setDoc(ref, defaultData);

  // serverTimestamp는 즉시 값이 안 들어올 수 있어서(로컬 캐시), 반환은 기본값으로
  return defaultData;
}