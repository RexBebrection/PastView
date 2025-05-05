<template>
  <Navbar />
  <div class="create">
    <div class="island-create">
      <p class="location-title">Створення локації</p>
      <div class="b-c">
        <div class="l-c">
          <p class="p-t">Додайте локацію</p>
          <input
            v-model="searchQuery"
            @input="fetchSuggestions"
            @keydown.down="highlightSuggestion(1)"
            @keydown.up="highlightSuggestion(-1)"
            @keydown.enter="selectHighlighted"
            type="text"
            placeholder="Введіть адресу"
            class="address-input"
          />
          <ul v-if="suggestions.length" class="suggestions">
            <li
              v-for="(suggestion, index) in suggestions"
              :key="index"
              :class="{ active: index === highlighted }"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion.place_name }}
            </li>
          </ul>
        </div>
        <div ref="mapContainer" class="location-map"></div>
      </div>
      <div class="b-c">
        <div class="l-c">
          <p class="p-t">Додайте зображення</p>
          <button @click="uploadImage" class="c-button">Додати фото</button>
          <button @click="removeImage" class="c-button">Видалити фото</button>
        </div>
        <div
          v-if="imageUrl"
          class="image-preview"
          :style="{ backgroundImage: `url(${imageUrl})` }"
        ></div>
        <div
          v-else
          class="image-upload-area"
          @drop.prevent="onDrop"
          @dragover.prevent
          @dragstart="startDrag"
          @dragend="endDrag"
          :style="dragStyle"
          draggable="true"
        >
          <span>Перетягніть фото сюди</span>
        </div>
      </div>
      <div class="b-c-det">
        <p class="p-t">Створіть опис</p>
        <input
          v-model="locationName"
          type="text"
          placeholder="Введіть назву"
          class="det-inp"
          required
        />
        <input
          v-model="locationDescription"
          type="text"
          placeholder="Введіть опис"
          class="det-inp"
        />
      </div>
      <div class="location-buttons">
        <button @click="saveLocation" class="c-button b">Зберегти</button>
        <button @click="cancel" class="c-button b">Скасувати</button>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import Navbar from "@/components/Navbar.vue";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

mapboxgl.accessToken =
  "pk.eyJ1IjoibHZxMWljZW1hbiIsImEiOiJjbHU4ZmtuZ2MwYzRvMm9yeGQzZnBycjBkIn0.u4QC3601L2OcFCzw8kzvmw";

export default {
  name: "CreateLocation",
  components: {
    Navbar,
  },
  data() {
    return {
      map: null,
      marker: null,
      searchQuery: "",
      suggestions: [],
      highlighted: -1,
      imageUrl: "",
      locationName: "",
      locationDescription: "",
      isDragging: false,
      dragStyle: {},
      locationCoords: null,
      imageFile: null,
    };
  },
  methods: {
    async fetchSuggestions() {
      if (!this.searchQuery) {
        this.suggestions = [];
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          this.searchQuery
        )}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`
      );
      const data = await response.json();
      this.suggestions = data.features;
    },
    selectSuggestion(suggestion) {
      this.searchQuery = suggestion.place_name;
      this.suggestions = [];
      const [lng, lat] = suggestion.center;
      this.setMarker(lng, lat);
    },
    highlightSuggestion(direction) {
      const max = this.suggestions.length - 1;
      if (max < 0) return;

      this.highlighted += direction;
      if (this.highlighted < 0) this.highlighted = max;
      if (this.highlighted > max) this.highlighted = 0;
    },
    selectHighlighted() {
      if (this.highlighted >= 0 && this.highlighted < this.suggestions.length) {
        this.selectSuggestion(this.suggestions[this.highlighted]);
      }
    },
    setMarker(lng, lat) {
      if (!this.map) return;
      this.map.flyTo({ center: [lng, lat], zoom: 14 });

      if (this.marker) {
        this.marker.setLngLat([lng, lat]);
      } else {
        this.marker = new mapboxgl.Marker({ color: "red", draggable: true })
          .setLngLat([lng, lat])
          .addTo(this.map);

        this.marker.on("dragend", this.reverseGeocodeMarker);
      }

      this.reverseGeocodeMarker();
      this.locationCoords = { lng, lat };
    },
    async reverseGeocodeMarker() {
      const lngLat = this.marker.getLngLat();
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features[0]) {
        this.searchQuery = data.features[0].place_name;
      }
    },
    uploadImage() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        this.imageFile = event.target.files[0];
        if (this.imageFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imageUrl = e.target.result;
          };
          reader.readAsDataURL(this.imageFile);
        }
      };
      input.click();
    },
    removeImage() {
      this.imageFile = null;
      this.imageUrl = "";
    },
    startDrag() {
      this.isDragging = true;
      this.dragStyle = {
        cursor: "grabbing",
        opacity: 0.7,
      };
    },
    endDrag() {
      this.isDragging = false;
      this.dragStyle = {};
    },
    async saveLocation() {
      if (
        !this.locationName ||
        !this.searchQuery ||
        !this.imageFile ||
        !this.locationCoords
      ) {
        alert("Будь ласка, заповніть всі обов'язкові поля!");
        return;
      }

      const storage = getStorage();
      const storageRef = ref(
        storage,
        `locations/${Date.now()}_${this.imageFile.name}`
      );

      try {
        const snapshot = await uploadBytes(storageRef, this.imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        let username = "Без імені";
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          username = userDocSnap.data().username || username;
        }


        const locationRef = collection(db, "locations");
        await addDoc(locationRef, {
          name: this.locationName,
          description: this.locationDescription,
          address: this.searchQuery,
          coordinates: this.locationCoords,
          userUid: user.uid,
          username: username,
          imageUrl: imageUrl,
          status: "pending",
          createdAt: Timestamp.fromDate(new Date()),
        });

        alert("Локацію успішно додано!");
        this.clearForm();
      } catch (error) {
        console.error("Error saving location:", error);
        alert("Сталася помилка при збереженні локації.");
      }
    },
    clearForm() {
      this.searchQuery = "";
      this.locationName = "";
      this.locationDescription = "";
      this.imageFile = null;
      this.imageUrl = "";
      this.locationCoords = null;
    },
    cancel() {
      this.$router.push("/home");
    },
  },
  mounted() {
    this.map = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      center: [24.0315, 49.8397],
      zoom: 10,
      style: "mapbox://styles/lvq1iceman/cm9ootxch009b01qs40wa1c8q",
    });

    this.map.on("load", () => {
      this.map.resize();
    });

    this.map.on("click", (e) => {
      this.setMarker(e.lngLat.lng, e.lngLat.lat);
    });
  },
};
</script>

<style scoped>
.create {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.island-create {
  background-color: black;
  padding: 30px 100px 80px 100px;
  width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.location-title {
  font-size: 1.3rem;
  color: white;
  margin: 0;
  margin-bottom: 20px;
}

.b-c {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px 20px;
  gap: 20px;
  width: 100%;
  border: 2px solid white;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.l-c {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 300px;
  flex: 1;
}

.p-t {
  font-size: 1.1rem;
  color: white;
}

.address-input {
  width: 270px;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.location-map {
  width: 100%;
  max-width: 650px;
  height: 350px;
  border: 2px solid white;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  background: black;
  border: 1px solid white;
  max-height: 150px;
  overflow-y: auto;
  color: white;
  box-sizing: border-box;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
}

.suggestions li.active {
  background-color: white;
  color: black;
}

.c-button {
  background-color: black;
  color: white;
  padding: 7px 8px;
  text-decoration: none;
  font-size: 0.9rem;
  border: 2px solid white;
  cursor: pointer;
  width: 150px;
}

.image-upload-area {
  width: 650px;
  height: 300px;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  border: 2px solid white;
  cursor: grab;
}

.image-preview {
  width: 650px;
  height: 300px;
  background-size: cover;
  background-position: center;
  border: 2px solid white;
}
.b-c-det {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 20px;
  gap: 20px;
  width: 100%;
  border: 2px solid white;
  box-sizing: border-box;
  flex-wrap: wrap;
  text-align: center;
}
.det-inp {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  border-bottom: 2px solid white;
  color: white;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}

.location-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}

.location-buttons .c-button {
  width: 100%;
  max-width: 150px;
  font-size: 1rem;
  height: 40px;
}
</style>
