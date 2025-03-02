import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

window.addEventListener("load", async (e) => {
    window.addEventListener("message", (event) => {
        if (!event.origin.includes("chat-app-bon1.onrender.com")) return;
        if (event.data && event.data.type === "AUTH_SUCCESS") {
            fetch("https://chat-app-bon1.onrender.com/auth/login", {
                method: 'GET',
                headers: {
                    Authorization: event.data.data.accessToken
                }
            })
                .then(response => response.json())
                .then(json => {
                    localStorage.setItem("jwt", json.jwt)
                    location.reload()
                })
                .catch(error => {
                    console.error("error trying to get user info from auth0", error)
                })
        }
    });
    if (e.target.location.hash !== "") {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');
        if (window.opener) {
            window.opener.postMessage({ type: "AUTH_SUCCESS", data: { accessToken, idToken } }, "*");
            window.close();
        }
    }


    let userData = {}

    if (localStorage.getItem("jwt")) {
        userData = await getUserData()
    }

    const socket = io({
        auth: {
            userMail: userData.email,
            username: userData.name,
            picture: userData.picture,
            serverOffset: 0
        }
    })

    if (!userData.email) {
        document.getElementById("login").style.display = "inline-bock"
        document.getElementById("input").placeholder = "Inicia sesión para enviar mensajes"
        document.getElementById("input").disabled = true
    } else {
        document.getElementById("login").style.display = "none"
        document.getElementById("input").disabled = false
        document.getElementById("input").placeholder = "Escribe un mensaje"
    }

    const form = document.getElementById('form')
    const input = document.getElementById('input')
    const messages = document.getElementById('messages')

    socket.on('chat message', (msgData) => {
        if (msgData.username === socket.auth.username) {
            addMessage(true, msgData)
        } else {
            addMessage(false, msgData)
        }
    })

    function addMessage(currentUser, msgData) {        
        if (currentUser) {
            const item = `<li data-user="${msgData.username}" class="tu">
                    <div class="msg">
                        <div>
                            <p>${msgData.msg}</p>
                            <img class="picture" src="${msgData.picture}">
                        </div>
                    </div>
                    <span class="fecha">${formatDate(new Date(msgData.date))}</span>
                </li>`
            messages.insertAdjacentHTML('beforeend', item)
        } else {
            const item = `<li data-user="${msgData.username}">
                    <p>
                        <span class="username">${msgData.username}</span>
                    </p>
                    <div class="msg">
                        <div>
                            <img class="picture" src="${msgData.picture}">
                            <p>${msgData.msg}</p>
                        </div>
                    </div>
                    <span class="fecha">${formatDate(new Date(msgData.date))}</span>
                </li>`
            messages.insertAdjacentHTML('beforeend', item)
        }
        socket.auth.serverOffset = msgData.serverOffset
        messages.scrollTop = messages.scrollHeight
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault()
        if (input.value) {
            socket.emit('chat message', { msg: input.value })
            input.value = ''
        }
    })

    document.getElementById("login").addEventListener("click", async () => {
        openLoginForm()
    })

    async function openLoginForm() {
        const response = await fetch('https://chat-app-bon1.onrender.com/auth/google');
        const data = await response.json();

        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const authWindow = window.open(
            data.authUrl,
            'Auth0Login',
            `width=${width},height=${height},top=${top},left=${left},resizable=no`
        );
    }

    async function getUserData() {
        try {
            const response = await fetch('https://chat-app-bon1.onrender.com/verify-token', {
                method: 'GET',
                headers: {
                    Authorization: localStorage.getItem('jwt')
                }
            });

            const data = await response.json();

            if (data.valid) {
                return data.userData;
            }

            return null;
        } catch (error) {
            console.error("Error at verifying token from localStorage: ", error)
        }
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
})