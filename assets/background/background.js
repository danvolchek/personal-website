'use strict';
var DEBUG = false;

class Utils {
	static clamp(a, b, c) {
		return Math.min(Math.max(a, b), c);
	}

	static get blueShades() {
		return ['66,146,198', '33,113,181', '8,81,156', '8,48,107', '8,48,107'];
	}
}

class Rectangle {
	constructor(left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	}

	draw(drawContext) {
		drawContext.strokeStyle = "#FF0000";
		drawContext.strokeRect(this.left, this.top, this.right - this.left, this.bottom - this.top);
	}
}

class DOMInterface {
	static get screenWidth() {
		return document.documentElement.clientWidth;
	}

	static get screenHeight() {
		return document.documentElement.clientHeight;
	}

	static get adjustedScreenWidth() {
		return Math.floor(DOMInterface.screenWidth) - 1;
	}

	static get adjustedScreenHeight() {
		return Math.floor(DOMInterface.screenHeight) - 1;
	}

	static queueNextFrame(callback) {
		window.requestAnimationFrame(callback);
	}

	static registerResizeListener(callback) {
		window.addEventListener('resize', callback);
	}

	static findTextRectangles() {
		let rectangles = [];

		let nameRect = document.getElementById('name').getBoundingClientRect();
		rectangles.push(new Rectangle(
			nameRect.left + 4,
			nameRect.top + 15,
			nameRect.right,
			nameRect.bottom - 15
		));

		rectangles.push(this.DOMRectToRecangle(document.getElementsByTagName('span')[0].getBoundingClientRect()));

		for (let anchor of document.getElementsByTagName('a')) {
			rectangles.push(this.DOMRectToRecangle(anchor.getBoundingClientRect()));
		}

		return rectangles;
	}

	static DOMRectToRecangle(DOMRect) {
		return new Rectangle(DOMRect.left, DOMRect.top, DOMRect.right, DOMRect.bottom);
	}
}

class Drawable {
	constructor(width, xPos, yPos, color) {
		this.width = width;
		this.xPos = xPos;
		this.yPos = yPos;
		this.color = color;
	}
}

class Wave extends Drawable {
	constructor(width, xPos, yPos, color) {
		super(width, xPos, yPos, color);
		this.originalWidth = width;
	}

	draw(drawContext) {
		drawContext.beginPath();
		drawContext.strokeStyle = this.color;
		drawContext.arc(this.xPos, this.yPos, this.width, 0, 2 * Math.PI);
		drawContext.stroke();
	}
}

class CollideInfo {
	constructor(xCollision, yCollision) {
		this.xCollision = xCollision;
		this.yCollision = yCollision;
	}
}

class Ball extends Drawable {
	constructor(width, xPos, yPos, xVel, yVel, color) {
		super(width, xPos, yPos, color);
		this.xVel = xVel;
		this.yVel = yVel;
		this.collides = 0;
	}

	randomizePos() {
		this.xPos = Math.floor(Math.random() * DOMInterface.screenWidth - this.width);
		this.yPos = Math.floor(Math.random() * DOMInterface.screenHeight - this.width);
	}

	move(direction, backwards = false) {
		if (direction == 'x')
			this.xPos += (backwards ? -1 : 1) * this.xVel;
		else if (direction == 'y')
			this.yPos += (backwards ? -1 : 1) * this.yVel;
	}

	collidesWithImpl(method, elements) {
		let collisionX = false;
		let collisionY = false;

		for (let element of elements) {
			if (element == this)
				continue;
			this.move('x');
			collisionX = method(element);
			this.move('x', true);
			this.move('y');
			collisionY = method(element);
			this.move('y', true);

			if (collisionX || collisionY) {
				return new CollideInfo(collisionX, collisionY);
			}
		}

		return null;
	}

	collidesWith(rectangles, balls) {
		let collision = this.collidesWithImpl(this.collidesWithRect.bind(this), rectangles) ||
			this.collidesWithImpl(this.collidesWithBall.bind(this), balls);

		this.handleCollision(collision);

		return collision;
	}

	handleCollision(collision) {
		if (collision == null) {
			this.collides = 0;
			return;
		}

		if (collision.xCollision) {
			this.xVel *= -1;
		}

		if (collision.yCollision) {
			this.yVel *= -1;
		}

		this.collides++;
	}

	collidesWithRect(rectangle) {
		let closestX = Utils.clamp(this.xPos + (this.width / 2), rectangle.left, rectangle.right);
		let closestY = Utils.clamp(this.yPos + (this.width / 2), rectangle.top, rectangle.bottom);

		let distanceX = this.xPos + (this.width / 2) - closestX;
		let distanceY = this.yPos + (this.width / 2) - closestY;

		let distanceSquared = Math.pow(distanceX, 2) + Math.pow(distanceY, 2);
		return distanceSquared < Math.pow(this.width / 2, 2);
	}

	collidesWithBall(ball) {
		return Math.hypot(this.xPos + (this.width / 2) - ball.xPos - (ball.width / 2), this.yPos + (this.width / 2) - ball.yPos - (ball.width / 2)) <= this.width / 2 + ball.width / 2;
	}

	draw(drawContext) {
		drawContext.beginPath();
		drawContext.fillStyle = this.color;
		drawContext.arc(this.xPos + this.width / 2, this.yPos + this.width / 2, this.width / 2, 0, 2 * Math.PI);
		drawContext.fill();
		if (DEBUG) {
			drawContext.strokeStyle = "#FF0000";
			drawContext.strokeRect(this.xPos, this.yPos, this.width, this.width);
		}
	}
}

class Background {
	constructor(canvas) {
		this.canvas = canvas;
		this.drawContext = canvas.getContext('2d');

		this.onWindowResize();
		setTimeout(this.onWindowResize.bind(this), 100);
		DOMInterface.registerResizeListener(this.onWindowResize.bind(this));

		this.rectangles = this.createRectangles();
		this.balls = this.createBalls();
		this.waves = [];
	}

	adjustCanvasSize() {
		this.canvas.setAttribute('width', DOMInterface.adjustedScreenWidth);
		this.canvas.setAttribute('height', DOMInterface.adjustedScreenHeight);
	}

	createRectangles() {
		let rectangles = DOMInterface.findTextRectangles();

		let adjustedScreenWidth = DOMInterface.adjustedScreenWidth;
		let adjustedScreenHeight = DOMInterface.adjustedScreenHeight;

		rectangles.push(...[
			new Rectangle(0, -10, adjustedScreenWidth, 0),
			new Rectangle(0, adjustedScreenHeight, adjustedScreenWidth, adjustedScreenHeight + 10),
			new Rectangle(-10, 0, 0, adjustedScreenHeight),
			new Rectangle(adjustedScreenWidth, 0, adjustedScreenWidth + 10, adjustedScreenHeight)
		]);

		return rectangles;
	}

	onWindowResize() {
		this.rectangles = this.createRectangles();
		this.adjustCanvasSize();
	}

	createBalls() {
		let balls = [];
		for (let i = 0; i < (window.innerWidth <= 800 ? 2 : 10); i++) {
			let width = Math.floor(3 * Math.random() * 20) + 20;
			let ball = new Ball(
				width,
				Math.floor(Math.random() * DOMInterface.screenWidth - width),
				Math.floor(Math.random() * DOMInterface.screenHeight - width),
				(Math.floor(Math.random() * 2) * 2 - 1) * 0.5,
				(Math.floor(Math.random() * 2) * 2 - 1) * 0.5,
				'rgba(' + Utils.blueShades[Math.floor(Math.random() * Utils.blueShades.length)] + ',0.4)');


			while (ball.collidesWith(this.rectangles, balls))
				ball.randomizePos();

			balls.push(ball);
		}

		return balls;
	}

	createWave(ball) {
		this.waves.push(new Wave(
			ball.width / 2,
			ball.xPos + ball.width / 2,
			ball.yPos + ball.width / 2,
			ball.color));
	}

	tick(self) {
		this.update();
		this.draw();

		DOMInterface.queueNextFrame(this.tick.bind(this));
	}

	update() {
		for (let ball of this.balls) {
			if (ball.collidesWith(this.rectangles, this.balls)) {
				this.createWave(ball);
			}
		}

		for (let ball of this.balls) {
			if (ball.collides > 2) {
				ball.randomizePos();
			} else {
				ball.move('x');
				ball.move('y');
			}
		}



		for (let i = 0; i < this.waves.length; i++) {
			let wave = this.waves[i];

			wave.width += 5 / wave.originalWidth;

			if (wave.width >= wave.originalWidth * 2) {
				this.waves.splice(i, 1);
				i--;
			}
		}
	}

	draw() {
		this.drawContext.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);

		if (DEBUG) {
			for (let rectangle of this.rectangles) {
				rectangle.draw(this.drawContext);
			}
		}

		for (let ball of this.balls) {
			ball.draw(this.drawContext);
		}

		for (let wave of this.waves) {
			wave.draw(this.drawContext);
		}
	}
}