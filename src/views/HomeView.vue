<template>
  <Navbar />
  <div class="home">
    <div class="home-content">
      <p class="home-title">Інтерактивна ретро-карта міста Львів</p>
      <div class="home-info-container">
        <div class="map-border">
          <div ref="mapContainer" class="map"></div>
        </div>
        <div class="home-info-list">
          <div class="search-bar">
            <input type="text" v-model="searchQuery" placeholder="Пошук..." />
          </div>
          <div
            class="home-info-item"
            v-for="(item, index) in filteredItems"
            :key="index"
            @click="focusOnLocation(item)"
          >
            <div class="street-name">{{ item.street }}</div>
            <div class="profile-info-home">
              <img
                :src="item.profileImage"
                alt="Profile"
                class="profile-image-home"
              />
              <p class="profile-name">{{ item.username }}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedLocation" class="location-details">
        <div class="location-details-left">
          <div class="location-details-data">
            <p>{{ selectedLocation.street }}</p>
            <p>Copyright: @{{ selectedLocation.username }}</p>
          </div>
          <div class="location-details-comments">
            <form @submit.prevent="addComment">
              <input
                type="text"
                v-model="newComment"
                placeholder="Напиши коментар..."
              />
              <button type="submit">Додати</button>
            </form>

            <div class="comments">
              <p v-if="comments.length === 0">Коментарів поки немає.</p>
              <ul>
                <li
                  v-for="(comment, index) in comments"
                  :key="index"
                  class="comment-item"
                >
                  <img
                    :src="comment.profileImage"
                    alt="avatar"
                    class="comment-avatar"
                  />
                  <div>
                    <p class="comment-username">{{ comment.username }}</p>
                    <p class="comment-text">{{ comment.text }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="location-details-right">
          <img
            :src="selectedLocation.locationImage"
            alt="Large Location"
            class="large-photo"
          />
          <div class="location-navigation">
            <button @click="goToPreviousLocation" :disabled="!hasPrevious">
              ←
            </button>
            <button @click="goToNextLocation" :disabled="!hasNext">→</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import mapboxgl from "mapbox-gl";

export default {
  components: {
    Navbar,
    Footer
  },
  data() {
    return {
      searchQuery: "",
      locations: [],
      map: null,
      selectedLocation: null,
      comments: [],
      newComment: "",
      currentUser: {
        username: "",
        profileImage: "",
      },
    };
  },
  computed: {
    filteredItems() {
      return this.locations.filter((item) =>
        item.street.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    currentIndex() {
      return this.locations.findIndex(
        (loc) => loc.id === this.selectedLocation?.id
      );
    },
    hasPrevious() {
      return this.currentIndex > 0;
    },
    hasNext() {
      return this.currentIndex < this.locations.length - 1;
    },
  },
  watch: {
    selectedLocation(newVal) {
      if (newVal) {
        this.loadComments(newVal.id);
      }
    },
  },

  methods: {
    async fetchLocations() {
      const db = getFirestore();
      const q = query(
        collection(db, "locations"),
        where("status", "==", "approved")
      );
      const querySnapshot = await getDocs(q);
      const locationsWithPhotos = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const coordinates = data.coordinates;

          if (
            !coordinates ||
            isNaN(coordinates.lat) ||
            isNaN(coordinates.lng)
          ) {
            console.error(`Некоректні координати для локації ${docSnap.id}`);
            return null;
          }

          const userUid = data.userUid;
          const userRef = doc(db, "users", userUid);
          const userSnap = await getDoc(userRef);

          let profilePicture = "/default-avatar.png";
          let username = "Анонім";

          if (userSnap.exists()) {
            const userData = userSnap.data();
            profilePicture = userData.profilePicture || profilePicture;
            username = userData.username || username;
          } else {
            console.error(`Не знайдено користувача з UID ${userUid}`);
          }

          return {
            id: docSnap.id,
            street: data.address,
            profileImage: profilePicture,
            username: username,
            coordinates: [coordinates.lng, coordinates.lat],
            locationImage: data.imageUrl || "/default-location.jpg",
          };
        })
      );

      this.locations = locationsWithPhotos.filter((item) => item !== null);

      this.locations.forEach((location) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.backgroundImage =
          "url('https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2FPointerBlicking.png?alt=media&token=836b276d-467a-4239-8848-8a6ce42a941e')";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.backgroundSize = "cover";
        el.style.cursor = "pointer";

        const marker = new mapboxgl.Marker(el)
          .setLngLat(location.coordinates)
          .setPopup(
            new mapboxgl.Popup().setHTML(`
        <img class="photo-preview" src="${location.locationImage}" alt="Location Photo" ">
        <p class="text-preview" style="margin-top: 4px;">${location.street}</p>
      `)
          )
          .addTo(this.map);

        el.addEventListener("click", () => {
          this.selectedLocation = location;
        });
      });
    },
    focusOnLocation(item) {
      this.map.flyTo({ center: item.coordinates, zoom: 15 });
      this.selectedLocation = item;
    },
    async addComment() {
      if (!this.newComment.trim() || !this.selectedLocation) return;

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not logged in.");
        return;
      }

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error(`Користувач з UID ${user.uid} не знайдений.`);
        return;
      }

      const userData = userSnap.data();
      const username = userData.username || "Анонім";
      const profileImage = userData.profilePicture || "/default-avatar.png";

      const commentsRef = collection(
        db,
        "locations",
        this.selectedLocation.id,
        "comments"
      );

      await addDoc(commentsRef, {
        text: this.newComment,
        createdAt: new Date(),
        userUid: user.uid,
        username: username,
        profileImage: profileImage,
      });

      this.newComment = "";
      this.loadComments(this.selectedLocation.id);
    },
    async loadComments(locationId) {
      const db = getFirestore();
      const commentsRef = collection(db, "locations", locationId, "comments");
      const snapshot = await getDocs(commentsRef);

      // Мапимо коментарі, і дані вже є в самих коментарях
      this.comments = snapshot.docs.map((doc) => doc.data());
    },
    goToPreviousLocation() {
      if (this.hasPrevious) {
        const prev = this.locations[this.currentIndex - 1];
        this.focusOnLocation(prev);
      }
    },
    goToNextLocation() {
      if (this.hasNext) {
        const next = this.locations[this.currentIndex + 1];
        this.focusOnLocation(next);
      }
    },
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibHZxMWljZW1hbiIsImEiOiJjbHU4ZmtuZ2MwYzRvMm9yeGQzZnBycjBkIn0.u4QC3601L2OcFCzw8kzvmw";
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: "mapbox://styles/lvq1iceman/cm9ootxch009b01qs40wa1c8q",
      center: [24.0315, 49.8397],
      zoom: 13,
    });
    window.addEventListener("resize", () => {
      if (this.map) {
        this.map.resize();
      }
    });
    this.fetchLocations();
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const profilePicture =
            userData.profilePicture || "/default-avatar.png";
          const username = userData.username || "Анонім";

          if (userSnap.exists()) {
            const userData = userSnap.data();
            this.currentUser = {
              uid: user.uid,
              username: userData.username || "Анонім",
              profileImage: userData.profilePicture || "/default-avatar.png",
            };
          }
        } else {
          console.error(`Не знайдено користувача з UID ${userUid}`);
          return null;
        }
      }
    });
  },
};
</script>

<style>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40px;
  min-height: 100vh;
}

.home-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  width: 1200px;
}

.home-title {
  font-size: 21px;
  margin: 30px 0 10px 0;
}

.home-info-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.home-info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: black;
  border-radius: 3px;
  padding: 60px 10px 20px 20px;
  width: 30%;
  overflow-y: auto;
  flex: 1;
  color: white;
  height: 370px;
  scrollbar-width: thin;
}

.search-bar {
  margin-bottom: 20px;
  width: 275px;
  height: 70px;
  background-color: black;
  position: absolute;
  margin: -60px -20px -20px -20px;
  align-items: center;
  display: flex;
  justify-content: center;
}

.search-bar input {
  width: 220px;
  padding: 7px;
  border: 2px solid #fff;
  background-color: #000;
  color: #fff;
  font-size: 16px;
  border-radius: 0;
}

.map-border {
  padding: 25px;
  width: 70%;
  background-color: black;
}

.map {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}

.home-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px 10px 0px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.street-name {
  flex: 1;
  font-size: 13px;
  font-weight: 400;
  max-width: 160px;
}

.profile-info-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 50px;
}

.profile-image-home {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 5px;
}

.profile-name {
  font-size: 12px;
  font-weight: 400;
  font-weight: normal;
  margin: 0;
}
.custom-marker {
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.location-details {
  margin-top: 20px;
  color: #fff;
  display: flex;
  flex-direction: row;
  gap: 55px;
}

.location-details-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 55%;
}

.location-details-data {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: start;
  background-color: black;
  padding: 20px;
}

.location-details-data p {
  margin: 0;
  font-size: 0.9rem;
}

.location-details-comments {
  background-color: black;
  padding: 20px 30px;
  width: 97%;
}

.location-details-comments form {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.location-details-comments form input {
  width: 100%;
  padding: 10px;
  background-color: black;
  border: 2px solid #fff;
  color: #fff;
  font-size: 0.8rem;
  border-radius: 0;
}

.location-details-comments form button {
  padding: 10px;
  background-color: black;
  border: 2px solid #fff;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}

.comments {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.comments ul {
  list-style: none;
  padding: 0;
}
.comment-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.comment-username {
  font-size: 0.95rem;
  margin: 0;
}

.comment-text {
  font-size: 0.9rem;
  color: #7a7a7a;
  margin: 0;
}

.location-details-right {
  display: flex;
  flex-direction: column;
  width: 40%;
  padding-top: 20px;
  padding-bottom: 15px;
  background-color: black;
  justify-content: center;
  align-items: center;
  height: 300px;
}
.large-photo {
  width: 435px;
  height: 250px;
  object-fit: cover;
  margin-bottom: 10px;
  border: 2px solid #fff;
}
.location-navigation {
  display: flex;
  justify-content: start;
  align-items: start;
  margin-top: 10px;
  width: 100%;
  padding-left: 40px;
  gap: 15px;
}
.location-navigation button {
  background-color: black;
  border: 2px solid #fff;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
  width: 90px;
  height: 25px;
}

.mapboxgl-popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: black;
  color: white;

  border-radius: 4px;
  font-size: 0.8rem;
}
.photo-preview {
  width: 220px;
  height: 115px;
  object-fit: cover;
}

.text-preview {
  font-size: 0.8rem;
  color: white;
  margin: 0;
}
</style>
