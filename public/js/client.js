const submitButton = document.getElementById('submit');
const statusBox = document.querySelector('#tweet-textarea');
// const socket = io.connect('http://localhost:3000');
const socket = io();

function update(){
  var req = new XMLHttpRequest();
  req.open("GET","/results");
  req.onreadystatechange = function(){
      if(req.readyState == 4){
          document.getElementById("content").innerHTML = req.responseText;
      }
  }
  req.send();
}

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const text = statusBox.value;
  if (text) {
    socket.emit('tweet', { status: `${text}` });
    statusBox.value = '';
  }
});