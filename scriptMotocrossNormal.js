var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = 1200;
c.height = 400;
document.body.appendChild(c);

const sound = new Audio("motocrossSound.mp3");

var perm = [];
while (perm.length < 255){
	while(perm.includes(val = Math.floor(Math.random()*255)));	
	perm.push(val);
}

var lerp = (a,b,t) => a + (b-a) * (1-Math.cos(t*Math.PI))/2;
var noise = x => {
	x=x * 0.01 % 254; 		// must be smaller than 255 otherwise player hangs when loop is over
	return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x));
}
	
	
var player = new function(){
	this.x = c.width/2;
	this.y = 0;
	this.ySpeed = 0;
	this.rot = 0;
	this.rSpeed = 0;

	this.img = new Image();
	this.img.src = "motocross.png";
    this.draw = function(){
		var p1 = c.height - noise(t + this.x) * 0.25;
		var p2 = c.height - noise(t + 5 + this.x) * 0.25;

		var grounded = 0;
        if(p1-15 > this.y){
			this.ySpeed += 0.1;
		}else{
			this.ySpeed -= this.y - (p1-15);
			this.y = p1 - 15;
			grounded = 1;
		}

		var angle = Math.atan2((p2-15) - this.y, (this.x+5) - this.x);
		this.y += this.ySpeed;

		if(!playing || grounded &&  Math.abs(this.rot) > Math.PI * 0.5){
			playing = false;
			this.rSpeed = 5;
			k.ArrowUp = 1;
			this.x -= speed * 5;
		}
		
		if(grounded && playing){
			this.rot -= (this.rot - angle) * 0.5;
			this.rSpeed = this.rSpeed - (angle - this.rot);
		}
		
		this.rSpeed += (k.ArrowLeft - k.ArrowRight) * 0.05;
		this.rot -= this.rSpeed * 0.1;
		if(this.rot > Math.PI) this.rot = -Math.PI;
		if(this.rot < -Math.PI) this.rot = Math.PI;
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rot);
		ctx.drawImage(this.img,  -35, -35, 60, 60); //position, size image motocross.png
		ctx.restore();
	}
}


// clock
var sec = 0;
var timescore = localStorage.getItem("timerHighscore"); // save best time

function timeStart (intervalStart){
	if (playing === true) {
	return intervalStart > 9 ? intervalStart: "0" + intervalStart; 
	} else if (playing === false) {
		clearInterval(timer); // save Time
      }
}
	// show time
    setInterval (function timer(){
        document.getElementById("seconds").innerHTML = timeStart(++sec % 60);
        document.getElementById("minutes").innerHTML = timeStart(parseInt(sec/60,10));
	
	// show best time if highscore
	if (clearInterval(timer) !== null){
		if (score > highscore){
			localStorage.setItem("timerHighscore", sec);
		}	
	}	else{
			localStorage.setItem("timerHighscore", sec);
		}
		
		document.getElementById("bestTime").innerHTML = timescore;

    }, 1000);


var t = 0;  	//starting point, starts at 0 ends at 255 and then starts from the beginning in the loop
var speed = 0;
var playing = true;
var k = {ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0};
var score = 0;
var score_span = document.getElementById("scoreDisplay");
var highscore = localStorage.getItem("highscore");
var highscore_span = document.getElementById("highscoreDisplay");



function loop() {
	speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.01;
	t += 10 * speed;
	ctx.fillStyle = "#28E2F3";		// sky
	ctx.fillRect(0, 0, c.width, c.height);

	ctx.fillStyle = "#1BB534";		// forrest/mountain
	ctx.beginPath();
	ctx.moveTo(0, c.height);
    for (let i = 0; i < c.width; i++) 
		ctx.lineTo(i, c.height*0.8 - noise(t + i*5) * 0.25);
	ctx.lineTo(c.width, c.height);
	ctx.fill();

	ctx.fillStyle = "#966640";		// ground
    ctx.beginPath();
    ctx.moveTo(0, c.height);
    for (let i = 0; i < c.width; i++)
        ctx.lineTo(i, c.height - noise(t + i) * 0.25);
    ctx.lineTo(c.width, c.height);
    ctx.fill();
	
	player.draw();
	
	// makes score
	if (speed > 0.1 && playing === true){
		score += 2;
		score_span.innerHTML = score;
		ctx.font = '20px Verdana sans-serif';
		ctx.fillStyle = 'white';
		ctx.fillText('Speed +2 Points', 65, 25);
	}

	// sound
	if (speed > 0.2){
		sound.play();
	} else if (speed < 0.1){
		sound.pause();
	}
	
	// if player speed up +2 points
	if (speed > 0.9 && playing === true){
		score += 3;
		score_span.innerHTML = score;
		ctx.font = '20px Verdana sans-serif';
		ctx.fillStyle = 'yellow';
		ctx.fillText('Speed Up +3 Points', 65, 65);
	}
		
	// if player rotate +100 points
	if (player.rot >= 3 && player.rot <= 3.1 && playing === true) {
			score += 250;
			score_span.innerHTML = score;
	}
	// show rotate score + 100 points
	if (player.rot >= 1 && player.rot <= 3.5 && playing === true) {
			ctx.font = '20px Verdana sans-serif';
			ctx.fillStyle = 'orange';
			ctx.fillText('Looping +250 Points', 65, 105);
	}

	// save highscore
	if(highscore !== null){
		if (score > highscore) {
			localStorage.setItem("highscore", score);      
		}
	}else{
		localStorage.setItem("highscore", score);
	}

	highscore_span.innerHTML = highscore;
	
	//highscore or game over display
	if(player.x < 0 && score > highscore) {
	    	ctx.font = 'bold 60px Verdana sans-serif';
			ctx.fillStyle = '#F4D03F';
			ctx.fillText('Highscore', 450, 145); 
	} else if (player.x < 0 && score < highscore) {
	    	ctx.font = 'bold 60px Verdana sans-serif';
			ctx.fillStyle = 'red';
			ctx.fillText('Game Over', 450, 145); 
	}
	
	
	requestAnimationFrame(loop);

}


onkeydown = d => k[d.key] = 1;
onkeyup = d => k[d.key] = 0;


function moveup() {
	k.ArrowUp = 1;
}

function movedown() {
	k.ArrowDown = 1;
}

function moveleft() {
	k.ArrowLeft = 1;
}

function moveright() {
	k.ArrowRight = 1;
}

function clearmove() {
	k.ArrowUp = 0;
	k.ArrowDown = 0;
	k.ArrowLeft = 0;
	k.ArrowRight = 0;
}


loop();