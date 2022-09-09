const game = {
  init : function () {
    // get handler for  game canvas and context
    game.canvas = document.getElementById('gameCanvas');
    game.context = game.canvas.getContext("2d");
    //init  object
    levels.init();
    loader.init();
    mouse.init();

    // Hide all game layers and display the start screen
    game.hideScreens();
    game.showScreen('gameStartScreen');
  },
  hideScreens: function () {
    const  screens = document.getElementsByClassName("gameLayer");
    for (let i = screens.length -1 ; i >= 0; i--) {
      const screen = screens[i];
      screen.style.display = "none";
    }
  },
  hideScreen: function(id) {
    const screen = document.getElementById(id);
    screen.style.display = "none";
  },
  showScreen: function(id) {
    const screen = document.getElementById(id);
    screen.style.display = "block";
  },
  showLevelScreen: function () {
    game.hideScreens();
    game.showScreen("levelSelectScreen");
  },
  // store current state - intro , wait-for-firing, firing , fired , load-next-hero
  mode: "intro",
  // X and Y coordinate of the slingshot
  slingShotX: 140,
  slingShotY: 280,

  // X and Y of point where the band is attached to the slingshot
  slingShotBandX: 140 + 55,
  slingShotBandY: 280 + 23,

  // Flag to check if the game as ended
  ended: false,

  // The game score
  score: 0,

  // X-axis offset for panning the screen from left to right
  offsetLeft: 0,

  start: function() {
    game.hideScreens();
    // Display the game canvas and score
    game.showScreen("gameCanvas");
    game.showScreen("scoreScreen");

    game.mode = "intro";
    game.currentHero = undefined;
    game.offsetLeft = 0;
    game.ended = false;

    game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
  },
  handleGameLogic: function() {
    if ( game.mode === "intro") {
      if (game.panTo(700)) {
        game.mode = "load-next-hero";
      }
    }
    if (game.mode === "wait-for-firing") {
      if (mouse.dragging) {
        game.panTo(mouse.x + game.offsetLeft);
      } else {
        game.panTo(game.slingShotX);
      }
    }
    if (game.mode === "load-next-hero") {
      // First count the heroes and villains and populate their respective arrays
      // Check if any villains are alive, if not, end the level (success)
      // Check if there are any more heroes left to load, if not end the level (failure)
      // Load the hero and set mode to wait-for-firing

      game.mode = "wait-for-firing";
    }

    if (game.mode === "firing") {
      // If the mouse button is down, allow the hero to be dragged around and aimed
      // If not, fire the hero into the air
    }

    if (game.mode === "fired") {
      // Pan to the location of the current hero as he flies
      //Wait till the hero stops moving or is out of bounds
    }

    if (game.mode === "level-success" || game.mode === "level-failure") {
      // First pan all the way back to the left
      // Then show the game as ended and show the ending screen
    }
  },
  animate: function () {
    // handle panning, game logic and control flow
    game.handleGameLogic();
    // Draw the background with parallax scrolling (parallax scrolling is a technique to create a illusion of depth)
    // First draw the background image, offset by a fraction of the offsetLeft distance (1/4)
    // The bigger the fraction the closer the background appears to be
    game.context.drawImage(
      game.currentlevel.backgroundImage,
      game.offsetLeft / 4,
      0, game.canvas.width,
      game.canvas.height,
      0,
      0,
      game.canvas.width,
      game.canvas.height
    );
    // then draw the forground image, offset by the entire offsetLeft distance;
    game.context.drawImage(
      game.currentlevel.foregroundImage,
      game.offsetLeft,
      0,
      game.canvas.width,
      game.canvas.height,
      0,
      0,
      game.canvas.width,
      game.canvas.height
    );

    // Draw the base of the slingshot, offset by the entire offsetLeft distance
    game.context.drawImage(game.currentlevel.slingshotImage, game.slingShotX - game.offsetLeft, game.slingShotY);

    // Draw the front of the slingshot, offset by the entire offsetLeft distance

    game.context.drawImage(game.currentlevel.slingshotFrontImage, game.slingShotX - game.offsetLeft, game.slingShotY);

    if (!game.ended) {
      game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    }
  },
  // Maximum panning speed per frame in pixels
  maxSpeed: 3,
  // Pan the screen so it centers at newCenter
  // ( or atleast as close as possible)
  panTo: function (newCenter) {
    let minOffset = 0;
    let maxOffset = game.currentlevel.backgroundImage.width - game.canvas.width;

    // The current center of the screen is half the screen width from the left offset
    let currentCenter = game.offsetLeft + game.canvas.width / 2;

    // If the distance between new center current center is > 0 and we have not panned to the min and max offset limits, keep panning
    if ( Math.abs(newCenter - currentCenter) > 0 &&
      game.offsetLeft <= maxOffset && game.offsetLeft >= minOffset) {
      // We will travel half the distance from the newCenter to currentCenter in each tick
      // This will allow easing
      let deltaX = (newCenter - currentCenter) / 2;
      // However if deltaX is really high, the screen will pan too fast, so if it is greater than maxSpeed
      if (Math.abs(deltaX) >game.maxSpeed) {
        // Limit delta x to game.maxSpeed (and keep the sign of deltaX)
        deltaX = game.maxSpeed * Math.sign(deltaX);
      }

      // And if we have almost reached the goal, just get to the ending in this turn
      if (Math.abs(deltaX) <= 1) {
        deltaX = (newCenter - currentCenter);
      }

      // Finally add the adjusted deltaX to offsetX so we move the screen by deltaX
      game.offsetLeft += deltaX;

      // And make sure we don't cross the minimum or maximum limits
      if (game.offsetLeft <= minOffset) {
        game.offsetLeft = minOffset;

        // Let calling function know that we have panned as close as possible to the newCenter
        return true;
      } else if (game.offsetLeft >= maxOffset) {
        game.offsetLeft = maxOffset;

        // Let calling function know that we have panned as close as possible to the newCenter
        return true;
      }

    } else {
      // Let calling function know that we have panned as close as possible to the newCenter
      return true;
    }
  }




}



const levels = {
  // Level Data
  data: [{ // First Level
    foreground: "desert-foreground",
    background: "clouds-background",
    entities: []
  }, { // Second Level
    foreground: "desert-foreground",
    background: "clouds-background",
    entities: []
  }],
  init: function () {
    const levelSelectScreen = document.getElementById("levelSelectScreen");
    // An event handler to call
    const buttonClickHandler = function () {
      game.hideScreen("levelSelectScreen");
      // Level label value are 1, 2 but indexes are 0 and 1
      levels.load(this.value -1);
    };

    for (let i = 0; i < levels.data.length; i++) {
      const button = document.createElement("input");
      button.type = "button";
      button.value =  (1 + i).toString(); // Level labels are 1 and 2
      button.addEventListener("click", buttonClickHandler);

      levelSelectScreen.appendChild(button);
    }

  },
  load: function (number) { //Load all data and images for a specific level
    // Declare the current level object
    game.currentlevel = { number: number}
    game.score = 0;
    document.getElementById("score").innerHTML = "Score: " + game.score;
    const level = levels.data[number];

    // Loaded the background, foreground and the slingshot images
    game.currentlevel.backgroundImage = loader.loadImage("images/backgrounds/" + level.background + ".png");
    game.currentlevel.foregroundImage = loader.loadImage("images/backgrounds/" + level.foreground + ".png");

    game.currentlevel.slingshotImage = loader.loadImage("images/slingshot.png");
    game.currentlevel.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

    loader.onload = game.start;

  }
}


// The image loader

const loader = {
  loaded: true,
  loaderCount: 0, // Asset that have loader so far
  totalCount: 0, // Total asset to be loaded
  init: function() {
    // Check the sound support
    let mp3Support, oggSupport;
    const audio = document.createElement('audio');
    if (audio.canPlayType) {
      // currently canPlayType retunr "", "maybe" or "probably"
      mp3Support = "" !== audio.canPlayType("audio/mpeg");
      oggSupport = "" !== audio.canPlayType("audio/ogg; codecs=\"vorbis\"");
    } else {
      mp3Support = false;
      oggSupport = false;
    }

    loader.soundFileExt = oggSupport ? ".ogg" : mp3Support ? "mp3" : undefined;
  },
  loadImage: function(url) {
    this.loaded = false;
    this.totalCount++;

    game.showScreen("loadingScreen");
    const image = new Image();
    image.addEventListener("load", loader.itemLoaded, false);
    image.src = url;
    return image;
  },
  soundFileExt: ".ogg",
  loadSound: function(url) {
    this.loaded = false;
    this.totalCount++;

    game.showScreen("loadingScreen");
    const audio = new Audio();

    audio.addEventListener("canplaythrough", loader.itemLoaded, false);
    audio.src  = url;

    return audio;
  },
  itemLoaded: function(ev) {
    // stop listening to the even now that it has been launched
    ev.target.removeEventListener(ev.type, loader.itemLoaded, false);

    loader.loaderCount++;

    document.getElementById("loadingMessage").innerHTML = "Loaded"
      + loader.loaderCount + " of " + loader.totalCount;

    if (loader.loaderCount == loader.totalCount) {
      // Loader has loaded completely
      // Reset and clear the loader
      loader.loaded = true;
      loader.loaderCount = 0;
      loader.totalCount = 0;
      game.hideScreen("loadingScreen");
      // and call the loader.onload method if it exists
      if (loader.onload) {
        loader.onload();
        loader.onload = undefined;
      }
    }
  }

}

const mouse = {
  x: 0,
  y: 0,
  down: false,
  dragging: false,

  init:  function () {
    const canvas = document.getElementById("gameCanvas");
    canvas.addEventListener("mousemove", mouse.mouseMoveHandler, false);
    canvas.addEventListener("mousedown", mouse.mouseDownHandler, false);
    canvas.addEventListener("mouseup", mouse.mouseUpHandler, false);
    canvas.addEventListener("mouseout", mouse.mouseUpHandler, false);


  },
  mouseMoveHandler: function (ev) {
    const offset = game.canvas.getBoundingClientRect();
    mouse.x = ev.clientX  - offset.left;
    mouse.y = ev.clientY - offset.top;
    if (mouse.down) {
      mouse.dragging = true;
    }
    ev.preventDefault();
  },
  mouseDownHandler: function (ev) {
    mouse.down = true;
    ev.preventDefault();
  },
  mouseUpHandler: function (ev) {
    mouse.down = false;
    mouse.dragging = false;
    ev.preventDefault();
  }

}

























window.addEventListener("load", function() {
  game.init();
})

