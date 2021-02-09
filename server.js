var express = require('express')
, app = express()
, server = require('http').createServer(app)
, socketio = require('socket.io').listen(server);

var portnum = process.argv[2] || 61834; // Get portnum from the command line if it is there, otherwise use 3000 as default
 
// Use www as the "root" directory for all requests.
// if no path is given, it will look for index.html in that directoy.
app.use(express.static('www'));

// Start the server listening on a port 
server.listen(portnum, function(){
    console.log ("server listening on port " + portnum);
});

let playerDict = {}
let roomDict = {}
let playerNoCheck = function(roomNo){
    console.log("no of rooms in "+roomNo + ' is ' + roomDict[roomNo].length)
    if(roomDict[roomNo].length <2){
        return true
    }else{return false}
}

// When we get a connection, 
socketio.on('connection', function (socket) {
    //create a listener for this particular socket
    console.log("Got a connection on socket : " + socket.id);
    if(Object.keys(roomDict).length > 0){
        socket.emit('roomDict', roomDict)
    }
    socket.on('disconnect',function(){
        console.log(socket.id+" has disconnected from "+ playerDict[socket.id])
        let roomPlayers = roomDict[playerDict[socket.id]]
        if(typeof(roomPlayers)!="undefined"){
            let newRoomPlayers = roomPlayers.filter(function(value, index, arr){
                return value != socket.id
            })
            console.log(playerDict[socket.id])
            console.log("Tell "+playerDict[socket.id]+" participants "+roomDict[playerDict[socket.id]]+" that "+socket.id+" has disconnected.")
            socket.to(playerDict[socket.id]).emit('oppHasLeft',"Opponent has left")
            roomDict[playerDict[socket.id]] = newRoomPlayers; //update previous room
        }
        socketio.sockets.emit('roomDict', roomDict)

    })
    // socket.on('roomID', function (room, username) {  
 //        socket['roomID'] = room;
 //        socket["username"] = username;
 //    });    
    socket.on('individualMode', function(){
        console.log("Individual Mode")
        let roomPlayers = roomDict[playerDict[socket.id]]
        if(typeof(roomPlayers)!="undefined"){
            let newRoomPlayers = roomPlayers.filter(function(value, index, arr){
                return value != socket.id
            })
            console.log(playerDict[socket.id])
            console.log("Tell "+playerDict[socket.id]+" participants "+roomDict[playerDict[socket.id]]+" that "+socket.id+" has disconnected.")
            socket.to(playerDict[socket.id]).emit('oppHasLeft',"Opponent has left")
            roomDict[playerDict[socket.id]] = newRoomPlayers; //update previous room
            socket.leave(playerDict[socket.id])
        }
        socketio.sockets.emit('roomDict', roomDict)

    })
    
    socket.on('message', function (roomID,msg) {
        console.log('Message Received: ', msg);
        console.log(socket['roomID'])
        socket.to(socket['roomID']).emit('message', msg);
    });

    socket.on('create', function(roomID,username) {
        // console.log("created room " + socket['roomID'])
        if(typeof(roomDict[roomID])=="undefined"){
            roomDict[roomID] = [];
            console.log("created room " + roomID)
        }

        if (playerNoCheck(roomID)){
            console.log(roomID+" is available")
            if(typeof(playerDict[socket.id])!="undefined"){
                let roomPlayers = roomDict[playerDict[socket.id]]
                let newRoomPlayers = roomPlayers.filter(function(value, index, arr){
                    return value != socket.id
                })

                roomDict[playerDict[socket.id]] = newRoomPlayers; //update previous room

                socket.to(playerDict[socket.id]).emit('oppHasLeft',"Opponent has left the room!")
                socket.leave(playerDict[socket.id])
                console.log("Previous room, "+socket["roomID"]+" is updated")
            }
            
            socket.join(roomID);
            socket.to(roomID).emit('oppHasJoined',"Opponent has joined the room!")
            socket.emit('joinSuccess', roomID)
            socket['roomID'] = roomID;
            socket["username"] = username;


            playerDict[socket.id]=socket['roomID'];
            socketio.sockets.emit('playerDict', playerDict)
            // console.log("playerDict " +playerDict[socket.id]) 
            let sockets = roomDict[roomID];
            sockets.push(socket.id)
            // console.log(sockets)
            roomDict[roomID] = sockets
            socketio.sockets.emit('roomDict', roomDict)
            // console.log("roomDict "+ roomDict)           
        }else{
            console.log("send error message")
            socket.emit('errorName', 'roomFullError');  
        }
        // console.log(roomDict)
    });
});


// --------------------------------------------------------------
// const connections = [null, null];

// // Handle a socket connection request from web client
// io.on('connection', function (socket) {
  

// });