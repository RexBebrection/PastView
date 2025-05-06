<template>
  <nav> 
  </nav>
  <router-view/>
</template>



<style>
html, body {
  background-color: black;
  background-image: url('./assets/AlterBackground.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Montserrat', sans-serif;
  color: white;
  margin: 0;
  padding: 0;
  scrollbar-face-color: #646464;
  scrollbar-base-color: #646464;
  scrollbar-3dlight-color: #646464;
  scrollbar-highlight-color: #646464;
  scrollbar-track-color: #000;
  scrollbar-arrow-color: #000;
  scrollbar-shadow-color: #646464;
}
::-webkit-scrollbar { width: 8px; height: 3px;}
::-webkit-scrollbar-button {  background-color: #666; }
::-webkit-scrollbar-track {  background-color: #646464;}
::-webkit-scrollbar-track-piece { background-color: #000;}
::-webkit-scrollbar-thumb { height: 50px; background-color: #666; border-radius: 3px;}
::-webkit-scrollbar-corner { background-color: #646464;}
::-webkit-resizer { background-color: #666;}
button {
  font-family: 'Montserrat', sans-serif;
}

</style>
