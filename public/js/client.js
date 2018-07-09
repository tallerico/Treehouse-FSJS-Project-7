const submitButton = document.getElementById('submit');
const statusBox = document.querySelector('#tweet-textarea');
// const socket = io.connect('http://localhost:3000');
const socket = io();

// socket.on('tweet', function (data) {
//   console.log(data);
  
// });

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const text = statusBox.value;
  console.log(text);
  socket.emit('tweet', { status: `${text}` });
  statusBox.value = '';
});