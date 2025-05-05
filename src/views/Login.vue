<template>
    <div class="start">
      <BackgroundSlider />
      <div class="login-container">
        <img src="../assets/Logo(big).png" alt="Logo" class="logo-small" />
        <h2 class="login-title">Вхід</h2>
        <div class="login-inputs">
          <input
            v-model="email"
            type="text"
            placeholder="Логін"
            class="login-input"
            :class="{'input-error': loginError}"
            @keyup.enter="login"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Пароль"
            class="login-input"
            :class="{'input-error': loginError}"
            @keyup.enter="login"
          />
        </div>
        <div class="login-buttons">
          <button @click="login" class="login-button">Увійти</button>
          <router-link to="/" custom v-slot="{ navigate }">
            <button @click="navigate" class="login-button">Скасувати</button>
          </router-link>
        </div>
        <div v-if="loginError" class="error-text">Неправильні логін або пароль</div>
      </div>
    </div>
  </template>
  
  <script>
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import BackgroundSlider from "@/components/BackgroundSlider.vue";
  
  export default {
    components: {
      BackgroundSlider,
    },
    data() {
      return {
        email: '',
        password: '',
        loginError: false, // Флаг для помилки
      };
    },
    methods: {
      async login() {
        const auth = getAuth();
        try {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          console.log("Успішний вхід!");
          this.$router.push("/home");
          this.loginError = false; // При успішному вході, помилка скидається
        } catch (error) {
          console.error("Помилка входу:", error.message);
          this.loginError = true; // Якщо помилка, ставимо флаг
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .start {
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
  
  .login-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    max-width: 350px;
    width: 90%;
    padding: 40px 30px;
    border: 2px solid white;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 50px;
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  .logo-small {
    width: 60px;
  }
  
  .login-title {
    color: white;
    font-size: 1.2rem;
    font-weight: 400;
    margin: 0;
  }
  
  .login-inputs {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 80%;
  }
  
  .login-input {
    padding: 10px;
    background: transparent;
    border: none;
    border-bottom: 2px solid white;
    color: white;
    font-size: 1rem;
    outline: none;
  }
  
  .login-input::placeholder {
    color: white;
    opacity: 0.7;
  }
  
  .login-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 40%;
  }
  
  .login-button {
    width: 100%;
    padding: 10px;
    background: transparent;
    color: white;
    border: 2px solid white;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .login-input:-webkit-autofill,
  .login-input:-webkit-autofill:hover,
  .login-input:-webkit-autofill:focus,
  .login-input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
    box-shadow: 0 0 0px 1000px transparent inset !important;
    -webkit-text-fill-color: white !important;
    transition: background-color 5000s ease-in-out 0s;
  }
  
  .input-error {
    border-bottom: 2px solid red;
  }
  
  .error-text {
    color: red;
    font-size: 0.8rem;
    margin-top: 10px;
  }
  </style>
  