<template>
    <div class="background-slider">
      <div class="gallery">
        <div
          class="gallery-item"
          v-for="(image, index) in images"
          :key="index"
          :class="{ active: index === currentIndex }"
        >
          <img :src="image" alt="gallery-image" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "BackgroundSlider",
    data() {
      return {
        currentIndex: 0,
        images: [
          "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2Fbackground%2Flviv-zgori.png?alt=media&token=8560ad72-e2e9-4930-a069-3113a37b9455",
          "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2Fbackground%2Fdvometrovi-stiny-snigu-na-vul.-stryjskij.-foto-1920-1930-h-rr.%202.png?alt=media&token=085ed21c-1c34-4afb-a181-b89149a4409c",
          "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2Fbackground%2Fpelchinskiy-stav-i-tsitadel-u-1893-rotsi.png?alt=media&token=6da1184d-113b-41d1-b0fc-9203cbd9cd44",
          "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2Fbackground%2Ftramvay-12-yide-vniz-po-vul.-krivonosa.png?alt=media&token=f3ffc1b1-686c-406c-8c65-c60b1897aa1d"
        ],
      };
    },
    mounted() {
      setInterval(() => {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
      }, 6000);
    },
  };
  </script>
  
  <style scoped>
  .background-slider {
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
  
  .gallery {
    display: flex;
    height: 100%;
    position: relative;
  }
  
  .gallery-item {
    min-width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }
  
  .gallery-item.active {
    opacity: 1;
    animation: slideIn 6s ease-out forwards;
  }
  
  .gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .background-slider::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 45%;
    height: 100%;
    background-color: black;
    z-index: 1;
  }
  
  .background-slider::after {
    content: "";
    position: absolute;
    top: 0;
    left: 45%;
    width: 55%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.9) 10%,
      rgba(0, 0, 0, 0.7) 55%,
      rgba(0, 0, 0, 0.5) 100%
    );
    z-index: 2;
  }
  
  @keyframes slideIn {
    0% {
      transform: translateX(45%);
    }
    100% {
      transform: translateX(0);
    }
  }
  </style>
  