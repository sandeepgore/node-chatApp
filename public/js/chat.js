const socket = io();

//elements
$messageForm = document.querySelector("#msg");
$messageFormInput = $messageForm.querySelector("input");
$messageFormButton = $messageForm.querySelector("button");
$sendLocation = document.querySelector("#sendLocation");
$messageDiv = document.querySelector("#divmessage");
$logout = document.querySelector('#logout')

//templets
const messages = document.querySelector("#messageTemp").innerHTML;
const messageUrl = document.querySelector('#messageUrl').innerHTML
const sidebar = document.querySelector('#sidebar-templet').innerHTML

//queryString

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})


const autoscroll = () => {
  // New message element
  const $newMessage = $messageDiv.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = $messageDiv.offsetHeight

  // Height of messages container
  const containerHeight = $messageDiv.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messageDiv.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageDiv.scrollTop = $messageDiv.scrollHeight
  }



}
socket.on("message", msg => {
  //console.log(msg);

  const html = Mustache.render(messages, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  });
  $messageDiv.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebar, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
 // console.log(room)
  //console.log(users)
})

socket.on('messageUrl', url => {
  //console.log(url)
  const html = Mustache.render(messageUrl, {
    username: url.username,
    messageUrl: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  })
  $messageDiv.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  //const message = document.querySelector("input").value;
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    //console.log("Delivered");
  });
});

$sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation is not supported by your browser");
  }
  $sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    $sendLocation.removeAttribute("disabled");
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
      //  console.log("location is shared");
      }
    );
  });
});

$logout.addEventListener('click',()=>{
    location.href='/'
  })

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }

})