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
    const CELL_WIDTH = CANVAS_WIDTH / GAME_WIDTH;
    const CELL_HEIGHT = CANVAS_HEIGHT / GAME_HEIGHT;
    const CELL_SIZE = CELL_WIDTH;//only square game boards allowed for now :)

    //gameplay constants
    const NUM_SNAKES = 1;
    const INITIAL_SNAKE_LEN = 1;
    const APPLE_INCR_LEN = 3;
    const NUM_APPLES = 1;
    const NUM_WALLS = 15;
    const MOVE_BUFFER_LEN = 1;
    const MOVE_SPEED = 1;

    //gameplay globals
    var SNAKES = [];//array of snake objects
    // var APPLES = []//array of apple objects
    var GAME_GRID = null;
    var GAME_OVER = false;
    var HIGH_SCORES = [];

    //directions
    const UP = 'up';
    const RIGHT = 'right';
    const DOWN = 'down';
    const LEFT = 'left';


    var Snake = function (spec) {
        let snake = {};

        console.log('spec', spec)
        console.log(spec.position.x, spec.position.y)
        //"getters"
        snake.strokeColor = spec.strokeColor;
        snake.fillColor = spec.fillColor;
        snake.direction = spec.direction;
        snake.moveRate = spec.moveRate;
        snake.recentMoves = [];
        snake.growCounter = 0; //TODO: I realize now that if this was let growCounter (instead of snake.growCounter) it could be private... then i just return an object with the public variables/functions.
        snake.score = 0;

        snake.position = {//position of HEAD
            x: spec.position.x,
            y: spec.position.y
        }

        snake.body = [];//array of snake segments

        snake.checkNextMove = function (move) {
            // console.log('next: ',GAME_GRID[x][y].content)
            x = move.x;
            y = move.y;
            if (x < 0 || y < 0 || x >= GAME_WIDTH || y >= GAME_HEIGHT || GAME_GRID[x][y].content == 'wall' || GAME_GRID[x][y].content == 'snake') {
                console.log('GAME OVER');
                gameover();
            } else if (GAME_GRID[x][y].content == 'apple') {
                snake.growCounter += APPLE_INCR_LEN;
                snake.score += APPLE_INCR_LEN;

                generateApple();
            }
        }

        //"setters"
        snake.setPositionX = function (pos) {
            let oldPos = snake.position.x;
            snake.position.x = pos;
            let nextMove = { x: snake.position.x, y: snake.position.y };
            snake.checkNextMove(nextMove);
            if (!GAME_OVER) {

                snake.body.push(nextMove);

                // console.log(pos, pos / CELL_SIZE)
                if (snake.growCounter <= 0) {
                    let tail = snake.body[0];
                    // console.log(snake.body);
                    // exit();
                    GAME_GRID[tail.x][tail.y].content = 'empty';
                    snake.body.shift();
                } else if (snake.growCounter > 0) {
                    snake.growCounter--;
                }
                GAME_GRID[snake.position.x][snake.position.y].content = 'snake';
            }

        }
        snake.setPositionY = function (pos) {
            let oldPos = snake.position.y;
            snake.position.y = pos;
            let nextMove = { x: snake.position.x, y: snake.position.y };
            snake.checkNextMove(nextMove);
            if (!GAME_OVER) {

                snake.body.push(nextMove);
                // console.log(pos, pos / CELL_SIZE)
                if (snake.growCounter <= 0) {
                    let tail = snake.body[0];
                    // console.log(snake.body);
                    // exit();
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

        snake.carryOver = 0;
        snake.updatePosition = function () {
            // console.log(snake.recentMoves)
            accumTime = (g_elapsedTime + snake.carryOver);
            // console.log('elapsedTime:', g_elapsedTime)
            // console.log('carryover:', snake.carryOver);
            // console.log('accumtime:', accumTime);
            if (accumTime >= snake.moveRate) {
                snake.carryOver -= snake.moveRate;
                if (snake.recentMoves.length > 0) {
                    // console.log(snake.recentMoves)
                    snake.setDirection(snake.recentMoves.shift());
                    console.log('-------------------------------------------------------------------')
                    console.log(snake.body)
                    // exit()
                } else {
                    // console.log('NOOOOOO');
                }

                if (snake.direction == UP) {
                    // console.log(snake.position.y - (snake.moveRate * g_elapsedTime))
                    snake.setPositionY(snake.position.y - 1)
                    // snake.setPositionX(Math.floor(snake.position.x))
                } else if (snake.direction == RIGHT) {
                    snake.setPositionX(snake.position.x + 1)
                    // snake.setPositionY(Math.floor(snake.position.y))
                } else if (snake.direction == DOWN) {
                    snake.setPositionY(snake.position.y + 1)
                    // snake.setPositionX(Math.floor(snake.position.x))
                } else if (snake.direction == LEFT) {
                    snake.setPositionX(snake.position.x - 1)
                    // snake.setPositionY(Math.floor(snake.position.y))
                }
            } else {
                snake.carryOver += g_elapsedTime;
            }
        }
        return snake;
        // return {
        //     score: score,
        //     setRecentMoves: setRecentMoves,
        //     direction: direction,
        //     updatePosition: updatePosition,
        //     body: body
        // }
    }


    function updateHighScores() {
        for (let snake of SNAKES) {
            console.log(snake)
            HIGH_SCORES.push(snake.score);
        }
        HIGH_SCORES.sort();
        HIGH_SCORES.reverse();
        let highscoresDiv = document.getElementById('high-scores');
        while (highscoresDiv.firstChild) {
            highscoresDiv.removeChild(highscoresDiv.firstChild);
        }
        for (let score of HIGH_SCORES) {
            console.log(score);
            s = document.createElement('li');
            s.appendChild(document.createTextNode('' + score));
            document.getElementById('high-scores').appendChild(s);
        }
    }

    function updateScores() {
        let scoreDiv = document.getElementById('scores');
        for (let snake of SNAKES) {
            scoreDiv.innerHTML = '<p class="text-center">Score: <span id="score">' + snake.score + '</span></p>'
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
        let len = SNAKES.length;
        for (let i = 0; i < len; i++) {
            SNAKES[i] = null;
        }
        SNAKES = null;
        SNAKES = [];

        if (GAME_GRID != null) {
            for (let i = 0; i < GAME_WIDTH; i++) {
                for (let j = 0; j < GAME_HEIGHT; j++) {
                    GAME_GRID[i][j] = null;
                }
                // GAME_GRID[i] = null;
            }
        }

        GAME_GRID = null;
        window.removeEventListener('keydown', onKeyDown);
        GAME_OVER = false;
        let gameoverDiv = document.getElementById('gameover');
        gameoverDiv.classList.add('hidden');
    }


    function init() {
        clear_game();
        let grid_init = [];
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
        // console.log(GAME_GRID)

        //place snake in after shuffle so it easier to keep track of :)
        p1 = {
            strokeColor: 'rgb(1, 196, 24)',//not used
            fillColor: 'rgb(0, 229, 26)',//not used
            direction: null,
            position: {
                x: getRandomInt(GAME_WIDTH),
                y: getRandomInt(GAME_HEIGHT)
            },
            moveRate: 150 / (MOVE_SPEED * 10)

        }
        console.log('gg', GAME_GRID[p1.position.x][p1.position.y])
        //make sure snake is not placed on another object
        if (num_blank_spaces < 1) {
            console.log('Not enough space on board for snake.');
            process.exit();
        }
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
            // let snake = SNAKES[0];//for testing
            // console.log(snake);
            // console.log(snake.direction)
            if (e.keyCode === KeyEvent.DOM_VK_UP && snake.direction != DOWN) {
                // console.log('UP');
                snake.setRecentMoves(UP);
            } else if (e.keyCode === KeyEvent.DOM_VK_RIGHT && snake.direction != LEFT) {
                // console.log('RIGHT');
                snake.setRecentMoves(RIGHT);
            } else if (e.keyCode === KeyEvent.DOM_VK_DOWN && snake.direction != UP) {
                // console.log('DOWN');
                snake.setRecentMoves(DOWN);
            } else if (e.keyCode === KeyEvent.DOM_VK_LEFT && snake.direction != RIGHT) {
                // console.log('LEFT');
                snake.setRecentMoves(LEFT);
            }
        }
    }

    function update() {
        updateScores();
        for (let snake of SNAKES) {
            snake.updatePosition();
        }
    }

    function render() {
        graphics.clear();
        graphics.context.save();
        graphics.drawBoard(GAME_GRID, { w: GAME_WIDTH, h: GAME_HEIGHT }, CELL_SIZE);
        graphics.context.restore();
    }

    function gameLoop() {
        g_elapsedTime = performance.now() - g_lastTimeStamp;
        update();
        render();

        g_lastTimeStamp = performance.now();
        if (!GAME_OVER) {
            requestAnimationFrame(gameLoop);
        }
    }

    g_newGameBtn.addEventListener('click', init)
})(SnakeGame.graphics);