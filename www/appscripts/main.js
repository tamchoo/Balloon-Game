
console.log("Yo, I am alive!");
//

// your playing space

var centerDiv = document.getElementById("centerDiv");

var paper = new Raphael(centerDiv);
let pWidth = (paper.width/3)*2;
let pHeight = paper.height-20;
paper.setViewBox(0,0,pWidth,pHeight, true)


//opp playing space

var aside = document.getElementById("aside");

var paperaside = new Raphael(aside);
paperaside.setViewBox(0,0,pWidth,pHeight, true)


// drawing the balloon on the canvas
var balloondraw = paper.path("M48.05,24c0,19.4-14.17,36.65-24,36.65S0,43.12,0,24a24,24,0,1,1,48.05,0Z M21.61,60.22s1.9.72.67,2S17.1,64.53,19,65.77s8.31,1.38,10-.62c.46-.72-1.49-1.3-3.08-2.09s-.7-2.38.29-2.83C26.55,60.08,21.61,60.22,21.61,60.22Z ")

var balloonBBox = balloondraw.getBBox();



console.log(-balloonBBox.x*(pWidth/balloonBBox.x2))
// balloondraw.animate({transform: "T 0, 200"}, 500, "ease-out")

var balloonssidebyside = 3;
let balloonradius =pWidth/balloonssidebyside/2;
var pythagoras = Math.sqrt(balloonradius)
var balloons = [];
var balloonRows = []; // positions in a row where a balloon is created
var balloonpositionsarray =[]; //hold all my balloonRows in an array
var balloonExactNoArray =[]
var noOfRows = 50
var noOfRowsShifted = noOfRows-balloonpositionsarray.length //used to adjust shifting in compensation for BBox misalignment

let oppBalloonslength = 0
let oppballoons =[]
let oppballoonpositionsarray = []
let oppballoonExactNoArray =[]
let initiationsensor = 0

//start & end game variables
let startGameTimer = 4
let oppreadystatus
let yourreadystatus
let modeType = 55
var starttime
var endtime
// let alertOnce = 0
//

//sounds
let lobby = new Audio("/resources/lobby.wav")
var during = new Audio("/resources/during.wav")
let playduring = function(){
    var playing = during.currentTime>0 && !during.paused && !during.ended

    if(playing){
        during.pause()
        during.currentTime=0
    }else{during.play()}
}

let done = new Audio("/resources/done.wav")
let playdone = function(){
    var playing = done.currentTime>0 && !done.paused && !done.ended

    if(playing){
        done.pause()
        done.currentTime=0
    }else{done.play()}
}

let penaltysound = new Audio("/resources/penalty.wav")
let playpenaltysound = function(){
    var playing = penaltysound.currentTime>0 && !penaltysound.paused && !penaltysound.ended

    if(playing){
        penaltysound.pause()
        penaltysound.currentTime=0
    }else{penaltysound.play()}
}
// 

let oppballoondraw = function(i){
    oppballoons[oppballoonExactNoArray[i]] = paperaside.path("M48.05,24c0,19.4-14.17,36.65-24,36.65S0,43.12,0,24a24,24,0,1,1,48.05,0Z M21.61,60.22s1.9.72.67,2S17.1,64.53,19,65.77s8.31,1.38,10-.62c.46-.72-1.49-1.3-3.08-2.09s-.7-2.38.29-2.83C26.55,60.08,21.61,60.22,21.61,60.22Z ")

    oppballoons[oppballoonExactNoArray[i]].attr({
        'fill': "#f8f8a0",
        'stroke-width':0.5,
        "stroke":"black",
        "opacity":1,
        "transform":` S ${(pWidth/balloonssidebyside)/balloonBBox.x2}`
    })
    console.log(oppballoons[oppballoonExactNoArray[i]])
}
//------------------------------

// ------MY SOCKET----------------------------

let iosocket = io.connect();
let uname
let roomNo

while(!uname){
    uname =prompt("Enter your name");
};

document.getElementById("username").innerHTML=uname

let buttons =  document.getElementsByClassName("roombutton");
console.log(buttons.length)
for(var i =0; i<buttons.length; i++){
    // console.log(buttons[i])
    buttons[i].addEventListener("click", function (event) { 
        let preroomNo = event.target.innerHTML;
        roomNo = preroomNo.replace(/\s/g,'')
        endGameVs()
        // document.getElementById("oppusername").innerHTML = "..."
        // document.getElementById("roomNoHeader").innerHTML= roomNo;
        iosocket.emit('create', roomNo, username);
        iosocket.send(roomNo,{"datatype":"oppusername","username":uname})
        console.log(roomNo)
        modeType = roomNo
    })
} 

iosocket.on('connect', function () {
    console.log("Yo.........connected!");
    // iosocket.emit('create', iosocket['roomID']);

    // MESSAGE PROCESSING HERE --------------
    iosocket.on('joinSuccess', function(roomID){
        document.getElementById("oppusername").innerHTML = "..."
        document.getElementById("roomNoHeader").innerHTML= roomID;

    })
    iosocket.on('errorName',function(errorCode){
        if(errorCode == "roomFullError"){
            alert("This room is currently full. Try another room!");
        }
    })

    iosocket.on('oppHasLeft', function(msg){
        console.log("Opp has left")
        document.getElementById("oppusername").innerHTML = "..."
        endGameVs()
        alert("Opponent has left the room!")
    })

    iosocket.on('oppHasJoined', function(msg){
        console.log("Opp has joined")
        alert("Opponent has joined the room!")
    })



    iosocket.on('roomDict', function(dictionaries){
        console.log('dict')
        console.log(dictionaries)
        for(var key in dictionaries){
        document.getElementById(key).innerHTML = dictionaries[key].length
        iosocket.send(roomNo,{"datatype":"oppusername","username":uname})
        console.log(key,dictionaries[key], dictionaries[key].length)
        }
    })

    // iosocket.on('playerDict', function(Pdict){
    //     console.log("pDict");
    //     output1 = iosocket.id in Pdict
    //     if(Object.keys(Pdict)[]iosocket.id){

    //     }
    // })

    iosocket.on('message', function(m){
        // console.log("you got "+ m.data)
        if(m.datatype === "oppusername"){
            document.getElementById('oppusername').innerHTML = m.username
            console.log("got username")
        }

        if (m.vsEndGameStatus === true) {
            endGameVs()
            alert(`Game Over! Good try :D`)

        }

        if(m.datatype==="ready"){
            oppreadystatus = "ready"

            if(oppreadystatus==="ready" && yourreadystatus !== "ready"){
                var oppready = paper.text(pWidth/2, pHeight/2, "Opponent is waiting \n press start");

                oppready.attr({
                    "fill":"white",
                    "font-family":"Budokan",
                    "font-size":20,
                }) 
            }

            if(oppreadystatus==="ready" && yourreadystatus === "ready"){
                startgamecountdown()
            }
            // iosocket.send(iosocket['roomID'],{"datatype":"ready"});
        }


        if(m.datatype==="initiate" && initiationsensor===0){
            oppballoonExactNoArray = m.balloonExactNoArray
            // debugger
            for(var i=0; i<oppballoonExactNoArray.length; i++){


                var oppNoOfRowsShifted = 50-Math.floor((oppballoonExactNoArray[i])/10)

                var oppBalloonRowNo = oppballoonExactNoArray[i]%10
                var oppBalloonRowi = Math.floor((oppballoonExactNoArray[i])/10)

                oppballoondraw(i)

                oppballoons[oppballoonExactNoArray[i]].translate((((pWidth/(balloonssidebyside*2) - balloonBBox.cx)/scaleFactor)+((balloonBBox.x2)*(oppBalloonRowNo))),(((scaleFactor*balloonBBox.cy - balloonBBox.cy)/scaleFactor)+((balloonBBox.height-(balloonBBox.y + (balloonBBox.y*oppNoOfRowsShifted)))*oppBalloonRowi)))

                oppBalloonslength++
                // console.log(oppballoonExactNoArray[i]%10)
                // console.log(oppBalloonRowNo)

                // ----saving pos array
                oppballoonpositionsarray = m.balloonpositionsarray

            }

            initiationsensor=1
        }       

            console.log(oppballoonExactNoArray)
                var oppfindBalloonExactNo = function(columnNo){
                    return (noOfRows-oppballoonpositionsarray.length)*10 + columnNo
                }

                var oppmoveRowsUp = function(){
                    if (oppballoonpositionsarray[0].every(function(a){return a>=3}) == true){
                        console.log(oppballoonpositionsarray)
                        oppballoonpositionsarray.shift()

                        console.log(Math.max(...balloonExactNoArray))

                        for(var i=0; i<oppballoonExactNoArray.length;i++){
                                oppballoons[oppballoonExactNoArray[i]].translate(0,(-balloonBBox.height-(Math.abs(balloonBBox.y)*(50-Math.floor((oppballoonExactNoArray[i])/10)))))
                        };
                    }

                }

                if(m.col===0){
                    let oppindexNo = oppballoonpositionsarray[0].findIndex(function(a){return a==0})
                    oppballoonpositionsarray[0][oppindexNo]=3
                    oppballoons[oppfindBalloonExactNo(0)].attr({
                        "opacity":0
                    })
                    oppmoveRowsUp()

                }

                if(m.col===1){
                    let oppindexNo = oppballoonpositionsarray[0].findIndex(function(a){return a==1})
                    oppballoonpositionsarray[0][oppindexNo]=3
                    oppballoons[oppfindBalloonExactNo(1)].attr({
                        "opacity":0
                    })
                    oppmoveRowsUp()
                }

                if(m.col===2){
                    let oppindexNo = oppballoonpositionsarray[0].findIndex(function(a){return a==2})
                    oppballoonpositionsarray[0][oppindexNo]=3
                    oppballoons[oppfindBalloonExactNo(2)].attr({
                        "opacity":0
                    })
                    oppmoveRowsUp()
                }

                if(m.progressbarupdate==="yes"){
                    let opponeUnit = ppHeight/noOfRows

                    drawoppPbar.transform(`T 0, ${opponeUnit*(noOfRows-oppballoonpositionsarray.length)} `)
                }

//                 var progressbarupdate = function(){

//     iosocket.send({"progressbarupdate":"yes"})
// }


        
    //---------------------------------------
    
        iosocket.on('disconnect', function() {
            console.log("Disconnected")
        });
    });
});


//-----------------------------------


// progress bar
var progressbar = document.getElementById("rowsYou")
var pPaper = new Raphael(progressbar);
let ppWidth = pPaper.width;
let ppHeight = pPaper.height;
let drawPbar
let drawoppPbar

let createdrawPbar = function(){
    drawPbar = pPaper.rect(0,0,ppWidth,ppHeight)

    drawPbar.attr({
        "fill":"red",
        "stroke-width":0,
        "transform": 0
    })
}

var progressbarupdate = function(){
    let oneUnit = ppHeight/noOfRows

    drawPbar.transform(`T 0, ${oneUnit*(noOfRows-balloonpositionsarray.length)} `)
    iosocket.send(iosocket['roomID'],{"progressbarupdate":"yes"})
}
//prep opp progressbar

var oppprogressbar = document.getElementById("rowsOpp")
var oppPPaper = new Raphael(oppprogressbar);
let oppPpWidth = oppPPaper.width;
let oppPpHeight = oppPPaper.height;

let createdrawoppPbar = function(){
    drawoppPbar = oppPPaper.rect(0,0,oppPpWidth,oppPpHeight)

    drawoppPbar.attr({
        "fill":"red",
        "stroke-width":0,
        "transform": 0
    })
}
//----------------------------------------

var scaleFactor = (pWidth/balloonssidebyside)/balloonBBox.x2;
balloondraw.attr({
    "fill":"red",
    "transform":` S ${(pWidth/balloonssidebyside)/balloonBBox.x2}`,
    "opacity":0
})

var totalballoonheight = balloonBBox.y2*5

// balloondraw.translate(((pWidth/10 - balloonBBox.cx)/scaleFactor)+(scaleFactor*(balloonBBox.x2)),(scaleFactor*balloonBBox.cy - balloonBBox.cy)/scaleFactor)

// create grid
var horizontalline = paper.path(`M 0,0 L ${pWidth}, 0`)

var grid = pWidth/balloonssidebyside;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// create multiple balloons
var rowCreator = function(balloonRowNo){

    bucket = [];
    balloonRows = [];

    for (var i=0;i<balloonssidebyside;i++) { //bucket to store all positions in a row
        bucket.push(i);
    }

    var myrandint = getRandomInt(1,balloonssidebyside-1) //randomly generate no. of balloons per row

    function getRandomFromBucket() {
       var randomIndex = Math.floor(Math.random()*bucket.length);
       return bucket.splice(randomIndex, 1)[0];
    }

    // takes out from the bucket in a random sequence and places it in an array
    for (var i=0;i<myrandint;i++){
        balloonRows.push(getRandomFromBucket());
    }

    balloonRows.sort()

    for (i=0;i<balloonRows.length;i++){

// Initially I wanted to make the colors random but i think the game looks better when it is uniformed!
        // var randMaxRed = Math.round(Math.random())*255;
        // var randMaxGreen = Math.round(Math.random())*255;
        // var randMaxBlue = Math.round(Math.random())*255;
        // var rgbString = "rgb("+randMaxRed+","+randMaxGreen+","+randMaxBlue+")"

        var balloonExactNo = (balloonRowNo*10)+balloonRows[i]

        balloonExactNoArray.push(balloonExactNo)

            balloons[balloonExactNo] = paper.path("M48.05,24c0,19.4-14.17,36.65-24,36.65S0,43.12,0,24a24,24,0,1,1,48.05,0Z M21.61,60.22s1.9.72.67,2S17.1,64.53,19,65.77s8.31,1.38,10-.62c.46-.72-1.49-1.3-3.08-2.09s-.7-2.38.29-2.83C26.55,60.08,21.61,60.22,21.61,60.22Z ")
            balloons[balloonExactNo].attr({
                'fill': "#f8f8a0",
                'stroke-width':0.5,
                "stroke":"black",
                "opacity": 1,
                "transform":` S ${(pWidth/balloonssidebyside)/balloonBBox.x2}`
            })

            balloons[balloonExactNo].translate(((pWidth/(balloonssidebyside*2) - balloonBBox.cx)/scaleFactor)+((balloonBBox.x2)*(balloonRows[i])),(((scaleFactor*balloonBBox.cy - balloonBBox.cy)/scaleFactor)+((balloonBBox.height-(balloonBBox.y + (balloonBBox.y*noOfRowsShifted)))*balloonRowNo)))

            console.log(balloonRows[i])
            console.log(balloonRowNo)



    }

}
//pregame


    var gamecountdown
let startgamecountdown = function(){
    gamecountdown = setInterval(
        function(){
            var countdownsound = new Audio("/resources/countdown.wav")
            countdownsound.play()
            paper.clear()
            startGameTimer--;
            var countdown = paper.text(pWidth/2, pHeight/2,startGameTimer);
            countdown.attr({
                "fill":"white",
                "font-family":"Budokan",
                "font-size":60,
            })
            // if(startGameTimer<=0){
            //     clearInterval(gamecountdown)
            //     paper.clear()
            //     STARTGAME()
            // }           
            if(startGameTimer===0){
                clearInterval(gamecountdown)
                paper.clear()
                STARTGAME()
            }
    },1000)
}
// END GAME

var endGameInd = function(){
    endtime = (Date.now() - starttime)/1000
    alert("you took "+ endtime+" seconds!")

    startGameTimer = 4
    during.pause()
    during.currentTime = 0
    paper.clear()
    paperaside.clear()
    pPaper.clear()
    oppPPaper.clear()

    balloons = [];
    balloonRows = [];
    balloonpositionsarray =[];
    balloonExactNoArray =[]

    oppballoons =[]
    oppballoonpositionsarray = []
    oppballoonExactNoArray =[]
    initiationsensor = 0

}

let vsEndGameStatus = false

var endGameVs = function(){
    endtime = (Date.now() - starttime)/1000
    vsEndGameStatus = true

    startGameTimer = 4
    during.pause()
    during.currentTime = 0
    paper.clear()
    paperaside.clear()
    pPaper.clear()
    oppPPaper.clear()

    balloons = [];
    balloonRows = [];
    balloonpositionsarray =[];
    balloonExactNoArray =[]

    oppballoons =[]
    oppballoonpositionsarray = []
    oppballoonExactNoArray =[]
    initiationsensor = 0

    oppreadystatus = 0
    yourreadystatus = 0
}

//START GAME
var STARTGAME = function(){
    during.play()
    during.loop = true 
    // alertOnce = 0
    vsEndGameStatus = false  

    createdrawoppPbar()
    drawoppPbar.attr({
        "transform":"T 0,0"
    })

    createdrawPbar()
    drawPbar.attr({
        "transform":"T 0,0"
    })

    starttime = Date.now()

    for(var i=0;i<noOfRows;i++){
        rowCreator(i);
        balloonpositionsarray.push(balloonRows)
        // iosocket.send({"data":rowCreator(i),"datatype":"row"})
        // iosocket.send({"data":balloonpositionsarray,"datatype":"oppBalloonRowsArray"})
    }
    
    iosocket.send(iosocket['roomID'],{"datatype":"initiate","balloonExactNoArray":balloonExactNoArray,"balloonpositionsarray":balloonpositionsarray})

}
    // search the first array for the balloon positions
    function getPosFinder(pos){
        var posFinder = balloonpositionsarray[0].find(function(element) {
            return element == pos;
        });

        return posFinder;
    }

    var moveRowsUp = function(){
        if (balloonpositionsarray[0].every(function(a){return a>=3}) == true){
            balloonpositionsarray.shift()

            console.log(Math.max(...balloonExactNoArray))

            for(var i=0; i<balloonExactNoArray.length;i++){
                    balloons[balloonExactNoArray[i]].translate(0,(-balloonBBox.height-(Math.abs(balloonBBox.y)*noOfRowsShifted)))

                    // iosocket.send({"datatype":"update","opacity":balloons[balloonExactNoArray[i]].attrs.opacity,"transform":balloons[balloonExactNoArray[i]]._.transform})
            };


        }
    }

    // event listeners for keypresses
    var findBalloonExactNo = function(columnNo){
        return (noOfRows-balloonpositionsarray.length)*10 + columnNo
    }

    var turnblue = function(){
        for(var i=0; i<balloonExactNoArray.length;i++){
        balloons[balloonExactNoArray[i]].animate({"fill":"#f8f8a0"},300,"linear")
        }
    }


    var penalty = false
    window.addEventListener("keydown", function(){


            if(event.keyCode== 76 && getPosFinder(2) != 2||event.keyCode== 75 && getPosFinder(1)!= 1||event.keyCode== 74 && getPosFinder(0) != 0){
                console.log("wrong")
                penalty = true
                console.log(penalty)
                playpenaltysound()

                for(var i=0; i<balloonExactNoArray.length;i++){
                    var turnred = balloons[balloonExactNoArray[i]].animate({"fill":"red"},300,"linear",turnblue);
                }

                setTimeout(function(){penalty = false;console.log(penalty)},600)
            }

            if(event.keyCode== 74 && getPosFinder(0) == 0 && penalty == false){
                
                let indexNo = balloonpositionsarray[0].findIndex(function(a){return a==0})

                balloonpositionsarray[0][indexNo]=3

                console.log(balloonpositionsarray[0][indexNo])

                    balloons[findBalloonExactNo(0)].attr({
                        "opacity": 0
                    })

                    playdone()

                    moveRowsUp()

                iosocket.send(iosocket['roomID'],{"col":0})
                checkIfFinished()
            }

            if(event.keyCode== 75 && getPosFinder(1)== 1&& penalty == false){
                console.log(75)
                let indexNo = balloonpositionsarray[0].findIndex(function(a){return a==1})

                balloonpositionsarray[0][indexNo]=3

                console.log(balloonpositionsarray[0][indexNo])

                balloons[findBalloonExactNo(1)].attr({
                    "opacity": 0
                })
                
                playdone()

                moveRowsUp()
                iosocket.send(iosocket['roomID'],{"col":1})
                checkIfFinished()
                
            }
            if(event.keyCode== 76 && getPosFinder(2) == 2&& penalty == false){
                console.log(76)
                let indexNo = balloonpositionsarray[0].findIndex(function(a){return a==2})

                balloonpositionsarray[0][indexNo]=3

                console.log(balloonpositionsarray[0][indexNo])

                balloons[findBalloonExactNo(2)].attr({
                    "opacity": 0
                })
                
                playdone()

                moveRowsUp()
                iosocket.send(iosocket['roomID'],{"col":2})
                checkIfFinished()
            }


            // if(balloonpositionsarray.length === 0){
            //     if(document.getElementById("roomNoHeader").innerHTML=== roomNo && alertOnce === 0){
            //             alert(`Good job! You've won! :D`)
            //             endGameVs()
            //             alertOnce = 1
            //     }
            //     if(document.getElementById("roomNoHeader").innerHTML=== "Individual Mode" && alertOnce === 0)
            //         endGameInd()
            //         alertOnce = 1
                
            // }

            progressbarupdate()
            console.log(noOfRowsShifted)

            // iosocket.send("balloonpositionsarray")
        
    });
    function alertMsgWin(){
        alert(`Good job! You've won! :D`)
    }
    async function checkIfFinished(){
        if(balloonpositionsarray.length === 0){
            if(document.getElementById("roomNoHeader").innerHTML=== roomNo ){
                    alertMsgWin()
                    await endGameVs()
                    await iosocket.send(roomNo,{"vsEndGameStatus": true,"endtime":endtime})

                    // alert(`Good job! You've won! :D`)

                    // alertOnce = 1
            }
            if(document.getElementById("roomNoHeader").innerHTML=== "Individual Mode")
                endGameInd()
                // alertOnce = 1
            
        }


    }


//versus pregame set up
document.getElementById("Mode").addEventListener("click", function(){
    modeType = 55
    document.getElementById("roomNoHeader").innerHTML = "Individual Mode"
    document.getElementById("oppusername").innerHTML= "..."
    console.log("Indiv mode")
    iosocket.emit('individualMode')
    endGameVs()
})

document.getElementById("Start").addEventListener("click",function(){

    if(startGameTimer<4){
    }else{
        if(modeType === 55){
            startgamecountdown()
            document.getElementById("Start").disabled=true
            setTimeout(function(){document.getElementById("Start").disabled=false},3000)        
        }else{
            yourreadystatus = "ready"
            iosocket.send(iosocket['roomID'],{"datatype":"ready"});

            if(oppreadystatus!=="ready" && yourreadystatus === "ready"){
                var oppready = paper.text(pWidth/2, pHeight/2, "Waiting for \nopponent");

                oppready.attr({
                    "fill":"white",
                    "font-family":"Budokan",
                    "font-size":20,
                }) 
            }

            if(oppreadystatus==="ready" && yourreadystatus === "ready"){

                startgamecountdown()
            }
        }
    }   
})