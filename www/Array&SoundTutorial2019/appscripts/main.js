
console.log("Yo, I am alive!");
// ----------------------------------

let duringsound = new Audio("resources/during.mp3")
let ballsound = new Audio("resources/ballwall.wav")

var button = document.getElementById("butt")

var status = "pause"






// ----------------------------------

// Grab the div where we will put our Raphael paper
var centerDiv = document.getElementById("centerDiv");

// Create the Raphael paper that we will use for drawing and creating graphical objects
var paper = new Raphael(centerDiv);

// put the width and heigth of the canvas into variables for our own convenience
var pWidth = paper.width;
var pHeight = paper.height;
console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);

// Just create a nice black background
var bgRect = paper.rect(0,0,pWidth, pHeight);
bgRect.attr({"fill": "black"});

// A dot for us to play with
var dot = paper.circle(pWidth/2, pHeight/2, 20);
dot.attr({"fill": "green"});

//-------------------
// load time
//-------------------
var loadTime=Date.now()
console.log("load time is " + loadTime/1000);

//Lets display a clock for the user in the footer.
var myFooter=document.getElementById("myFooter");

//-------------------
// Add some properties to dot just to keep track of it's "state"
dot.xpos=pWidth/2;     
dot.ypos=pHeight/2;
dot.xrate=5;
dot.yrate=5;

// our drawing routine, will use as a callback for the interval timer
var draw = function(){
    myFooter.innerHTML="Time: " + (Date.now()-loadTime)/1000

    // Update the position where we want our dot to be
    dot.xpos += dot.xrate;
    dot.ypos += dot.yrate;

    // Now actually move the dot using our 'state' variables
    dot.attr({'cx': dot.xpos, 'cy': dot.ypos});

    //---------------------------------------------
    // When dots hit the wall, reverse direction 
    if (dot.xpos > pWidth) {
        dot.xrate = -dot.xrate;
        cont()
    }
    if (dot.ypos > pHeight) {
        dot.yrate = - dot.yrate;
        cont()
    };
    if (dot.xpos < 0) {
        dot.xrate = -dot.xrate;
        cont()
    }
    if (dot.ypos < 0) {
        dot.yrate = - dot.yrate;
        cont()
    };
}


// call draw() periodically - save the timer in a variable so we can stop it if we want!
var timer

var startani=function(){
    timer = setInterval(draw, 20)
}

  button.addEventListener("click",function(ev){
    if(status ==="pause" || duringsound.ended){
        status="play";
        duringsound.play();
        startani()
    } else {
        status ="pause";
        duringsound.pause()
        clearInterval(timer)
    }
    console.log(status)
    console.log(duringsound.ended)
})

var cont = function(){
    ballsound.pause();
    ballsound.currentTime =0.0;
    ballsound.play()
}