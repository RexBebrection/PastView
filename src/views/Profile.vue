<template>
  <div class="profile-view">
    <Navbar />
    <div class="profile-content">
      <div class="profile-island" v-if="userData">
        <div class="profile-info">
          <img
            :src="userData.profilePicture"
            alt="Profile"
            class="profile-image"
          />
          <div class="profile-right">
            <div class="profile-det">
              <div class="profile-usr">
                <p class="profile-name">@{{ userData.username }}</p>
                <p class="profile-date">
                  Профіль створено {{ formatDate(userData.createdAt) }}
                </p>
              </div>
              <div v-if="editingDescription">
                <textarea
                  v-model="newDescription"
                  class="profile-description-textarea"
                  rows="4"
                  placeholder="Редагувати опис..."
                ></textarea>
                <div class="buttons-row-e">
                  <button @click="saveDescription" class="br">Зберегти</button>
                  <button @click="cancelEdit" class="br">Скасувати</button>
                </div>
              </div>
              <div v-else>
                <p class="profile-description">
                  {{ userData.description || "Цей користувач ще не додав опис." }}
                </p>
              </div>
            </div>
            <div class="buttons-row" v-if="!editingDescription">
              <button @click="editDescription" class="description-edit br">Редагувати опис</button>
              <button @click="logout" class="logout br">Вийти з профілю</button>
              <button @click="deleteAccount" class="delete br">Видалити профіль</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar.vue";

export default {
  name: "ProfileView",
  components: {
    Navbar,
  },
  data() {
    return {
      userData: null,
      editingDescription: false,
      newDescription: "",
    };
  },
  methods: {
    async fetchUserData(uid) {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        this.userData = userSnap.data();
      } else {
        console.error("Документ не знайдено!");
      }
    },
    formatDate(date) {
      if (!date) return "невідомо";
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString("uk-UA");
    },
    editDescription() {
      this.editingDescription = true;
      this.newDescription = this.userData.description || "";
    },
    async saveDescription() {
      if (this.newDescription !== this.userData.description) {
        const db = getFirestore();
        const userRef = doc(db, "users", this.userData.uid);
        await updateDoc(userRef, {
          description: this.newDescription,
        });
        this.userData.description = this.newDescription;
      }
      this.editingDescription = false;
    },
    cancelEdit() {
      this.editingDescription = false;
      this.newDescription = this.userData.description || "";
    },
    logout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          this.$router.push("/"); // Перехід на головну сторінку або іншу
        })
        .catch((error) => {
          console.error("Помилка при виході: ", error);
        });
    },
    async deleteAccount() {
      const auth = getAuth();
      const db = getFirestore();
      try {
        await deleteDoc(doc(db, "users", this.userData.uid)); // Видалення користувача з Firestore
        await auth.currentUser.delete(); // Видалення користувача з Firebase Auth
        this.$router.push("/"); // Перехід на головну сторінку або іншу
      } catch (error) {
        console.error("Помилка при видаленні акаунта: ", error);
      }
    },
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.fetchUserData(user.uid);
      } else {
        this.$router.push("/"); // Перехід на головну сторінку, якщо користувач не авторизований
      }
    });
  },
};
</script>

<style scoped>
.profile-content {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.profile-island {
  background-color: black;
  padding: 60px 100px;
  width: 1000px;
  display: flex;
  flex-direction: column;
}

.profile-info {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}

.profile-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border: 2px solid white;
}

.profile-right {
  flex: 1;
  max-width: 780px;
}

.profile-det {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 35px;
  text-align: left;
  border: 2px solid white;
}

.profile-usr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  width: 100%;
}

.profile-name {
  font-size: 1.9rem;
  font-weight: 400;
  color: white;
  margin: 0;
}

.profile-date {
  font-size: 0.8rem;
  color: #949494;
}

.profile-description {
  font-size: 0.9rem;
  color: white;
  margin-top: 15px;
  font-weight: 300;
  line-height: 1.5;
}

.profile-description-textarea {
  width: 100%;
  padding: 10px;
  font-size: 0.9rem;
  margin-top: 15px;
  border-bottom: 2px solid white;
  border-top: none;
  border-left: none;
  border-right: none;
  background-color: black;
  color: white;
  font-family: 'Montserrat', sans-serif;
}

.buttons-row {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 20px;
}

.buttons-row-e {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 20px;
}

.br {
  background-color: black;
  color: white;
  padding: 7px 8px;
  text-decoration: none;
  font-size: 0.8rem;
  border: 2px solid white;
  cursor: pointer;
}
</style>
