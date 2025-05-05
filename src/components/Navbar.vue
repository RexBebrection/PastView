<template>
  <nav>
    <div class="navbar">
      <div class="navbar-brand">
        <router-link to="/home" class="navbar-item">
          <img src="../assets/Logo(big).png" alt="Logo" />
        </router-link>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start" v-if="user">
          <router-link to="/home" class="navbar-item" id="link"
            >Головна</router-link
          >
          <router-link v-if="user.role !== 'moderator'" to="/create-location" class="navbar-item" id="link"
            >Додати локацію</router-link
          >
          <router-link
            v-if="user.role !== 'moderator'"
            to="/my-publications"
            class="navbar-item"
            id="link"
          >
            Мої публікації
          </router-link>
          <router-link
            v-if="user.role == 'moderator'"
            to="/approve"
            class="navbar-item"
            id="link"
          >
            Підтвердження
          </router-link>
          <a href="mailto:someone@example.com" v-if="user.role !== 'moderator'" class="navbar-item" id="link">
            Написати відгук
          </a>
        </div>
        
      </div>
      <div class="navbar-profile">
        <template v-if="user">
          <router-link to="/profile" class="navbar-profile-link" id="link">
            <div class="profile-pic-wrapper">
              <img :src="user.profilePicture" alt="Profile" />
            </div>
            <p class="navbar-profile-email">{{ user.email }}</p>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="navbar-item" id="link"
            >Увійти</router-link
          >
          <router-link to="/registration" class="navbar-item" id="link"
            >Зареєструватись</router-link
          >
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default {
  data() {
    return {
      user: null,
    };
  },
  created() {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        await this.fetchUserData(user.uid);
      } else {
        this.user = null;
      }
    });
  },
  methods: {
    async fetchUserData(uid) {
      const db = getFirestore();
      const userRef = doc(db, "users", uid); // Колекція "users", документ за uid
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        this.user = {
          ...this.user, // Зберігаємо основні дані
          ...userDoc.data(), // додаємо дані з Firestore
        };
      } else {
        console.log("User not found in Firestore");
      }
    },
    async logout() {
      try {
        await signOut(getAuth());
        this.$router.push("/");
      } catch (error) {
        console.error("Logout error", error);
      }
    },
  },
};
</script>

<style scoped>
.navbar {
  background-color: black;
  padding: 5px 10% 0px 10%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand img {
  max-width: 70px;
  height: auto;
}

.navbar-menu {
  display: flex;
  align-items: center;
  margin-left: 1rem;
}

.navbar-start {
  display: flex;
  gap: 1%;
  width: 600px;
}

.navbar-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.navbar-profile {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.navbar-profile-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: white;
}

.profile-pic-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.profile-pic-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.navbar-profile-email {
  font-size: 0.9rem;
  margin-left: 0px;
  color: white;
}
</style>
