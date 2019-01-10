'use strict';
var DEBUG = false;

/**
 * Represents an RGBA color.
 */
class Color {
	/**
	 * Constructs an instance.
	 * @param  {float} red   The red value.
	 * @param  {float} green The green value.
	 * @param  {float} blue  The blue value.
	 * @param  {float} alpha The alpha value.
	 */
	constructor(red, green, blue, alpha) {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}

	/**
	 * Returns a string representation of this color.
	 * @return {string} This color as a string.
	 */
	toString() {
		return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
	}

	/**
	 * Returns a copy of this Color.
	 * @return {Color} A copy of this color.
	 */
	copy() {
		return new Color(this.red, this.green, this.blue, this.alpha);
	}
}

/**
 * A class with some utility methods.
 */
class Utils {
	/**
	 * Clamps val to be between min and max.
	 * @param  {int} val The value to clamp.
	 * @param  {int} min The minimum range.
	 * @param  {int} max The maximum range.
	 * @return {int}     A clamped value.
	 */
	static clamp(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}

	/**
	 * Returns an array of nice looking shades of blue.
	 * @return {string[]} An array of shades of blue.
	 */
	static get blueShades() {
		return [new Color(66, 146, 198, 1), new Color(33, 113, 181, 1), new Color(8, 81, 156, 1), new Color(8, 48, 107, 1), new Color(8, 48, 107, 1)];
	}
}

/**
 * Represents a rectangle that can be drawn.
 */
class Rectangle {
	/**
	 * Constructs an instance.
	 * @param  {float} left   The left most point of the rectangle.
	 * @param  {float} top    The top most point of the rectangle.
	 * @param  {float} right  The right most point of the rectangle.
	 * @param  {float} bottom The bottom most point of the rectangle.
	 */
	constructor(left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	}

	/**
	 * Draws the rectangle
	 * @param  {Context2D} drawContext Context upon which
	 */
	draw(drawContext) {
		drawContext.strokeStyle = "#FF0000";
		drawContext.strokeRect(this.left, this.top, this.right - this.left, this.bottom - this.top);
	}
}

/**
 * A class that encapsulates interacting with the DOM.
 */
class DOMInterface {
	/**
	 * Gets the width of the screen.
	 * @return {float} The width of the screen.
	 */
	static get screenWidth() {
		return document.documentElement.clientWidth;
	}

	/**
	 * Gets the height of the screen.
	 * @return {float} The height of the screen.
	 */
	static get screenHeight() {
		return document.documentElement.clientHeight;
	}

	/**
	 * Gets an integer version of the width of the screen, rounded down.
	 * @return {int} The width of the screen.
	 */
	static get adjustedScreenWidth() {
		return Math.floor(DOMInterface.screenWidth) - 1;
	}

	/**
	 * Gets an integer version of the height of the screen, rounded down.
	 * @return {int} The height of the screen.
	 */
	static get adjustedScreenHeight() {
		return Math.floor(DOMInterface.screenHeight) - 1;
	}

	/**
	 * Queues the given function to be called near 60 times/second.
	 * @param  {Function} callback The function to call.
	 */
	static queueNextFrame(callback) {
		window.requestAnimationFrame(callback);
	}

	/**
	 * Registers the given function to be called when the window is resized.
	 * @param  {Function} callback The function to call.
	 */
	static registerResizeListener(callback) {
		window.addEventListener('resize', callback);
	}

	/**
	 * Creates rectangles from text visible on the screen.
	 * @return {Rectangle[]} An array of rectangles.
	 */
	static findTextRectangles() {
		let rectangles = [];

		//My name, with some adjustments for the chosen font.
		let nameRect = document.getElementById('name').getBoundingClientRect();
		rectangles.push(new Rectangle(
			nameRect.left + 4,
			nameRect.top + 15,
			nameRect.right,
			nameRect.bottom - 15
		));

		//Text blurb.
		rectangles.push(this.DOMRectToRecangle(document.getElementsByTagName('span')[0].getBoundingClientRect()));

		//Links.
		rectangles.push(...Array.from(document.getElementsByTagName('a'), anchor => this.DOMRectToRecangle(anchor.getBoundingClientRect())));

		return rectangles;
	}

	/**
	 * Converts a DOMRect to a Rectangle.
	 * @param {DOMRect} DOMRect The rectangle to convert.
	 */
	static DOMRectToRecangle(DOMRect) {
		return new Rectangle(DOMRect.left, DOMRect.top, DOMRect.right, DOMRect.bottom);
	}
}

/**
 * A drawable class that has a width, 2d position, and a color.
 */
class Drawable {
	/**
	 * Constructs an instance.
	 * @param  {float}  width The width.
	 * @param  {float}  xPos  The x position.
	 * @param  {float}  yPos  The y position.
	 * @param  {Color}  color The color.
	 */
	constructor(width, xPos, yPos, color) {
		this.width = width;
		this.xPos = xPos;
		this.yPos = yPos;
		this.color = color;
	}
}

/**
 * A wave created by ball collisions.
 */
class Wave extends Drawable {
	/**
	 * Constructs an instance.
	 * @param  {float}  width The width.
	 * @param  {float}  xPos  The x position.
	 * @param  {float}  yPos  The y position.
	 * @param  {Color}  color The color.
	 */
	constructor(width, xPos, yPos, color) {
		super(width, xPos, yPos, color);
		this.originalWidth = width;
		this.alphaChange = this.color.alpha / (this.width / (5 / this.originalWidth));
	}

	/**
	 * Makes the wave larger.
	 * @return {bool} Whether the wave should be destroyed.
	 */
	grow() {
		this.width += 5 / this.originalWidth;
		this.color.alpha -= this.alphaChange;

		if (this.color.alpha <= 0) {
			return true;
		}
	}

	/**
	 * Draws the wave.
	 * @param  {Context2D} drawContext The context to draw on.
	 */
	draw(drawContext) {
		drawContext.beginPath();
		drawContext.strokeStyle = this.color.toString();
		drawContext.arc(this.xPos, this.yPos, this.width, 0, 2 * Math.PI);
		drawContext.stroke();
	}
}

/**
 * Represents info about a collision.
 */
class CollisionInfo {
	/**
	 * Constructs an instance.
	 * @param  {bool} xCollision Whether a collision in the x direction occured.
	 * @param  {bool} yCollision Whether a collision in the y direction occured.
	 */
	constructor(xCollision, yCollision) {
		this.xCollision = xCollision;
		this.yCollision = yCollision;
	}
}

/**
 * Represents a ball that moves around.
 */
class Ball extends Drawable {
	/**
	 * Constructs an instance.
	 * @param  {float}  width The width.
	 * @param  {float}  xPos  The x position.
	 * @param  {float}  yPos  The y position.
	 * @param  {float}  xPos  The x velocity.
	 * @param  {float}  yPos  The y velocity.
	 * @param  {Color}  color The color.
	 */
	constructor(width, xPos, yPos, xVel, yVel, color) {
		super(width, xPos, yPos, color);
		this.xVel = xVel;
		this.yVel = yVel;
		this.collides = 0;
	}

	/**
	 * Randomized the position of this ball.
	 */
	randomizePos() {
		this.xPos = Math.floor(Math.random() * DOMInterface.screenWidth - this.width);
		this.yPos = Math.floor(Math.random() * DOMInterface.screenHeight - this.width);
	}

	/**
	 * Moves the ball.
	 * @param  {string}  direction Which direction to movie in. Either 'x' or 'y'.
	 * @param  {Boolean} backwards Whether to move the ball backwards or not.
	 */
	move(direction, backwards = false) {
		if (direction == 'x')
			this.xPos += (backwards ? -1 : 1) * this.xVel;
		else if (direction == 'y')
			this.yPos += (backwards ? -1 : 1) * this.yVel;
	}

	/**
	 * Checks whether the ball with collide with the given rectangles and balls, handling collision.
	 * @param  {Rectangle[]} rectangles The rectangles to check against.
	 * @param  {Ball[]} 	 balls      The balls to check againts.
	 * @return {CollisionInfo}          The collision info, or null.
	 */
	collidesWith(rectangles, balls) {
		let collision = this.collidesWithImpl(this.collidesWithRect.bind(this), rectangles) ||
			this.collidesWithImpl(this.collidesWithBall.bind(this), balls);

		this.handleCollision(collision);

		return collision;
	}

	/**
	 * Draws the ball.
	 * @param  {Context2D} drawContext The context to draw on.
	 */
	draw(drawContext) {
		drawContext.beginPath();
		drawContext.fillStyle = this.color.toString();
		drawContext.arc(this.xPos + this.width / 2, this.yPos + this.width / 2, this.width / 2, 0, 2 * Math.PI);
		drawContext.fill();
		if (DEBUG) {
			drawContext.strokeStyle = "#FF0000";
			drawContext.strokeRect(this.xPos, this.yPos, this.width, this.width);
		}
	}

	/* Private Methods */

	/**
	 * Implementation for collision detection.
	 * @param  {Function} method   The method to call that detects collisions.
	 * @param  {Drawable} elements Elements to compare against for collision.
	 * @return {CollisionInfo}     The collision that happened, or null.
	 */
	collidesWithImpl(method, elements) {
		let collisionX = false;
		let collisionY = false;

		for (let element of elements) {
			if (element == this)
				continue;

			// Move the ball, check if there will be a collision, then move it back.

			this.move('x');
			collisionX = method(element);
			this.move('x', true);
			this.move('y');
			collisionY = method(element);
			this.move('y', true);

			if (collisionX || collisionY) {
				return new CollisionInfo(collisionX, collisionY);
			}
		}

		return null;
	}

	/**
	 * Handles a collision, changing the velocity of this ball as necessary.
	 * @param  {CollisionInfo} collision The collision that happened.
	 */
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

	/**
	 * Whether the ball collides with the given rectangle.
	 * @param  {Rectangle} rectangle The rectangle to check against.
	 * @return {bool}           	 Whether a collision is happening.
	 */
	collidesWithRect(rectangle) {
		let closestX = Utils.clamp(this.xPos + (this.width / 2), rectangle.left, rectangle.right);
		let closestY = Utils.clamp(this.yPos + (this.width / 2), rectangle.top, rectangle.bottom);

		let distanceX = this.xPos + (this.width / 2) - closestX;
		let distanceY = this.yPos + (this.width / 2) - closestY;

		let distanceSquared = Math.pow(distanceX, 2) + Math.pow(distanceY, 2);
		return distanceSquared < Math.pow(this.width / 2, 2);
	}

	/**
	 * Whether the ball collides with the given ball.
	 * @param  {Ball} ball The ball to check against.
	 * @return {bool}      Whether a collision is happening.
	 */
	collidesWithBall(ball) {
		return Math.hypot(this.xPos + (this.width / 2) - ball.xPos - (ball.width / 2), this.yPos + (this.width / 2) - ball.yPos - (ball.width / 2)) <= this.width / 2 + ball.width / 2;
	}
}

/**
 * Represents the background of the website, a cool display of bouncing balls.
 */
class Background {
	/**
	 * Constructs an instance.
	 * @param  {Canvas} canvas The canvas to draw on.
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.drawContext = canvas.getContext('2d');

		//Set up resize handling.
		this.onWindowResize();
		setTimeout(this.onWindowResize.bind(this), 100);
		DOMInterface.registerResizeListener(this.onWindowResize.bind(this));

		//Set up ball bouncing.
		this.rectangles = this.createRectangles();
		this.balls = this.createBalls();
		this.waves = [];
	}

	/**
	 * Advances the simulation one step, then queues itself for further simulation.
	 */
	tick() {
		this.update();
		this.draw();

		DOMInterface.queueNextFrame(this.tick.bind(this));
	}

	/* Private Methods */

	/**
	 * Recreates the rectangles to bounce off of and adjusts the size of the canvas.
	 */
	onWindowResize() {
		this.rectangles = this.createRectangles();
		this.adjustCanvasSize();
	}

	/**
	 * Adjusts the size of the canvas to match the screen.
	 */
	adjustCanvasSize() {
		this.canvas.setAttribute('width', DOMInterface.adjustedScreenWidth);
		this.canvas.setAttribute('height', DOMInterface.adjustedScreenHeight);
	}

	/**
	 * Finds and creates all the rectangles the balls can bounce off of.
	 * @return {Rectangle[]} An array of rectangles.
	 */
	createRectangles() {
		//The visible text.
		let rectangles = DOMInterface.findTextRectangles();

		let adjustedScreenWidth = DOMInterface.adjustedScreenWidth;
		let adjustedScreenHeight = DOMInterface.adjustedScreenHeight;

		//Walls so the balls don't leave the screen.
		rectangles.push(...[
			new Rectangle(0, -10, adjustedScreenWidth, 0),
			new Rectangle(0, adjustedScreenHeight, adjustedScreenWidth, adjustedScreenHeight + 10),
			new Rectangle(-10, 0, 0, adjustedScreenHeight),
			new Rectangle(adjustedScreenWidth, 0, adjustedScreenWidth + 10, adjustedScreenHeight)
		]);

		return rectangles;
	}

	/**
	 * Creates the balls that bounce around in random positions, sizes, velocities, and colors.
	 * @return {Ball[]} An array of balls.
	 */
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
				Utils.blueShades[Math.floor(Math.random() * Utils.blueShades.length)]);


			while (ball.collidesWith(this.rectangles, balls))
				ball.randomizePos();

			balls.push(ball);
		}

		return balls;
	}

	/**
	 * Creates a wave from a ball, matching its position, size, and color.
	 * @param  {Ball} ball The ball to create from.
	 */
	createWave(ball) {
		this.waves.push(new Wave(
			ball.width / 2,
			ball.xPos + ball.width / 2,
			ball.yPos + ball.width / 2,
			ball.color.copy()));
	}

	/**
	 * Updates the ball simulation by one step.
	 */
	update() {
		//Check collisions and create waves. Velocity changing is handled in the Ball class.
		for (let ball of this.balls) {
			if (ball.collidesWith(this.rectangles, this.balls)) {
				this.createWave(ball);
			}
		}

		//Randomize the ball to a new spot if its been colliding too much, otherwise move it one step.
		for (let ball of this.balls) {
			if (ball.collides > 2) {
				ball.randomizePos();
			} else {
				ball.move('x');
				ball.move('y');
			}
		}

		//Update every wave.
		for (let i = 0; i < this.waves.length; i++) {
			let wave = this.waves[i];

			if (wave.grow()) {
				this.waves.splice(i, 1);
				i--;
			}
		}
	}

	/**
	 * Draws the background.
	 */
	draw() {
		//Clear the previous screen.
		this.drawContext.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);

		//Draw rectangle bounds for debug purposes if enabled.
		if (DEBUG) {
			for (let rectangle of this.rectangles) {
				rectangle.draw(this.drawContext);
			}
		}

		//Draw each ball.
		for (let ball of this.balls) {
			ball.draw(this.drawContext);
		}

		//Draw each wave.
		for (let wave of this.waves) {
			wave.draw(this.drawContext);
		}
	}
}