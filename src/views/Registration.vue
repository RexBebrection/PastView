<template>
    <div class="start">
      <BackgroundSlider />
      <div class="registation-container">
        <img src="../assets/Logo(big).png" alt="Logo" class="logo-small" />
        <h2 class="registation-title">Реєстрація</h2>
        <div class="registation-inputs">
          <input
            v-model="username"
            type="text"
            placeholder="Ім’я користувача"
            class="registation-input"
            :class="{ 'input-error': usernameError }"
          />
          <div v-if="usernameError" class="error-text">Ім’я користувача обов’язкове</div>
  
          <input
            v-model="email"
            type="text"
            placeholder="Email"
            class="registation-input"
            :class="{ 'input-error': emailError }"
          />
          <div v-if="emailError" class="error-text">Неправильний формат email</div>
  
          <input
            v-model="password"
            type="password"
            placeholder="Пароль"
            class="registation-input"
            :class="{ 'input-error': passwordError }"
          />
          <div v-if="passwordError" class="error-text">
            Пароль повинен містити мінімум 6 символів, цифри та букви
          </div>
        </div>
        <div class="registation-buttons">
          <button @click="register" class="registation-button">Зареєструватись</button>
          <router-link to="/" custom v-slot="{ navigate }">
            <button @click="navigate" class="registation-button">Скасувати</button>
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
  import { getFirestore, doc, setDoc } from "firebase/firestore";
  import BackgroundSlider from "@/components/BackgroundSlider.vue";
  
  export default {
    components: {
      BackgroundSlider,
    },
    data() {
      return {
        username: '',
        email: '',
        password: '',
        usernameError: false,
        emailError: false,
        passwordError: false,
      };
    },
    methods: {
      validateEmail(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
      },
      validatePassword(password) {
        const regex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
        return regex.test(password);
      },
      async register() {
        this.usernameError = !this.username.trim();
        this.emailError = !this.validateEmail(this.email);
        this.passwordError = !this.validatePassword(this.password);
  
        if (this.usernameError || this.emailError || this.passwordError) {
          return;
        }
  
        const auth = getAuth();
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;
  
          const db = getFirestore();
          const userDocRef = doc(db, "users", user.uid);
  
          await setDoc(userDocRef, {
            email: this.email,
            username: this.username,
            role: "user",
            profilePicture: "https://firebasestorage.googleapis.com/v0/b/kursova-5374b.appspot.com/o/bach%2F491004389_596021710156389_1039114513883964411_n.jpg?alt=media&token=63353374-7c0a-4060-b208-1310f3f67bce",
            createdAt: new Date(),
            uid: user.uid,
          });
  
          console.log("Реєстрація та запис в Firestore успішні!");
          this.$router.push("/home");
        } catch (error) {
          console.error("Помилка реєстрації:", error.message);
          if (error.code === 'auth/email-already-in-use' || error.code === 'auth/invalid-email') {
            this.emailError = true;
          } else if (error.code === 'auth/weak-password') {
            this.passwordError = true;
          }
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
  
  .registation-container {
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
  
  .registation-title {
    color: white;
    font-size: 1.2rem;
    font-weight: 400;
    margin: 0;
  }
  
  .registation-inputs {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 80%;
  }
  
  .registation-input {
    padding: 10px;
    background: transparent;
    border: none;
    border-bottom: 2px solid white;
    color: white;
    font-size: 1rem;
    outline: none;
  }
  
  .registation-input::placeholder {
    color: white;
    opacity: 0.7;
  }
  
  .registation-buttons {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 40%;
  }
  
  .registation-button {
    width: 100%;
    padding: 10px;
    background: transparent;
    color: white;
    border: 2px solid white;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .cancel-button {
    width: 40%;
    padding: 10px;
    background: transparent;
    color: white;
    border: 2px solid white;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: none;
  }
  
  .registation-input:-webkit-autofill,
  .registation-input:-webkit-autofill:hover,
  .registation-input:-webkit-autofill:focus,
  .registation-input:-webkit-autofill:active {
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
  