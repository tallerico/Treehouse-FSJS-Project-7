const submitButton = document.getElementById('submit');
const statusBox = document.querySelector('#tweet-textarea');



submitButton.addEventListener('click', (e) => {
  e.preventDefault();
  let text = statusBox.value;
  let Obj = { status: `${text}` };
  fetch('/update_status', {
    method: 'PUT', // or 'PUT'
    body: JSON.stringify(Obj), // data can be `string` or {object}!
    headers:{
      'Content-Type': 'application/json, charset=utf-8'
    }
  })
});



