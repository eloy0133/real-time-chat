import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

window.addEventListener("load", () => {
    const socket = io()

    const form = document.getElementById('form')
    const usuario = document.getElementById('usuario')
    const password = document.getElementById('password')
    const register = document.getElementById('register')

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (usuario.value && password.value) {
            socket.emit('register', {
                usuario: usuario.value,
                password: password.value
            })
        }
    })

    socket.on('userRegistered', (status) => {
        let msg
        if (status === 'OK') {
            // WRITE HERE YOUR IP ADDRESS OR DOMAIN NAME + PORT + /login
            window.location.href = 'http://192.168.5.87:3000/login'
        }else {
            msg = `<h2 id="registerFail">El usuario con el nombre ${usuario.value} ya existe</h2>`
            register.innerHTML = msg
            register.style.display = 'block'
        }
    })
})