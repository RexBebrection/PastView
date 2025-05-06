<template>
  <Navbar />
  <div class="approve-container">
    <p class="approve-title">Заявки на публікацію</p>

    <div v-for="request in requests" :key="request.id" class="approve-card">
      <p class="approve-card-title">
        Користувач @{{ request.username }} бажає опублікувати:
      </p>
      <div class="approve-card-header">
        <div class="approve-card-header-l">
          <img
            class="profile-photo"
            :src="request.profilePicture"
            alt="profile"
          />

          <button class="approve" @click="approveRequest(request.id)">
            Схвалити
          </button>
          <button class="reject" @click="rejectRequest(request.id)">
            Відхилити
          </button>
        </div>
        <img
          class="approve-card-header-r"
          :src="request.imageUrl"
          alt="location"
        />
      </div>
      <div class="approve-card-footer">
        <p class="approve-card-street">{{ request.address }}</p>
        <hr />
        <p class="approve-card-description">{{ request.description }}</p>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";

export default {
  name: "Approve",
  components: { Navbar, Footer },
  data() {
    return {
      requests: [],
    };
  },
  async mounted() {
    const db = getFirestore();
    const q = query(
      collection(db, "locations"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);

    const requestsWithPhotos = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userUid = data.userUid;
        let profilePicture = "/default-avatar.png"; // дефолтна аватарка

        if (userUid) {
          const userRef = doc(db, "users", userUid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            profilePicture = userSnap.data().profilePicture || profilePicture;
          }
        }

        return {
          id: docSnap.id,
          ...data,
          profilePicture,
        };
      })
    );

    this.requests = requestsWithPhotos;
  },
  methods: {
    async getUserPhotoByUsername(username) {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return userDoc.data().photoURL || null;
      }

      return null;
    },

    async approveRequest(id) {
      const db = getFirestore();
      await updateDoc(doc(db, "locations", id), {
        status: "approved",
      });
      this.requests = this.requests.filter((req) => req.id !== id);
    },

    async rejectRequest(id) {
      const db = getFirestore();
      await updateDoc(doc(db, "locations", id), {
        status: "rejected",
      });
      this.requests = this.requests.filter((req) => req.id !== id);
    },
  },
};
</script>

<style scoped>
.approve-container {
  height: 100vh;
  width: 900px;
  background-color: rgba(0, 0, 0, 0.2);
  margin: 0 auto;
  align-items: center;
  display: flex;
  justify-content: start;
  flex-direction: column;
}

.approve-title {
  font-size: 1.3rem;
  margin: 20px 0;
}

.approve-card {
  background: black;
  padding: 20px;
  margin-bottom: 20px;
  width: 700px;
  padding: 0 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

.approve-card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
}

.approve-card-header-l {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile-photo {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border: 2px solid white;
}

.approve {
  background-color: black;
  color: white;
  border: 2px solid white;
  border-radius: 0;
  padding: 12px 12px;
  cursor: pointer;
  width: 154px;
}
.reject {
  background-color: black;
  color: white;
  border: 2px solid white;
  border-radius: 0;
  padding: 12px 12px;
  cursor: pointer;
  width: 154px;
}

.approve-card-header-r {
  width: 530px;
  height: 262px;
  object-fit: cover;
}

.approve-card-footer {
  margin-top: 0px;
}

.approve-card-street {
  text-align: left;
  margin-bottom: 2px;
  font-size: 0.8rem;
}

hr {
  margin: 0;
}
.approve-card-description {
  color: white;
  border: 2px solid white;
  padding: 10px 20px;
  max-height: 45px;
  overflow-y: auto;
  white-space: pre-wrap; /* або normal */
}
</style>
