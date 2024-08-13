const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const users = new Set();

io.on('connection', (socket) => {
  console.log('مستخدم جديد اتصل');

  socket.on('login', (username) => {
    if (users.has(username)) {
      socket.emit('login_error', 'اسم المستخدم مستخدم بالفعل');
    } else {
      socket.username = username;
      users.add(username);
      socket.emit('login_success');
      io.emit('chat message', `${username} انضم إلى الدردشة`);
    }
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', `${socket.username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      io.emit('chat message', `${socket.username} غادر الدردشة`);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`السيرفر يعمل على المنفذ ${PORT}`);
});
