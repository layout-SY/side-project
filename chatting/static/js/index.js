var socket = io();

// 접속 됐을 경우
socket.on('connect', () => {
	socket.on('userData', (userData) => {
		//서버에게 새로운 유저가 왔다고 알림
		socket.emit('newUser', userData);
	});
});

socket.on('update', (data) => {
	var chat = document.getElementById('chat');

	var message = document.createElement('div');
	var node = document.createTextNode(`${data.name}: ${data.message}`);
	var className = '';

	switch (data.type) {
		case 'message':
			className = 'other';
			break;

		case 'connect':
			className = 'connect';
			break;

		case 'disconnect':
			className = 'disconnect';
			break;
	}

	message.classList.add(className);
	message.appendChild(node);
	chat.appendChild(message);
});

//메세지 전송 함수
function send() {
	// 입력되어있는 데이터 가져오기
	var message = document.getElementById('test').value;

	// 가져왔으니 데이터 빈칸으로 변경
	document.getElementById('test').value = '';

	// 내가 전송할 메시지 클라이언트에게 표시
	var chat = document.getElementById('chat');
	var msg = document.createElement('div');
	var node = document.createTextNode(message);
	msg.classList.add('me');
	msg.appendChild(node);
	chat.appendChild(msg);

	// 서버로 message 이벤트 전달 + 데이터와 함께
	socket.emit('message', { type: 'message', message: message });
}
