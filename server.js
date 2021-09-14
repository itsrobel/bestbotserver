const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const app = express()

app.engine('html', require('ejs').renderFile)


const server = http.createServer(app)
const io = socketio(server)

io.on('connection', socket => {
    console.log("new connection")

    socket.emit('hello',{text:"node!"})

    socket.on("link", (data) => 
    {
        
        console.log(data)
        socket.broadcast.emit("run_puppet")
    })

   
    
});

app.get('/', function(req, res)  {
    res.render("./index.ejs")
})
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));