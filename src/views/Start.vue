<template>
  <div class="start">
    <BackgroundSlider />
    <div class="island">
      <div class="island-border">
        <img src="../assets/Logo(big).png" alt="Island" class="island-image" />
        <p class="island-text">
          Ласкаво просимо до Past View — унікального сервісу, що переносить вас
          у минуле міста. Натискайте на точки на карті, щоб побачити старовинні
          фотографії та дізнатися історії цих місць. Зареєструйтеся, щоб
          додавати власні знімки, коментувати й ділитися своїми враженнями.
          Відчуйте історію міста по-новому!
        </p>
      </div>
      <div class="island-buttons">
        <router-link to="/home" class="button-i">Почати</router-link>
        <router-link to="/login" class="button-i">Увійти</router-link>
        <router-link to="/registration" class="button-i"
          >Зареєструватись</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import BackgroundSlider from "@/components/BackgroundSlider.vue";

export default {
  components: {
    BackgroundSlider,
  },
};
</script>

<style scoped>
.start {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
.island {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.island-border {
  border: 2px solid white;
  padding: 10px 5%;
  display: flex;
  justify-content: center;
  gap: 10%;
  text-align: right;
  font-size: 1.2rem;
}
.island-buttons {
  display: flex;
  justify-content: start;
  gap: 25px;
}
.button-i {
  background-color: black;
  color: white;
  padding: 10px 20px;

  text-decoration: none;
  font-size: 1.2rem;
  border: 2px solid white;
}
</style>
