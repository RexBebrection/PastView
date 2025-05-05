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
          >
            <div class="street-name">{{ item.street }}</div>
            <div class="profile-info">
              <img
                :src="item.profileImage"
                alt="Profile"
                class="profile-image"
              />
              <p class="profile-name">{{ item.profileName }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import mapboxgl from "mapbox-gl";

export default {
  
  components: {
    Navbar,
  },
  data() {
    return {
      searchQuery: "",
      items: [
        {
          street: "Вулиця Шевченка",
          profileImage:
            "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2F491004389_596021710156389_1039114513883964411_n.jpg?alt=media&token=63353374-7c0a-4060-b208-1310f3f67bce",
          profileName: "Профіль 1",
        },
        {
          street: "Вулиця Франка",
          profileImage:
            "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2F491004389_596021710156389_1039114513883964411_n.jpg?alt=media&token=63353374-7c0a-4060-b208-1310f3f67bce",
          profileName: "Профіль 2",
        },
      ],
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter((item) =>
        item.street.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoibHZxMWljZW1hbiIsImEiOiJjbHU4ZmtuZ2MwYzRvMm9yeGQzZnBycjBkIn0.u4QC3601L2OcFCzw8kzvmw";
    const map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: "mapbox://styles/lvq1iceman/cm9ootxch009b01qs40wa1c8q",
      center: [24.0315, 49.8397],
      zoom: 13,
    });
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
  margin-bottom: 25px;
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
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 92%;
  padding: 10px;
  border: 2px solid #fff;
  background-color: #000;
  color: #fff;
  font-size: 16px;
  border-radius: 0;
}

.map-border {
  padding: 30px;
  width: 70%;
  background-color: black;
}

.map {
  width: 100%;
  height: 55vh;
  position: relative;
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
