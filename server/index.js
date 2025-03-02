import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import path from 'path';
import jwt from "jsonwebtoken";
import axios from 'axios'
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') })


const app = express()
const server = createServer(app)
const io = new Server(server)

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN
})

await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        picture TEXT
    );
    
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT,
        date DATE,
        FOREIGN KEY (user) REFERENCES users(email) ON DELETE CASCADE
    );
`)

io.on('connection', async (socket) => {
    console.log('a user has connected!');

    socket.on('disconnect', () => {
        console.log('a user has disconnected');
    })

    socket.on('chat message', async (data) => {
        let result
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user, date) VALUES (:message, :userMail, :date)',
                args: { message: data.msg, userMail: socket.handshake.auth.userMail, date: new Date() }
            })
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', {
            msg: data.msg,
            serverOffset: result.lastInsertRowid.toString(),
            username: socket.handshake.auth.username,
            date: new Date(),
            picture: socket.handshake.auth.picture
        })        
    })

    if (!socket.recovered) {
        try {
            const results = await db.execute({
                sql:
                    'SELECT m.id, m.content, m.date, u.name, u.picture FROM messages m JOIN users u ON m.user = u.email WHERE m.id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', {
                    msg: row.content,
                    serverOffset: row.id.toString(),
                    username: row.name,
                    date: row.date,
                    picture: row.picture
                })
            })
        } catch (error) {
            console.error(error);
        }
    }
})

app.use(logger('dev'))
app.use(cors())

app.use('/',express.static(process.cwd()))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/html/index.html')
})

app.get('/auth/google', (req, res) => {    
    const auth0Domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const redirectUri = encodeURIComponent('https://chat-app-bon1.onrender.com');
    const authUrl = `https://${auth0Domain}/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&connection=google-oauth2`;

    res.json({ authUrl });
});

app.get('/auth/login', (req, res) => {
    if (req.headers.authorization) {

        axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
            headers: {
                'Authorization': `Bearer ${req.headers.authorization}`
            }
        })
            .then(response => {
                register(response.data).then(jwt => res.json({ jwt: jwt }))

            })
            .catch(error => {
                console.error('Error al obtener los datos del usuario:', error);
            });
    }
});

app.get("/verify-token", async (req, res) => {
    if (req.headers.authorization && req.headers.authorization !== "null") {
        try {
            const decoded = jwt.verify(req.headers.authorization, process.env.SECRET, { algorithms: ["HS256"] });
            res.json({ valid: true, userData: decoded });

            /**==== if user from valid jwt is not in DB and there is a valid jwt, 
             * it means some rows in DB could have been deleted by accident. ====*/
            /**==== in that case, its good practice to add the user in DB so everything works correctly ====*/
            const result = await checkUserDB(decoded.email)
            if (result.rows.length <= 0) {
                register(decoded)
            }
        } catch (error) {
            console.log("Error at verifying token ", error);
            res.status(401).json({ valid: false, error: "Invalid token" });
        }
    }
});

server.listen(3000, () => {
    console.log(`Server running on port 3000`);
})

async function register(data) {
    let result = await checkUserDB(data.email)

    if (result.rows.length > 0) {
        console.log(`User with email ${data.email} already exists in DB`)
    } else {
        let resultInsert
        try {
            resultInsert = await db.execute({
                sql: 'INSERT INTO users (email, name, picture) VALUES (:email, :name, :picture)',
                args: { email: data.email, name: data.name, picture: data.picture }
            })
        } catch (error) {
            console.error(error);
            return
        }

        if (resultInsert.rowsAffected > 0) {
            console.log(`User with email ${data.email} added to DB`);
        }
    }

    return jwt.sign({
        email: data.email,
        name: data.name,
        picture: data.picture
    }, process.env.SECRET, { algorithm: 'HS256', expiresIn: "7d" });
}

async function checkUserDB(email) {
    let result
    try {
        result = await db.execute({
            sql: 'SELECT email FROM users WHERE email = :email',
            args: { email: email }
        })
    } catch (error) {
        console.error(error);
        return
    }
    return result
}