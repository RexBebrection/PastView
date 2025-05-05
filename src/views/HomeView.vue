<template>
  <div class="home">
    <Navbar />
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
            <div class="profile-info">
              <img
                :src="item.profileImage"
                alt="Profile"
                class="profile-image"
              />
              <p class="profile-name">{{ item.username }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import mapboxgl from "mapbox-gl";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      searchQuery: "",
      locations: [],
      map: null,
    };
  },
  computed: {
    filteredItems() {
      return this.locations.filter((item) =>
        item.street.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
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
          const coordinates = data.coordinates; // Маємо координати

          // Перевірка, чи є координати
          if (
            !coordinates ||
            isNaN(coordinates.lat) ||
            isNaN(coordinates.lng)
          ) {
            console.error(`Некоректні координати для локації ${docSnap.id}`);
            return null; // Пропустимо цю локацію, якщо координати некоректні
          }

          // Отримуємо дані користувача
          const userUid = data.userUid;
          const userRef = doc(db, "users", userUid);
          const userSnap = await getDoc(userRef);
          let profilePicture = "/default-avatar.png"; // дефолтна аватарка
          let username = "Unknown";

          if (userSnap.exists()) {
            const userData = userSnap.data();
            profilePicture = userData.profilePicture || profilePicture;
            username = userData.username || username;
          }

          return {
            id: docSnap.id,
            street: data.address, // Адреса
            profileImage: profilePicture, // Фото користувача
            username: username, // Ім'я користувача
            coordinates: [coordinates.lng, coordinates.lat], // координати для маркерів
            locationImage: data.image || "/default-location.jpg", // Фото локації
          };
        })
      );

      // Фільтруємо некоректні локації
      this.locations = locationsWithPhotos.filter((item) => item !== null);

      // Додавання маркерів на карту
      this.locations.forEach((location) => {
        new mapboxgl.Marker()
          .setLngLat(location.coordinates)
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <img src="${location.locationImage}" alt="Location Photo" style="width: 100%; height: auto;">
            `)
          )
          .addTo(this.map);
      });
    },
    focusOnLocation(item) {
      const { coordinates } = item;
      this.map.flyTo({ center: coordinates, zoom: 15 });
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
  },
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.home-content {
  display: flex;
  flex-direction: column;
  padding: 20px 15%;
  flex: 1;
  position: relative;
}

.home-title {
  font-size: 22px;
  margin: 10px 0 10px 0;
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
  padding: 20px;
  width: 30%;
  overflow-y: auto;
  flex: 1;
  color: white;
  height: 46.5vh;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 265px;
  padding: 7px;
  border: 2px solid #fff;
  background-color: #000;
  color: #fff;
  font-size: 16px;
  border-radius: 0;
  position: absolute;
}

.map-border {
  padding: 30px;
  width: 70%;
  background-color: black;
}

.map {
  width: 100%;
  height: 45vh;
  position: relative;
  overflow: hidden;
}

.home-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.street-name {
  flex: 1;
  font-size: 14px;
  font-weight: 400;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-image {
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
</style>
