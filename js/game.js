// create a new scene
let gameScene  = new Phaser.Scene('Game');

// initialize game parameters
gameScene.init = function() {

	// player speed
	this.playerSpeed = 3;

	// enemy speed
	this.enemyMinSpeed = 2;
	this.enemyMaxSpeed = 5;

	// boundaries for enemy
	this.enemyMinY = 80;
	this.enemyMaxY = 280;

	// game is live
	this.isTerminating = false;
};

// Load assets
gameScene.preload = function(){
	// Load images
	this.load.image('background', 'assets/background.png');
	this.load.image('player', 'assets/player.png');
	this.load.image('enemy', 'assets/dragon.png');
	this.load.image('goal', 'assets/treasure.png');
};

// called once after the preload ends
gameScene.create = function() {

	//declare height and width locally
  	let gameW = this.sys.game.config.width;
  	let gameH = this.sys.game.config.height;

  	// create bg sprite
  	let bg = this.add.sprite(0, 0, 'background');

  	// instantiate other sprites
  	this.player = this.add.sprite(0,0, 'player');
  	this.goal = this.add.sprite(0,0, 'goal');

  	// set starting position of sprites
  	bg.setPosition(gameW/2, gameH/2);
  	this.player.setPosition(40, gameH/2);
  	this.goal.setPosition(gameW - 80, gameH/2);

  	// set sprite depth
  	this.player.depth = 1;

  	//scale sprites
  	this.player.setScale(.5);
  	this.goal.setScale(.6);

  	// enemy group
  	this.enemies = this.add.group({
  		key: 'enemy',
  		repeat: 4,
  		setXY: {
  			x: 90,
  			y: 100,
  			stepX: 100,
  			stepY: 20
  		}
  	});

  	// set scale to all group elements
	Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);

	// set flipX and speed
	Phaser.Actions.Call(this.enemies.getChildren(), function(enemy){
		//flip enemy
		enemy.flipX = true;

		// set speed
  		let dir = Math.random() < 0.5 ? 1 : -1;
  		let speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
  		enemy.speed = dir * speed;

	}, this);

  	//logging
  	console.log(gameW, gameH);
  	console.log(bg);
  	console.log(this.player);
  	console.log(this);
};

// this is called up to 60 times per second
gameScene.update = function(){

	// don't execute if we are terminating game
	if(this.isTerminating) return;
	
	// check for active input
	if(this.input.activePointer.isDown){
		//player walks forward
		this.player.x += this.playerSpeed;
	}

	// collision detection for victory	
	let playerRect = this.player.getBounds();
	let treasureRect = this.goal.getBounds();

	if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)){
		console.log('Reached Goal!');

		//end game
		return this.gameOver();

	}

	gameScene.gameOver = function(){

		// intiated game over sequence
		this.isTerminating = true;
		
		//shake camera
		this.cameras.main.shake(500);

		//listen for even completion
		this.cameras.main.on('camerashakecomplete', function(camera, effect){
			
			// fade out
			this.cameras.main.fade(500);

		}, this);

		this.cameras.main.on('camerafadeoutcomplete', function(camera, effect){
			// restart the scene
			this.scene.restart();
		}, this);
	
	}

	// get enemies
	let enemies = this.enemies.getChildren();
	let numEnemies = enemies.length;

	for(let i = 0; i < numEnemies; i++){

		// enemy movement
		enemies[i].y += enemies[i].speed;

		let conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
		let conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;
	
		// check Y boundaries and reverse on contact
		if(conditionUp || conditionDown){
			enemies[i].speed *= -1;
		}

		// collision detection for dragons	
		let enemyRect = enemies[i].getBounds();
		if(Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)){
			console.log('YOU DIED!!');

			// restart the scene
			return this.gameOver();

		}

	} 

};


// set the configuration of game
let config = {
	type: Phaser.AUTO, //phaser will use WebGL if avail, otherwise Canvas
	width: 640,
	height: 360,
	scene: gameScene
};

//create a new game, pass the configuration
let game = new Phaser.Game(config);
