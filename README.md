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

### ¡Puedes probar a enviar un mensaje a la aplicación!




# ENGLISH:
# 🗨️ Real-Time Chat with Express.js, Socket.io, Turso, and Auth0

This is a web application that allows users to log in with Google and send real-time messages to a server built with Express.js. The messages are stored in a MySQL database hosted on Turso, and Socket.io is used to provide real-time communication.

## 🚀 **Technologies Used**
- **Express.js**: Manages all server-side logic, including message persistence, client-server communication via WebSockets, authentication and jwt verification endpoints.
- **Socket.io**: Enables bidirectional, real-time communication between the client and the server.
- **Turso (MySQL Database)**: Stores all messages, ensuring data persistence.
- **Auth0**: Provides easy Google authentication, allowing messages to display the user's name and profile picture.
- **Json Web Tokens (JWT)**: Secure session management from the client side.

## 📌 **Features**
✔️ Google Sign-In via Auth0.  
✔️ Real-time messaging with WebSockets.  
✔️ Message storage using a MySQL database.  
✔️ Secure authentication and user verification.  
✔️ Secure session management and verification via JWT.

### Feel free to send a message to the app!
