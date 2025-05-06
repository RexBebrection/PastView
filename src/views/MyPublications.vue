<template>
  <Navbar />
  <div class="publications">
    <p class="publication-title">Мої публікації</p>
    <div class="publication-grid">
      <div
        class="publication-card"
        v-for="publication in publications"
        :key="publication.id"
        @mouseenter="publication.showActions = true"
        @mouseleave="publication.showActions = false"
      >
        <img
          :src="publication.imageUrl"
          alt="Publication Image"
          class="publication-image"
        />
        <div
          class="action-container"
          :class="{ 'show-actions': publication.showActions }"
        >
          <p class="publication-address-mobile">{{ publication.address }}</p>
          <router-link :to="'/edit-location/' + publication.id"
            class="action">Редагувати</router-link
          ><br />
          <button class="action" @click="deletePublication(publication.id)">
            Видалити
          </button>
        </div>
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
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, onMounted, onBeforeUnmount } from "vue";

export default {
  name: "MyPublications",
  components: { Navbar, Footer },
  data() {
    return {
      publications: [],
      userUid: "",
      isMounted: false,
    };
  },
  methods: {
    async deletePublication(id) {
      const db = getFirestore();
      const publicationRef = doc(db, "locations", id);
      await deleteDoc(publicationRef);
      this.publications = this.publications.filter((pub) => pub.id !== id);
    },
    editPublication(id) {},
  },
  async mounted() {
    const auth = getAuth();
    const db = getFirestore();

    this.userUid = auth.currentUser.uid;
    this.isMounted = true;

    const q = query(
      collection(db, "locations"),
      where("userUid", "==", this.userUid),
      where("status", "==", "approved")
    );

    const querySnapshot = await getDocs(q);

    if (this.isMounted) {
      this.publications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        showActions: false,
      }));
    }
  },
  onBeforeUnmount() {
    this.isMounted = false;
  },
};
</script>

<style scoped>
.publications {
  height: 100vh;
  width: 900px;
  background-color: rgba(0, 0, 0, 0.2);
  margin: 0 auto;
  align-items: center;
  display: flex;
  justify-content: start;
  flex-direction: column;
  padding-bottom: 40px;
}

.publication-title {
  font-size: 1.5rem;
  margin: 20px 0;
}

.publication-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.publication-card {
  background-color: black;
  padding: 7px;
  width: 255px;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.publication-image {
  width: 250px;
  height: 150px;
  object-fit: cover;
  border: 2px solid white;
  margin-bottom: 30px;
}

.publication-details {
  margin-top: 0;
}

.publication-address {
  font-size: 0.8rem;
  margin: 0;
  padding-bottom: 7px;
}

.action-container {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  background-color: black;
  padding: 10px;
    
  transition: bottom 0.3s ease;
  overflow: hidden;
}

.show-actions {
  bottom: 0;
}

.publication-address-mobile {
  font-size: 0.8rem;
  color: white;
  margin: 0;
  padding-bottom: 7px;
}

.action {
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  background-color: transparent;
  border: none;
  margin: 0;
  padding: 7px 0;
  text-decoration: none;
}
</style>
