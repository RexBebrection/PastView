<template>
  <div class="profile-view">
    <Navbar />
    <div class="profile-content">
      <div class="profile-island" v-if="userData">
        <div class="profile-info">
          <div class="profile-image-wrapper" @click="triggerFileInput">
            <img
              :src="userData.profilePicture"
              alt="Profile"
              class="profile-image"
            />
            <div class="overlay">
              <span>Змінити фото</span>
            </div>
            <input
              type="file"
              accept="image/*"
              ref="fileInput"
              @change="handleFileChange"
              class="hidden-file-input"
            />
          </div>

          <div class="profile-right">
            <div class="profile-det">
              <div class="profile-usr">
                <p class="profile-name">@{{ userData.username }}</p>
                <p class="profile-date">
                  Профіль створено {{ formatDate(userData.createdAt) }}
                </p>
              </div>
              <div v-if="userData.role !== 'moderator'">
                <div v-if="editingDescription">
                  <textarea
                    v-model="newDescription"
                    class="profile-description-textarea"
                    rows="4"
                    placeholder="Редагувати опис..."
                  ></textarea>
                  <div class="buttons-row-e">
                    <button @click="saveDescription" class="br">
                      Зберегти
                    </button>
                    <button @click="cancelEdit" class="br">Скасувати</button>
                  </div>
                </div>
                <div v-else>
                  <p class="profile-description">
                    {{
                      userData.description || "Цей користувач ще не додав опис."
                    }}
                  </p>
                </div>
              </div>
            </div>
            <div class="buttons-row" v-if="!editingDescription">
              <button
                v-if="userData.role !== 'moderator'"
                @click="editDescription"
                class="description-edit br"
              >
                Редагувати опис
              </button>
              <button @click="logout" class="logout br">Вийти з профілю</button>
              <button @click="deleteAccount" class="delete br">
                Видалити профіль
              </button>
            </div>
          </div>
        </div>
        <div v-if="userData.role == 'moderator'" class="blocked-users">
          <p class="blocked-title">Заблоковані користувачі</p>
          <div class="blocked-list-scroll">
            <div
              v-for="blocked in blockedUsers"
              :key="blocked.id"
              class="blocked-card"
            >
              <img
                :src="blocked.profilePicture"
                alt="Blocked Profile"
                class="blocked-image"
              />
              <div class="blocked-info">
                <p class="blocked-name">@{{ blocked.username }}</p>
                <p class="blocked-date">
                  Профіль заблоковано {{ formatDate(blocked.blockedAt) }}
                </p>
              </div>
              <button class="br" @click="unblockUser(blocked.id)">
                Відновити
              </button>
            </div>
          </div>
        </div>
        <div v-if="userData.role == 'moderator'" class="locations-gallery">
          <p class="blocked-title">Забраковані світлини</p>
          <div class="locations-scroll">
            <div
              v-for="location in locations"
              :key="location.id"
              class="location-image-wrapper"
            >
              <img
                :src="location.imageUrl"
                alt="Location"
                class="location-image"
              />
            </div>
          </div>
        </div>
        <div v-if="userData.role !== 'moderator'" class="profile-loc">
          <div class="profile-locations">
            <p class="blocked-title">Мої світлини</p>
            <div class="locations-scroll">
              <div
                v-for="location in userLocations"
                :key="location.id"
                class="location-image-wrapper"
              >
                <img
                  :src="location.imageUrl"
                  alt="Location"
                  class="location-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  collectionGroup,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "ProfileView",
  components: {
    Navbar,
    Footer,
  },
  data() {
    return {
      userData: null,
      editingDescription: false,
      newDescription: "",
      blockedUsers: [],
      locations: [],
      userLocations: [],
      userComments: [],
    };
  },
  methods: {
    async fetchUserData(uid) {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        this.userData = { uid, ...userSnap.data() };
        this.userLocations = await this.fetchUserLocations(uid);

        if (this.userData.role === "moderator") {
          this.fetchBlockedUsers();
          this.fetchLocations();
        }
      } else {
        console.error("Документ не знайдено!");
      }
    },
    async fetchBlockedUsers() {
      const db = getFirestore();
      const blockedUsersQuery = query(
        collection(db, "users"),
        where("status", "==", "blocked")
      );
      const blockedUsersSnap = await getDocs(blockedUsersQuery);
      this.blockedUsers = blockedUsersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async fetchLocations() {
      const db = getFirestore();
      const locationsQuery = query(
        collection(db, "locations"),
        where("status", "==", "rejected")
      );
      const locationsSnap = await getDocs(locationsQuery);
      this.locations = locationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
          this.$router.push("/");
        })
        .catch((error) => {
          console.error("Помилка при виході: ", error);
        });
    },
    async deleteAccount() {
      const auth = getAuth();
      const db = getFirestore();
      try {
        await deleteDoc(doc(db, "users", this.userData.uid));
        await auth.currentUser.delete();
        this.$router.push("/");
      } catch (error) {
        console.error("Помилка при видаленні акаунта: ", error);
      }
    },
    async unblockUser(userId) {
      const db = getFirestore();
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "active",
      });
      this.fetchBlockedUsers();
    },
    triggerFileInput() {
      console.log("Клік на зображення");
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const storage = getStorage();
        const fileRef = ref(storage, `profile_pictures/${this.userData.uid}`);

        // Завантажуємо файл у Firebase Storage
        uploadBytes(fileRef, file).then((snapshot) => {
          // Отримуємо URL завантаженого фото
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            this.updateProfilePicture(downloadURL);
          });
        });
      }
    },

    async updateProfilePicture(downloadURL) {
      const db = getFirestore();
      const userRef = doc(db, "users", this.userData.uid);

      // Оновлюємо URL фото в Firestore
      await updateDoc(userRef, {
        profilePicture: downloadURL,
      });

      // Оновлюємо локальне значення для профілю
      this.userData.profilePicture = downloadURL;
    },
    async fetchUserLocations(uid) {
      const db = getFirestore();
      const locationsQuery = query(
        collection(db, "locations"),
        where("userUid", "==", uid)
      );

      const locationsSnap = await getDocs(locationsQuery);
      return locationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    },
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.fetchUserData(user.uid);
      } else {
        this.$router.push("/");
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
  font-family: "Montserrat", sans-serif;
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
.blocked-users {
  margin-top: 30px;
  border: 2px solid white;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.blocked-title {
  color: white;
  font-size: 1rem;
  text-align: center;
  padding: 10px;
  flex-shrink: 0;
  background-color: black;
  position: sticky;
  top: 0;
  z-index: 1;
}

.blocked-list-scroll {
  overflow-y: auto;
  flex-grow: 1;
  padding: 10px 0;
}

.blocked-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
  margin-bottom: 20px;
  padding: 0px 50px;
}
.blocked-image {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
}
.blocked-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.blocked-name {
  font-size: 1rem;
  color: white;
  margin: 0;
}
.blocked-date {
  font-size: 0.8rem;
  color: #949494;
  margin: 7px 0 0 0;
}
.locations-gallery {
  margin-top: 30px;
  border: 2px solid white;
  max-height: 345px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.locations-scroll {
  overflow-y: auto;
  flex-grow: 1;
  padding: 0px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-content: center;
  padding-left: 10px;
  padding-bottom: 10px;
}

.location-image-wrapper {
  width: 265px;
  height: 265px;
  aspect-ratio: 1/1;
  overflow: hidden;
  width: 300px;
}

.location-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border: none; /* прибрати */
}

.profile-image-wrapper {
  border: 2px solid white;
  overflow: hidden; /* обрізає краї зображення + overlay */
  position: relative;
  width: 200px;
  height: 200px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-weight: bold;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-image-wrapper:hover .overlay {
  opacity: 1;
}
.hidden-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.profile-loc {
  margin-top: 30px;
  border: 2px solid white;
  display: flex;
  flex-direction: column;
}

.profile-locations {
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.locations-scroll {
  overflow-y: auto;
  flex-grow: 1;
  padding: 0px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  justify-content: center;
  padding-left: 20px;
  
  padding-bottom: 10px;
}
</style>

