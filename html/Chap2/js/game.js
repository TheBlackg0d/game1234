const game = {
    init : function () {
        // get handler for  game canvas and context
        game.canvas = document.getElementById('gameCanvas');
        game.context = game.canvas.getContext("2d");
        //init levels object
        levels.init();
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
    }
}



const levels = {
    // Level Data
    data: [{ // First Level
        foreground: "desert-forground",
        background: "clouds-background",
        entities: []
    }, { // Second Level
        foreground: "desert-forground",
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
            console.log("Im here");
            button.type = "button";
            button.value =  (1 + i).toString(); // Level labels are 1 and 2
            button.addEventListener("click", buttonClickHandler);

            levelSelectScreen.appendChild(button);
        }

    },
    load: function (number) { //Load all data and images for a specific level

    }
}


// The image loader

const loader = {
    loader: true,
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
            + loader.loaderCount + " of " + loaded.totalCount;


    }

}



























window.addEventListener("load", function() {
    game.init();
})