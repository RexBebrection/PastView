import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref } from "vue";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();
const user = ref(null);

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        user.value = {
          uid: firebaseUser.uid,
          ...userSnap.data(), // динамічно тягне ВСІ поля з документа
        };
      } else {
        console.warn("Документ користувача не знайдено в Firestore.");
        user.value = { uid: firebaseUser.uid };
      }
    } catch (err) {
      console.error("Помилка при завантаженні користувача:", err);
      user.value = null;
    }
  } else {
    user.value = null;
  }
});

export { auth, user };
