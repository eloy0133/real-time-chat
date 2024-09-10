import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

window.addEventListener('load', () => {
    const socket = io()

    const form = document.getElementById('form')
    const usuario = document.getElementById('usuario')
    const password = document.getElementById('password')
    const response = document.getElementById('login-response')

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        if(usuario.value && password.value){
            socket.emit('login', {
                usuario: usuario.value,
                password: password.value,
            })
        }
    })

    socket.on('loggedin', (res) => {
        if(res === 'OK'){
            sessionStorage.setItem('logged', JSON.stringify({
                usuario: usuario.value,
            }))
            // WRITE HERE YOUR IP ADDRESS OR DOMAIN NAME + PORT
            window.location.href = 'http://192.168.5.87:3000/'
        }else {
            response.innerHTML = `<h2>${res}</h2>`
            response.style.display = 'block'
        }
    })
})