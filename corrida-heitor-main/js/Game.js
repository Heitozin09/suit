class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    //this.resetButton=createImg("./ssets/reset.png");
    //this.resetButton.size(60,60)

    this.leaderboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving=false

  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    fuels=new Group ()
    powerCoins=new Group()
    obstacles=new Group()

    var obstaclesPositions=[
      {x:width/2+250,y:height-800,image:ObstaclesImg2},
      {x:width/2-150,y:height-1300,image:ObstaclesImg1},
      {x:width/2+250,y:height-1800,image:ObstaclesImg1},
      {x:width/2-180,y:height-2300,image:ObstaclesImg2},
      {x:width/2,y:height-2800,image:ObstaclesImg2},
      {x:width/2-180,y:height-3300,image:ObstaclesImg1},
      {x:width/2+180,y:height-3300,image:ObstaclesImg2},
      {x:width/2+250,y:height-3800,image:ObstaclesImg2},
      {x:width/2-250,y:height-4300,image:ObstaclesImg1},
      {x:width/2+250,y:height-4800,image:ObstaclesImg2},
      {x:width/2,y:height-5300,image:ObstaclesImg1},
      {x:width/2-180,y:height-5500,image:ObstaclesImg2},
    ]

    this.addSprites(fuels,4,fuelImg,0.02)
    this.addSprites(powerCoins,18,powerCoinImg,0.09)
    this.addSprites(
      obstacles,
      obstaclesPositions.length,
      ObstaclesImg1,
      0.04,
      obstaclesPositions
    )
  }

   addSprites(spriteGroup,numberOfSprites,spriteImage,scale,positions=[]){
    for (let i = 0; i < numberOfSprites; i++) {
      var x,y 

      if (positions.length>0) {
          x=positions[i].x
          y=positions[i].y
          spriteImage=positions[i].image
      } else {
        x=random(width/2+150,width/2-150)
        y=random(-height*4.5,height-400)
      }
      var sprite=createSprite(x,y)
      sprite.addImage("sprite",spriteImage)
      sprite.scale=scale
      spriteGroup.add(sprite)
    }
   }


  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leaderboardTitle.html("Placar");
    this.leaderboardTitle.class("resetText");
    this.leaderboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.ShowLife()
      this.ShowFuel()

      this.showLeaderboard();

      //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.HandleFuel(index)
          this.handlePower(index)

          //alterar a posição da câmera na direção y
          camera.position.y = cars[index - 1].position.y;
        }
      }

      if(this.playerMoving){
        player.positionY+=5
        player.update()
      }
        
      

      // manipulando eventos de teclado
      this.handlePlayerControls();

      const finishline = height*6-100
      if (player.positionY>finishline) {
        gameState = 2
        player.rank += 1
        Player.updateCarsAtEnd(player.rank)
        player.update() 
        this.showRank()
      }

      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd:0
      });
      window.location.reload();
    });
  }

  ShowLife(){
    push()
    image(lifeImg,width/2-130,height-player.positionY-280,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-280,185,20)
    fill("red")
    rect(width/2-100,height-player.positionY-280,player.life,20)
    noStroke()
    pop()
  }

  ShowFuel(){
    push()
    image(fuelImg,width/2-130,height-player.positionY-250,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-250,185,20)
    fill("red")
    rect(width/2-100,height-player.positionY-250,player.fuel,20)
    noStroke()
    pop()
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if (keyIsDown(UP_ARROW) || keyIsDown("w")) {
      this.playerMoving=true
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50 ||
      keyIsDown("a") && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300 ||
      keyIsDown("d") && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }

  HandleFuel(index){
    cars[index-1].overlap(fuels,function(collector,collected){
      player.fuels = 185
      collected.remove()
    })
    if (player.fuel>0&&this.playerMoving) {
    player.fuel-=0.3
    }

    if (player.fuel<=0) {
      gameState=2
      this.GameOver()
    }
  }

  handlePower(index){
    cars[index-1].overlap(powerCoins,function(collector,collected){
      player.score +=21
      player.update()
      collected.remove()
    })

  }

  ShowRank(){
    swal({
    title:`Incrivel!${"\n"}${player.rank}ºlugar`,
    text:"vc alcanço a linha de chegada com sucesso",
    imageUrl:"https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
    imageSize:"100x100",
    confirmButtomText:"ok"
  
  })
  }

  GameOver(){
    swal({
    title:`Fim de Jogo!`,
    text:"Ops vc perdeu a corrida",
    imageUrl:"https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
    imageSize:"100x100",
    confirmButtomText:"Obrigado por jogar"
  
  })
  }

}


