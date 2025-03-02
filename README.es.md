# 🗨️ Chat en Tiempo Real con Express.js, Socket.io, Turso y Auth0

Aplicación web que permite a los usuarios iniciar sesión con Google y enviar mensajes en tiempo real a un servidor construido con Express.js. Los mensajes se almacenan en una base de datos MySQL en Turso y se usa Socket.io para la comunicación en tiempo real.

## 🚀 **Tecnologías Utilizadas**
- **Express.js**: Maneja toda la lógica del servidor, incluyendo la persistencia de mensajes, la comunicación con el cliente a través de WebSockets, los endpoints de autenticación y verificación de JWT para manejo de sesión seguro.
- **Socket.io**: Permite la comunicación bidireccional y en tiempo real entre el cliente y el servidor.
- **Turso (Base de Datos MySQL)**: Almacena todos los mensajes para garantizar su persistencia.
- **Auth0**: Facilita la autenticación con Google, permitiendo que cada mensaje muestre el nombre y la foto del usuario.
- **Json Web Tokens (JWT)**: Manejo de sesión de forma segura en el lado del cliente.

## 📌 **Características**
✔️ Inicio de sesión con Google mediante Auth0.  
✔️ Mensajería en tiempo real con WebSockets.  
✔️ Almacenamiento de mensajes en una base de datos MySQL.  
✔️ Autenticación segura y verificación de usuario. 
✔️ Manejo y verificación de sesión de forma segura a través de JWT.

## 🌐 **Render**
- Para usar esta aplicación no es necesario clonar el repositorio puesto que ya está desplegada en render: https://chat-app-bon1.onrender.com
