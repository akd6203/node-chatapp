
const socket = io() //from socket.js inside index.html


// elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#send')
const $locationButton = document.querySelector('#loc-btn')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML 
const locationTemplate = document.querySelector('#locationTemplate').innerHTML 
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight
    
    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (data) => {
    console.log(data)
    const html = Mustache.render(messageTemplate,{
        username:data.username,
        message: data.text,
        createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locEvent', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        window.location.href = '/'
    }
})

document.querySelector('#messageForm').addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        
        if(error){
            return console.log(error)
        }
        console.log('This message was delivered successfully!')
    })

})

document.querySelector('#loc-btn').addEventListener('click', () => {
    $locationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation.')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude 
        }, ()=>{
            $locationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', ()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })
