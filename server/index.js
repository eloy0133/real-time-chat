import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
import bcrypt from 'bcrypt'

const app = express()
const server = createServer(app)
const io = new Server(server)

const db = createClient({
    url: "libsql://tfg-eloy0133.turso.io",
    authToken: `ENTER HERE YOUR TURSO DATABASE TOKEN`
})

await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT,
        date DATE
    );

    CREATE TABLE IF NOT EXISTS users (
        name TEXT PRIMARY KEY,
        password TEXT
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
                sql: 'INSERT INTO messages (content, user, date) VALUES (:message, :user, :date)',
                args: { message: data.msg, user: socket.handshake.auth.username, date: data.date }
            })
        } catch (error) {
            console.error(error)
            return
        }
        io.emit('chat message', {
            msg: data.msg,
            serverOffset: result.lastInsertRowid.toString(),
            username: socket.handshake.auth.username,
            date: data.date
        })
    })

    socket.on('register', async (data) => {
        let result
        try {
            result = await db.execute({
                sql: 'SELECT name FROM users WHERE name = :usuario',
                args: { usuario: data.usuario }
            })
        } catch (error) {
            console.error(error);
            return
        }

        if (result.rows.length > 0) {
            socket.emit('userRegistered', 'KO')
        } else {
            let resultInsert
            try {
                const salt = await bcrypt.genSalt()
                const hashedPassword = await bcrypt.hash(data.password, salt)
                resultInsert = await db.execute({
                    sql: 'INSERT INTO users (name, password) VALUES (:name, :password)',
                    args: { name: data.usuario, password: hashedPassword }
                })
            } catch (error) {
                console.error(error);
                return
            }

            if (resultInsert.rowsAffected > 0) {
                socket.emit('userRegistered', 'OK')
            }
        }
    })

    socket.on('login', async (data) => {
        let result
        try {
            result = await db.execute({
                sql: 'SELECT * FROM users WHERE name = :name',
                args: { name: data.usuario }
            })
        } catch (error) {
            console.error(error);
            return
        }

        if (result.rows.length > 0) {
            if (await bcrypt.compare(data.password, result.rows[0].password)) {
                console.log('la contraseña es correcta');
                socket.emit('loggedin', 'OK')
            } else {
                socket.emit('loggedin', `La contraseña no coincide con el usuario: ${data.usuario}`)
            }
        } else {
            socket.emit('loggedin', `El usuario: ${data.usuario} no existe`)
        }
    })

    if (!socket.recovered) {  // <-- si no se ha recuperado de una desconexión
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user, date FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row => {
                socket.emit('chat message', { msg: row.content, serverOffset: row.id.toString(), username: row.user, date: row.date })
            })
        } catch (error) {
            console.error(error);
        }
    }
})

app.use(logger('dev'))

app.use(express.static(process.cwd() + '/public'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/html/index.html')
})

app.get('/login', (req, res) => {
    res.sendFile(process.cwd() + '/public/html/auth.html')
})

server.listen(3000, () => {
    console.log(`Server running on port 3000`);
})