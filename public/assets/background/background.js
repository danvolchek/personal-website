'use strict';
var canvas;
var ctx;
var elements;
var blocks = [];
var balls = [];
var waves = [];
var DEBUG = false;
var blueShades = ['66,146,198', '33,113,181', '8,81,156', '8,48,107', '8,48,107'];

function getElementBounds() {
	let result = [];
	var name1 = document.getElementById('name').getBoundingClientRect();
	result.push({
		left: name1.left + 4,
		top: name1.top + 15,
		right: name1.right,
		bottom: name1.bottom - 17
	});
	result.push(document.getElementsByTagName('span')[0].getBoundingClientRect());
	for (let a of document.getElementsByTagName('a')) {
		result.push(a.getBoundingClientRect());
	}
	return result;
}

function onWindowResize() {
	var newWidth = Math.floor(document.documentElement.clientWidth) - 1;
	var newHeight = Math.floor(document.documentElement.clientHeight) - 1;
	canvas.setAttribute('width', newWidth);
	canvas.setAttribute('height', newHeight);
	elements = getElementBounds();
	elements.push({
		left: 0,
		top: -10,
		right: newWidth,
		bottom: 0
	});
	elements.push({
		left: 0,
		top: newHeight,
		right: newWidth,
		bottom: newHeight + 10
	});
	elements.push({
		left: -10,
		top: 0,
		right: 0,
		bottom: newHeight
	});
	elements.push({
		left: newWidth,
		top: 0,
		right: newWidth + 10,
		bottom: newHeight
	});
}

document.addEventListener('DOMContentLoaded', function(event) {
	canvas = document.getElementById('background');
	ctx = canvas.getContext('2d');

	var throttle = function(type, name, obj) {
		obj = obj || window;
		var running = false;
		var func = function() {
			if (running) {
				return;
			}
			running = true;
			requestAnimationFrame(function() {
				obj.dispatchEvent(new CustomEvent(name));
				running = false;
			});
		};
		obj.addEventListener(type, func);
	};

	throttle('resize', 'optimizedResize');
	window.addEventListener('optimizedResize', onWindowResize);
	onWindowResize();

	for (var i = 0; i < (window.innerWidth <= 800 ? 2 : 10); i++) {
		var w = Math.floor(3 * Math.random() * 20) + 20;
		var ball = {
			w: w,
			x: Math.floor(Math.random() * document.documentElement.clientWidth - w),
			y: Math.floor(Math.random() * document.documentElement.clientHeight - w),
			dx: (Math.floor(Math.random() * 2) * 2 - 1)*0.5,
			dy: (Math.floor(Math.random() * 2) * 2 - 1)*0.5,
			color: 'rgba(' + blueShades[Math.floor(Math.random() * blueShades.length)] + ',0.4)',
			collides: 0
		};

		while (detectCollisions(ball, elements, balls))
			randomizeBallPos(ball);

		balls.push(ball);
	}

	draw();
});

function randomizeBallPos(ball) {
	ball.x = Math.floor(Math.random() * document.documentElement.clientWidth - ball.w);
	ball.y = Math.floor(Math.random() * document.documentElement.clientHeight - ball.w);
}

function moveBall(ball, which, back) {
	if (back)
		ball[which] -= 1 * ball['d' + which];
	else
		ball[which] += 1 * ball['d' + which];
}

function clamp(a, b, c) {
	return Math.min(Math.max(a, b), c);
}

function ballEdgeCollision(ball, block) {
	var closestX = clamp(ball.x + (ball.w / 2), block.left, block.right);
	var closestY = clamp(ball.y + (ball.w / 2), block.top, block.bottom);

	var distanceX = ball.x + (ball.w / 2) - closestX;
	var distanceY = ball.y + (ball.w / 2) - closestY;

	var distanceSquared = Math.pow(distanceX, 2) + Math.pow(distanceY, 2);
	return distanceSquared < Math.pow(ball.w / 2, 2);
}

function ballBallCollision(ball, ball2) {
	return Math.hypot(ball.x + (ball.w / 2) - ball2.x - (ball2.w / 2), ball.y + (ball.w / 2) - ball2.y - (ball2.w / 2)) <= ball.w / 2 + ball2.w / 2;
}

function detectCollisions(ball, blocks, balls) {
	var cx = false;
	var cy = false;

	for (var i = 0; i < blocks.length; i++) {
		var block = blocks[i];

		moveBall(ball, 'x');
		cx = ballEdgeCollision(ball, block);
		moveBall(ball, 'x', true);
		moveBall(ball, 'y');
		cy = ballEdgeCollision(ball, block);
		moveBall(ball, 'y', true);

		if (cx || cy)
			return {
				x: cx,
				y: cy,
				ballO: null
			};
	}

	for (var i = 0; i < balls.length; i++) {
		var ballO = balls[i];
		if (ball == ballO)
			continue;

		moveBall(ball, 'x');
		cx = ballBallCollision(ball, ballO);
		moveBall(ball, 'x', true);
		moveBall(ball, 'y');
		cy = ballBallCollision(ball, ballO);
		moveBall(ball, 'y', true);

		if (cx || cy)
			return {
				x: cx,
				y: cy,
				ballO: i
			};
	}
	return false;
}

function handleCollisions(ball, blocks, balls) {
	var collision = detectCollisions(ball, blocks, balls);

	if (collision.x) {
		ball.dx *= -1;
		if (collision.ballO != null)
			balls[collision.ballO].dx *= -1;

	}
	if (collision.y) {
		ball.dy *= -1;
		if (collision.ballO != null)
			balls[collision.ballO].dy *= -1;
	}
	if (collision.x || collision.y) {
		waves.push({
			x: ball.x + ball.w / 2,
			y: ball.y + ball.w / 2,
			w: ball.w / 2,
			ow: ball.w / 2,
			c: ball.color
		});
		ball.collides++;
	} else
		ball.collides = 0;

	if (collision.ballO != null) {
		var ballO = balls[collision.ballO];
		waves.push({
			x: ballO.x + ballO.w / 2,
			y: ballO.y + ballO.w / 2,
			w: ballO.w / 2,
			ow: ballO.w / 2,
			c: ballO.color
		});
	}


}

var lastBallPositions = [];

function drawBall(ball) {
	ctx.beginPath();
	ctx.fillStyle = ball.color;
	ctx.arc(ball.x + ball.w / 2, ball.y + ball.w / 2, ball.w / 2, 0, 2 * Math.PI);
	ctx.fill();
	if (DEBUG)
		ctx.strokeRect(ball.x, ball.y, ball.w, ball.w);
}

function drawWave(wave) {
	ctx.beginPath();
	ctx.strokeStyle = wave.c;
	ctx.arc(wave.x, wave.y, wave.w, 0, 2 * Math.PI);
	ctx.stroke();
}



function draw() {
	ctx.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);

	if (DEBUG) {
		ctx.fillStyle = 'black';
		for (var element of elements) {
			ctx.strokeRect(element.left, element.top, element.right - element.left, element.bottom - element.top);
		}
	}

	for (var ball of balls) {
		handleCollisions(ball, elements, balls);

		moveBall(ball, 'x');
		moveBall(ball, 'y');

		drawBall(ball);

		if (ball.collides > 2)
			randomizeBallPos(ball);
	}

	for (var i = 0; i < waves.length; i++) {
		var wave = waves[i];
		drawWave(wave);
		wave.w += 5 / wave.ow;

		if (wave.w >= wave.ow * 2) {
			waves.splice(i, 1);
			i--;
		}
	}

	requestAnimationFrame(draw);
}