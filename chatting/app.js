const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const cookie = require('cookie'); // Add this line to parse cookies

const server = http.createServer(app);

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);

const db = new Map();
const USER_COOKIE_KEY = 'user';

app.use(express.static(path.join(__dirname, './static/html')));
app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
	fs.readFile('./static/html/index.html', (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(data);
			res.end();
		}
	});
});

app.get('/chat', function (req, res) {
	fs.readFile('./static/chat.html', function (err, data) {
		if (err) {
			res.send(err);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(data);
			res.end();
		}
	});
});

app.post('/signup', (req, res) => {
	const { username, name, password } = req.body;
	const isExists = db.get(username);

	if (isExists) {
		res.status(400).send('이미 존재하는 아이디입니다.');
		return;
	}

	const newUser = {
		username,
		name,
		password,
	};

	db.set(username, newUser);

	res.redirect('/');
});

app.post('/login', (req, res) => {
	const { username, password } = req.body;
	const user = db.get(username);
	if (user) {
		if (password === user.password) {
			res.cookie(USER_COOKIE_KEY, JSON.stringify(user));
			res.redirect('/chat');
		} else {
			res.status(400).send('incorrect pw');
		}
	} else {
		res.status(400).send(`not found : ${username}`);
	}
});

app.get('/back', (req, res) => {
	// 쿠키 삭제 후 루트 페이지로 이동
	res.redirect('/');
});

app.get('/login', (req, res) => {
	fs.readFile('./static/html/login.html', (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(data);
			res.end();
		}
	});
});

app.get('/signup', (req, res) => {
	fs.readFile('./static/html/signup.html', (err, data) => {
		if (err) {
			res.send(err);
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(data);
			res.end();
		}
	});
});

io.sockets.on('connection', function (socket) {
	const cookies = socket.handshake.headers.cookie;
	const userCookie = cookie.parse(cookies)[USER_COOKIE_KEY];

	if (userCookie) {
		const userData = JSON.parse(userCookie);

		// 로그인된 유저 이름으로 보내기
		socket.emit('userData', userData.name);
	}

	socket.on('newUser', function (name) {
		console.log(name + ' 님이 접속하였습니다.');
		socket.name = name;
		io.sockets.emit('update', { type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.' });
	});

	socket.on('message', function (data) {
		data.name = socket.name;
		console.log(data);
		socket.broadcast.emit('update', data);
	});

	socket.on('disconnect', function () {
		console.log(socket.name + '님이 나가셨습니다.');
		socket.broadcast.emit('update', {
			type: 'disconnect',
			name: 'SERVER',
			message: socket.name + '님이 나가셨습니다.',
		});
	});
});

server.listen(8000, function () {
	console.log('서버 가동 중');
});
