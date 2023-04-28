const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/user');
const Message = require('./models/message');
const ws = require('ws');
const fs = require('fs');
dotenv.config();
const jwtSecret = process.env.JWT_SECRET_KEY;
const PORT = process.env.PORT || 9000;
const userRouter = require('./routes/user');
require('./db/config');

const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: true,
}));
app.use('/', userRouter);


const getUserDataFromRequest = async (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            });
        } else {
            reject('no token');
        }
    });

}

app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
        sender: { $in: [userId, ourUserId] },
        recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
});

/*----------------get all users-----------------*/
app.get('/people', async (req, res) => {
    const users = await User.find({}, { '_id': 1, username: 1 });
    res.json(users);
});

/*----------------port test-----------------*/
app.get('/test', (req, res) => {
    res.json('test ok');
});

const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

/*----------------web socket server-----------------*/
const webSocket = new ws.WebSocketServer({ server });


webSocket.on('connection', (connection, req) => {
    
    const notifyAboutOnlinePeople=()=> {
        [...webSocket.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...webSocket.clients].map(c => ({ userId: c.userId, username: c.username })),
            }));
        });
    }

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            console.log('dead');
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    });

    /*----------read username and id form the cookie for this connection----*/
    const cookies = req.headers.cookie;
    
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, text, file } = messageData;
        let filename = null;
        if (file) {
            console.log('size', file.data.length);
            const parts = file.name.split('.');
            const ext = parts[parts.length - 1];
            filename = Date.now() + '.' + ext;
            const path = __dirname + '/uploads/' + filename;
            const bufferData = new Buffer.from(file.data.split(',')[1], 'base64');
            fs.writeFile(path, bufferData, () => {
                console.log('file saved:' + path);
            });
        }
        if (recipient && (text || file)) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null,
            });
            console.log('created message');
            [...webSocket.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    file: file ? filename : null,
                    _id: messageDoc._id,
                })));
        }
    });
    
    // notify everyone about online people (when someone connects)
    notifyAboutOnlinePeople();
});
