var game = new Phaser.Game(800,600,Phaser.AUTO,'game');
var Game = {};

Game.game = function(){  };
Game.boot = function(){  };
Game.gameover = function() {  };

Game.game.prototype = {

    create: function()
    {
        score = 0;
        // var scoreText;
        // var bullets;
        // game.plugins.screenShake = game.plugins.add(Phaser.Plugin.ScreenShake);
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.add.sprite(0,0,'ground');
        player = game.add.sprite(32,game.world.height - 150, 'dude');
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        // player.scale.setTo(0.5,0.5);
        player.anchor.setTo(0.5,0.5);
        player.canFire = true;
        player.health = 3;
        player.isInvicible = false;
        player.strength = 1;
        boxes = game.add.group();
        boxes.enableBody = true;
        this.addBox();
        enemies = game.add.group();
        enemies.enableBody = true;
        this.spawnZombie();
        this.spawnZombie();
        bullets = game.add.group();
        bullets.enableBody = true;
        cursors = game.input.keyboard.createCursorKeys();
        pointer = game.add.sprite(game.input.activePointer.position.x,game.input.activePointer.position.y,'aim');
        pointer.anchor.setTo(0.5,0.5);
        game.time.events.loop(Phaser.Timer.SECOND,this.spawnZombie,this);
        game.time.events.loop(5000,this.addBox,this);
        scoreText = game.add.text(20,20,'Score: ' + score,{fill:'#000'});
    },

    update: function()
    {
        // scoreText = game.add.text(16,16,'score: 0',{fontSize: '32px',fill:'#000'});
        game.physics.arcade.overlap(bullets,enemies,function(bullet,ennemy){
            bullet.kill();
            ennemy.damage(player.strength); 
            if(ennemy.exists === false)
            {
                score += 1;
                scoreText.text = 'Score: ' + score;
                game.sound.play('zombie-death');
            }
        });
        game.physics.arcade.collide(player,enemies,function(player,ennemy){
            if(player.isInvicible === false)
            {
                player.damage(1);
                game.sound.play('hurt');
                player.isInvicible = true;
                game.time.events.add(2000,function(){
                    player.isInvicible = false;
                },this);
            }
        });
        game.physics.arcade.overlap(player,boxes,function(player,box){
            player.strength += 1;
            game.sound.play('powerup');
            box.kill();
            game.time.events.add(3000,function(){
                player.strength -= 1;
            });
        });
        if(player.exists === false) 
        {
            // game.state.destroy();
            game.state.start('gameover');
        }
        enemies.forEach(function(ennemy){
            ennemy.rotation = game.physics.arcade.angleToXY(ennemy,player.position.x,player.position.y);
            game.physics.arcade.moveToObject(ennemy,player,70);
        },this);
        pointer.position = game.input.activePointer.position;
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;
        player.rotation = game.physics.arcade.angleToPointer(player);
        if(cursors.left.isDown)
        {
            player.body.velocity.x = -150;
        }
        if(cursors.right.isDown)
        {
            player.body.velocity.x = 150;
        }
        if(cursors.up.isDown)
        {
            player.body.velocity.y = -150;
        }
        if(cursors.down.isDown)
        {
            player.body.velocity.y = 150;
        }
        if(game.input.activePointer.isDown && player.canFire === true)
        {
            var bullet = bullets.create(player.position.x,player.position.y,'bullet');
            bullet.anchor.setTo(0.5,0.5);
            bullet.reset(player.position.x,player.position.y);
            bullet.rotation = game.physics.arcade.angleToPointer(bullet);
            game.physics.arcade.enable(bullet);
            game.physics.arcade.moveToPointer(bullet,500);
            game.sound.play('shoot');
            player.canFire = false;
            game.time.events.add(500,function(){
                player.canFire = true;
            },this);
        }
    },

    spawnZombie: function()
    {
        var zombie = enemies.create(Math.random() * game.width,Math.random() * game.height,'zombie');
        zombie.health = 2;
        zombie.anchor.setTo(0.5,0.5);
    },

    addBox: function()
    {
        var box = boxes.create(Math.random() * game.width,Math.random() * game.height,'box');
        box.anchor.setTo(0.5,0.5);
    },
};

Game.boot.prototype = {
    
    preload: function()
    {
        game.load.image('ground','assets/background.png');
        game.load.image('star','assets/star.png');
        game.load.image('dude','assets/character.png');
        game.load.image('bullet','assets/bullet.png');
        game.load.image('zombie','assets/zombie.png');
        game.load.image('box','assets/box.png');
        game.load.image('aim','assets/aim.png');
        game.load.audio('hurt','assets/sounds/hurt.wav');
        game.load.audio('powerup','assets/sounds/powerup.wav');
        game.load.audio('shoot','assets/sounds/shoot.wav');
        game.load.audio('zombie-death','assets/sounds/zombie-death.wav');
    },

    create: function()
    {
        game.sound.add('hurt');
        game.sound.add('powerup');
        game.sound.add('shoot');
        game.sound.add('zombie-death');
        game.state.start('game');
    }

};

Game.gameover.prototype = {
    
    create: function()
    {
        game.add.sprite(0,0,'ground');
        var game_over = game.add.text(game.width/2,game.height/2, "GAME OVER\nScore: " + score + "\nClick to restart...",{'align': 'center','font': '40pt sans-serif','fill':'red'});
        game_over.anchor.setTo(0.5,0.5);
    },

    update: function()
    {
        if(game.input.activePointer.isDown)
        {
            game.state.start('game');
        }
    }
};

game.state.add('boot',Game.boot);
game.state.add('game',Game.game);
game.state.add('gameover',Game.gameover);
game.state.start('boot');
