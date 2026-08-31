// utils/bookmarkStorage.js
//
// السيرفر بتاع route-posts فيه بس PUT /posts/:postId/bookmark (toggle) وملوش
// أي endpoint بيرجع "قائمة البوستس المحفوظة" (GET /posts/bookmarks مش موجود
// أصلًا في الـ API الرسمي، عشان كده كان بيرجع 400).
//
// عشان تاب "Saved" يشتغل، بنحتفظ بقائمة الـ post ids المحفوظة على جهاز
// اليوزر نفسه في localStorage، وبنستخدمها كفلتر فوق بيانات /posts العادية.
//
// ✅ إصلاح: كل الـ ids بتتحول لـ String دايمًا قبل التخزين/المقارنة.
// السبب: بعض المنشورات (خصوصًا "القديمة") ممكن يوصلها الـ id كـ رقم أو
// كـ نوع مختلف شوية عن الـ id بتاع منشور "جديد لسه اتعمل"، وبما إن
// getSavedPostIds().includes(postId) بيعمل strict equality (===)،
// أي فرق بسيط في النوع (number vs string) كان كافي إنه يخلي isPostSaved()
// يرجع false حتى لو الـ id "متطابق" شكليًا. توحيد النوع لـ String بيقفل
// الباب ده تمامًا.

const STORAGE_KEY = "savedPostIds";
const EVENT_NAME = "bookmarks-updated";

function normalizeId(postId) {
  if (postId === null || postId === undefined) return null;
  return String(postId);
}

export function getSavedPostIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // نضمن كمان إن أي حاجة اتخزنت قديمًا (قبل الإصلاح ده) بشكل غير String
    // ترجع موحدة برضو، عشان المقارنات القديمة اللي في localStorage
    // الجهاز بتاع اليوزر ما تفضلش عالقة.
    return Array.isArray(parsed) ? parsed.map(normalizeId).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function isPostSaved(postId) {
  const id = normalizeId(postId);
  if (!id) return false;
  return getSavedPostIds().includes(id);
}

// saved = true يضيف الـ id، saved = false يشيله. بيبعت event عشان أي
// كومبوننت تاني (زي Profile.jsx) يعرف يحدث نفسه فورًا.
export function setPostSaved(postId, saved) {
  const id = normalizeId(postId);
  if (!id) {
    // ✅ حماية: لو postId مش موجود أصلًا (undefined/null)، منسجلش حاجة
    // غلط في localStorage بدل ما نحفظ "undefined" كـ string فعلي.
    console.warn(
      "[bookmarkStorage] setPostSaved called with an empty postId — ignored.",
    );
    return getSavedPostIds();
  }

  const ids = getSavedPostIds();
  const nextIds = saved
    ? Array.from(new Set([...ids, id]))
    : ids.filter((existingId) => existingId !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
  window.dispatchEvent(new Event(EVENT_NAME));

  return nextIds;
}

export function onBookmarksUpdated(callback) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
