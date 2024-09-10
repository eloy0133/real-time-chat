import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

window.addEventListener("load", () => {

    function getUsername() {
        return JSON.parse(sessionStorage.getItem('logged'))
    }

    function addMessage(sameUser, currentUser, msgData) {
        if (sameUser) {
            const lastMessage = document.getElementById('messages').lastChild
            const msg = document.createElement('p')
            msg.className = 'msg'
            msg.innerHTML = msgData.msg
            const fecha = document.createElement('span')
            fecha.className = 'fecha'
            fecha.innerHTML = formatDate(new Date(msgData.date))
            lastMessage.appendChild(msg)
            lastMessage.appendChild(fecha)
        } else {
            if (currentUser) {
                const item = `<li data-user="${msgData.username}" class="tu">
                    <p class="msg">${msgData.msg}</p>
                    <span class="fecha">${formatDate(new Date(msgData.date))}</span>
                </li>`
                messages.insertAdjacentHTML('beforeend', item)
            } else {
                const item = `<li data-user="${msgData.username}">
                    <p>
                        <span class="username">${msgData.username}</span>
                    </p>
                    <p class="msg">${msgData.msg}</p>
                    <span class="fecha">${formatDate(new Date(msgData.date))}</span>
                </li>`
                messages.insertAdjacentHTML('beforeend', item)
            }
        }
        socket.auth.serverOffset = msgData.serverOffset
        messages.scrollTop = messages.scrollHeight
    }

    function formatDate(msgDate) {
        const yyyy = msgDate.getFullYear()
        let mm = msgDate.getMonth() + 1
        let dd = msgDate.getDate()

        if (dd < 10) dd = '0' + dd
        if (mm < 10) mm = '0' + mm

        let finalDate = `${dd}/${mm}/${yyyy}`;

        if (msgDate.getHours() < 10) {
            finalDate += ` 0${msgDate.getHours()}`
        } else {
            finalDate += ` ${msgDate.getHours()}`
        }

        if (msgDate.getMinutes() < 10) {
            finalDate += `:0${msgDate.getMinutes()}`
        } else {
            finalDate += `:${msgDate.getMinutes()}`
        }
        return finalDate
    }

    if (!getUsername()) {
        // WRITE HERE YOUR IP ADDRESS OR DOMAIN NAME + PORT + /login
        window.location.href = 'http://192.168.5.87:3000/login'
    }

    const socket = io({
        auth: {
            username: getUsername().usuario,
            serverOffset: 0
        }
    })

    const form = document.getElementById('form')
    const input = document.getElementById('input')
    const messages = document.getElementById('messages')

    socket.on('chat message', (msgData) => {
        const lastMessage = document.getElementById('messages').lastChild
        if (lastMessage) {
            if (lastMessage.dataset.user === msgData.username) {
                addMessage(true, false, msgData)
            } else {
                if (msgData.username === socket.auth.username) {
                    addMessage(false, true, msgData)
                } else {
                    addMessage(false, false, msgData)
                }
            }
        } else {
            if (msgData.username === socket.auth.username) {
                addMessage(false, true, msgData)
            } else {
                addMessage(false, false, msgData)
            }
        }
    })

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        if (input.value) {
            socket.emit('chat message', { msg: input.value, date: new Date() })
            input.value = ''
        }
    })
})