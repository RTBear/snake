//a snake game by Ryan Mecham
SnakeGame.main = (function (graphics) {
    //general globals
    var g_newGameBtn = document.getElementById('newgame');
    var g_lastTimeStamp = performance.now();
    var g_elapsedTime = 0;

    //board constants
    const GAME_WIDTH = 50;
    const GAME_HEIGHT = 50;
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const CELL_WIDTH = CANVAS_WIDTH / GAME_WIDTH;//for use if using non-square gameboard
    const CELL_HEIGHT = CANVAS_HEIGHT / GAME_HEIGHT;//for use if using non-square gameboard
    const CELL_SIZE = CELL_WIDTH;//only square game boards allowed for now :)

    //gameplay constants
    const NUM_SNAKES = 1;
    const INITIAL_SNAKE_LEN = 1;
    const APPLE_INCR_LEN = 3;
    const NUM_APPLES = 1;
    const NUM_WALLS = 15;
    const MOVE_BUFFER_LEN = 1;
    const MOVE_SPEED = 1;
    const MS_PER_MOVE = 150;

    //gameplay globals
    var SNAKES = [];//array of snake objects
    var GAME_GRID = null;//data structure for game board
    var GAME_OVER = false;
    var HIGH_SCORES = [];
    
    //directions
    const UP = 'up';
    const RIGHT = 'right';
    const DOWN = 'down';
    const LEFT = 'left';
    
    
    var Snake = function (spec) {
        let snake = {};
        
        snake.strokeColor = spec.strokeColor;
        snake.fillColor = spec.fillColor;

        snake.direction = spec.direction;
        snake.moveRate = spec.moveRate;
        snake.carryOver = 0;
        snake.recentMoves = [];
        snake.growCounter = 0; //TODO: This could be private if I changed how I use the Snake "class"/function
        snake.score = 0;

        snake.body = [];//array of snake segments
        snake.position = {//position of HEAD
            x: spec.position.x,
            y: spec.position.y
        }


        snake.checkNextMove = function (move) {
            x = move.x;
            y = move.y;
            if (x < 0 || y < 0 || x >= GAME_WIDTH || y >= GAME_HEIGHT || GAME_GRID[x][y].content == 'wall' || GAME_GRID[x][y].content == 'snake') {
                gameover();
            } else if (GAME_GRID[x][y].content == 'apple') {
                snake.growCounter += APPLE_INCR_LEN;
                snake.score += APPLE_INCR_LEN;

                generateApple();
            }
        }

        snake.setPositionX = function (pos) {
            snake.position.x = pos;
            let nextMove = { x: snake.position.x, y: snake.position.y };
            snake.checkNextMove(nextMove);
            if (!GAME_OVER) {

                snake.body.push(nextMove);

                if (snake.growCounter <= 0) {
                    let tail = snake.body[0];
                    GAME_GRID[tail.x][tail.y].content = 'empty';
                    snake.body.shift();
                } else if (snake.growCounter > 0) {
                    snake.growCounter--;
                }
                GAME_GRID[snake.position.x][snake.position.y].content = 'snake';
            }

        }
        snake.setPositionY = function (pos) {
            snake.position.y = pos;
            let nextMove = { x: snake.position.x, y: snake.position.y };
            snake.checkNextMove(nextMove);
            if (!GAME_OVER) {

                snake.body.push(nextMove);
                if (snake.growCounter <= 0) {
                    let tail = snake.body[0];
                    GAME_GRID[tail.x][tail.y].content = 'empty';
                    snake.body.shift();
                } else if (snake.growCounter > 0) {
                    snake.growCounter--;
                }
                GAME_GRID[snake.position.x][snake.position.y].content = 'snake';
            }
        }

        snake.setDirection = function (dir) { snake.direction = dir; }

        snake.setRecentMoves = function (dir) {
            snake.recentMoves.push(dir);
            if (snake.recentMoves.length > MOVE_BUFFER_LEN) {
                snake.recentMoves.shift();
            }
        }

        snake.updatePosition = function () {
            let accumTime = (g_elapsedTime + snake.carryOver);
            if (accumTime >= snake.moveRate) {
                snake.carryOver -= snake.moveRate;

                if (snake.recentMoves.length > 0) {
                    snake.setDirection(snake.recentMoves.shift());
                }

                if (snake.direction == UP) {
                    snake.setPositionY(snake.position.y - 1)
                } else if (snake.direction == RIGHT) {
                    snake.setPositionX(snake.position.x + 1)
                } else if (snake.direction == DOWN) {
                    snake.setPositionY(snake.position.y + 1)
                } else if (snake.direction == LEFT) {
                    snake.setPositionX(snake.position.x - 1)
                }
                last_move = performance.now();
            } else {
                snake.carryOver += g_elapsedTime;
            }
        }
        return snake;
    }


    function updateHighScores() {
        for (let snake of SNAKES) {
            HIGH_SCORES.push(snake.score);
        }
        HIGH_SCORES.sort(function (a, b) { return a - b; });//default sort is alphabetical
        HIGH_SCORES.reverse();
        let highscoresDiv = document.getElementById('high-scores');
        while (highscoresDiv.firstChild) {
            highscoresDiv.removeChild(highscoresDiv.firstChild);
        }
        for (let score of HIGH_SCORES) {
            s = document.createElement('li');
            s.appendChild(document.createTextNode('' + score));
            document.getElementById('high-scores').appendChild(s);
        }
    }

    function updateScores() {
        let scoreDiv = document.getElementById('scores');
        for (let snake of SNAKES) {
            scoreDiv.innerHTML = '<p class="text-center">Current Score: <span id="score">' + snake.score + '</span></p>'
        }
    }

    //array shuffle from stack overflow (https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
    function arrayShuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    //from the mdn docs (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    function gameover() {
        GAME_OVER = true;
        let gameoverDiv = document.getElementById('gameover');
        gameoverDiv.classList.remove('hidden');
        updateHighScores();
    }

    function generateApple() {
        let x = getRandomInt(GAME_WIDTH);
        let y = getRandomInt(GAME_HEIGHT);

        let insert_tolerance = 15;
        while (GAME_GRID[x][y].content != 'empty') {
            x = getRandomInt(GAME_WIDTH);
            y = getRandomInt(GAME_HEIGHT);
            insert_tolerance--;

            if (insert_tolerance < 1) {//place in first open space
                console.log('Unable to find random available space.')
                for (let i = 0; i < GAME_WIDTH; i++) {
                    for (let j = 0; j < GAME_HEIGHT; j++) {
                        if (GAME_GRID[i][j].content === 'empty') {
                            x = i;
                            y = j;
                        }
                    }
                }
            }
        }
        GAME_GRID[x][y].content = 'apple';
    }

    function clear_game() {
        SNAKES = null;
        GAME_GRID = null;
        window.removeEventListener('keydown', onKeyDown);
        GAME_OVER = false;
        let gameoverDiv = document.getElementById('gameover');
        gameoverDiv.classList.add('hidden');
    }


    function init() {
        clear_game();
        let grid_init = [];
        SNAKES = [];
        GAME_GRID = [];
        let num_blank_spaces = (GAME_HEIGHT * GAME_WIDTH) - NUM_APPLES - NUM_WALLS;//not factoring in snake len because I will add these in after shuffle
        for (let i = 0; i < num_blank_spaces; i++) {
            grid_init.push({ content: 'empty' });
        }
        for (let i = 0; i < NUM_APPLES; i++) {
            grid_init.push({ content: 'apple' });
        }
        for (let i = 0; i < NUM_WALLS; i++) {
            grid_init.push({ content: 'wall' });
        }
        //shuffle what I have so far
        let grid_init_s = arrayShuffle(grid_init);
        grid_init = null

        for (let i = 0; i < GAME_HEIGHT; i++) {
            let row = [];
            for (let j = 0; j < GAME_WIDTH; j++) {
                row.push(grid_init_s.shift());
            }
            GAME_GRID.push(row);
        }
        grid_init_s = null;

        //place snake in after shuffle so it easier to keep track of :)
        p1 = {
            strokeColor: 'rgb(1, 196, 24)',//not used
            fillColor: 'rgb(0, 229, 26)',//not used
            direction: null,//initialize snake direction to null to force player input starting snake movement
            position: {
                x: getRandomInt(GAME_WIDTH),
                y: getRandomInt(GAME_HEIGHT)
            },
            moveRate: MS_PER_MOVE / MOVE_SPEED // 150/speed milliseconds between movements

        }
        //make sure there is a space for the snake
        if (num_blank_spaces < 1) {
            console.log('Not enough space on board for snake.');
            process.exit();
        }
        //make sure snake is not placed on another object
        let insert_tolerance = 15;
        while (GAME_GRID[p1.position.x][p1.position.y].content != 'empty') {
            p1.position.x = getRandomInt(GAME_WIDTH);
            p1.position.y = getRandomInt(GAME_HEIGHT);
            insert_tolerance--;

            if (insert_tolerance < 1) {//place in first open space
                console.log('Unable to find random available space.')
                for (let i = 0; i < GAME_WIDTH; i++) {
                    for (let j = 0; j < GAME_HEIGHT; j++) {
                        if (GAME_GRID[i][j].content === 'empty') {
                            p1.position.x = i;
                            p1.position.y = j;
                        }
                    }
                }
            }
        }

        GAME_GRID[p1.position.x][p1.position.y].content = 'snake';
        SNAKES.push(Snake(p1));
        SNAKES[0].body.push({ x: p1.position.x, y: p1.position.y });
        p1 = null;
        window.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(gameLoop);
    }

    function onKeyDown(e) {
        for (let snake of SNAKES) {
            if (e.keyCode === KeyEvent.DOM_VK_UP && snake.direction != DOWN) {
                snake.setRecentMoves(UP);
            } else if (e.keyCode === KeyEvent.DOM_VK_RIGHT && snake.direction != LEFT) {
                snake.setRecentMoves(RIGHT);
            } else if (e.keyCode === KeyEvent.DOM_VK_DOWN && snake.direction != UP) {
                snake.setRecentMoves(DOWN);
            } else if (e.keyCode === KeyEvent.DOM_VK_LEFT && snake.direction != RIGHT) {
                snake.setRecentMoves(LEFT);
            }
        }
    }

    function update() {
        for (let snake of SNAKES) {
            snake.updatePosition();
        }
        updateScores();
    }

    function render() {
        graphics.clear();
        graphics.context.save();
        graphics.drawBoard(GAME_GRID, { w: GAME_WIDTH, h: GAME_HEIGHT }, CELL_SIZE);
        graphics.context.restore();
    }

    function gameLoop(timestamp) {
        if (!GAME_OVER) {
            g_elapsedTime = timestamp - g_lastTimeStamp;
            update();
            render();

            g_lastTimeStamp = timestamp;
            requestAnimationFrame(gameLoop);
        }
    }

    g_newGameBtn.addEventListener('click', init)
})(SnakeGame.graphics);