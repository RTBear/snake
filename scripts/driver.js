SnakeGame.main = (function (graphics) {
    //general globals
    var g_highScores = document.getElementById('high-scores');
    var g_newGameBtn = document.getElementById('newgame');
    var g_lastTimeStamp = window.performance.now();
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
    const SPAWN_EDGE_PADDING = 5;
    const INITIAL_WORM_LEN = 1;
    const APPLE_INCR_LEN = 3;
    const NUM_APPLES = 1;
    const MOVE_BUFFER_LEN = 1;

    //gameplay globals
    var SNAKES = []//array of snake objects
    var APPLES = []//array of snake objects
    var GAME_GRID = null



    //directions
    const UP = 'up';
    const RIGHT = 'right';
    const DOWN = 'down';
    const LEFT = 'left';


    var Snake = function (spec) {
        var snake = {};

        console.log(spec)
        console.log(spec.position.x)
        //"getters"
        snake.strokeColor = spec.strokeColor;
        snake.fillColor = spec.fillColor;
        snake.direction = spec.direction;
        snake.moveRate = spec.moveRate;
        snake.recentMoves = [];

        snake.position = {
            x: spec.position.x,
            y: spec.position.y
        }

        //"setters"
        snake.setPositionX = function (pos) { snake.position.x = pos; }
        snake.setPositionY = function (pos) { snake.position.y = pos; }
        snake.setDirection = function (dir) { snake.direction = dir; }
        snake.setRecentMoves = function (dir) {
            snake.recentMoves.push(dir);
            if (snake.recentMoves.length > MOVE_BUFFER_LEN) {
                snake.recentMoves.shift();
            }
        }

        snake.bodySegment = function () {
            return {
                strokeStyle: snake.strokeColor,
                fillStyle: snake.fillColor,
                lineWidth: 3,
                x: snake.position.x,
                y: snake.position.y,
                w: CELL_WIDTH,
                h: CELL_HEIGHT
            }
        }

        snake.carryOver = 0;

        snake.updatePosition = function (expand) {
            // console.log(snake.recentMoves)
            accumTime = (g_elapsedTime + snake.carryOver);
            // console.log('elapsedTime:', g_elapsedTime)
            // console.log('carryover:', snake.carryOver);
            // console.log('accumtime:', accumTime);
            if (accumTime >= snake.moveRate) {
                snake.carryOver -= snake.moveRate;
                if (snake.recentMoves.length > 0) {
                    snake.setDirection(snake.recentMoves[0]);
                    if (snake.recentMoves.length > 1) {
                        snake.recentMoves.shift();
                    }

                    if (snake.direction == UP) {
                        // console.log(snake.position.y - (snake.moveRate * g_elapsedTime))
                        snake.setPositionY(snake.position.y - CELL_SIZE)
                        snake.setPositionX(Math.floor(snake.position.x))
                    } else if (snake.direction == RIGHT) {
                        snake.setPositionX(snake.position.x + CELL_SIZE)
                        snake.setPositionY(Math.floor(snake.position.y))
                    } else if (snake.direction == DOWN) {
                        snake.setPositionY(snake.position.y + CELL_SIZE)
                        snake.setPositionX(Math.floor(snake.position.x))
                    } else if (snake.direction == LEFT) {
                        snake.setPositionX(snake.position.x - CELL_SIZE)
                        snake.setPositionY(Math.floor(snake.position.y))
                    }
                    if (!expand) {
                        //remove tail
                        // snake.tail = null;
                    }
                }
            } else {
                snake.carryOver += g_elapsedTime;
            }
        }
        return snake;
    }

    function clear_game() {
        SNAKES = [];
        window.removeEventListener('keydown', onKeyDown);
    }

    function init() {
        clear_game();
        GAME_GRID = []
        for (i = 0; i < GAME_HEIGHT; i++) {
            var row = [];
            for (j = 0; j < GAME_WIDTH; j++) {
                row.push({ contents: null })
            }
            GAME_GRID.push(row);
        }
        console.log(GAME_GRID)
        p1 = {
            strokeColor: 'rgb(1, 196, 24)',
            fillColor: 'rgb(0, 229, 26)',
            direction: null,
            position: {
                x: 50,//TODO: make this random
                y: 50,//TODO: make this random
            },
            moveRate: 150

        }
        SNAKES.push(Snake(p1))
        // window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(gameLoop);
    }

    function onKeyDown(e) {
        // for (var snake of SNAKES) {
        snake = SNAKES[0];//for testing
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
        // }
    }

    function update() {
        for (var snake of SNAKES) {
            snake.updatePosition();
            // console.log(snake.position)
        }
    }

    function render() {
        graphics.clear();
        // graphics.context.clear()
        // graphics.context.save();

        // graphics.context.strokeStyle = 'rgba(0, 0, 255, 1)';
        // graphics.context.lineWidth = 3;
        // graphics.context.shadowColor = 'rgba(255, 0, 0, 1)';
        // graphics.context.shadowBlur = 10;
        // graphics.context.strokeRect(
        //     graphics.canvas.width / 4 + 0.5, graphics.canvas.height / 4 + 0.5,
        //     graphics.canvas.width / 2, graphics.canvas.height / 2);

        // specExample {
        //     strokeStyle = 'rgba(0, 0, 255, 1)';
        //     fillStyle = 'rgba(0, 0, 255, 1)';
        //     lineWidth = 5;
        //     x = canvas.width / 4 + 0.5;
        //     y = canvas.height / 4 + 0.5;
        //     w = canvas.width / 2;
        //     h = canvas.height / 2;
        // }
        // console.log(SNAKES[0])
        graphics.drawRectangle(SNAKES[0].bodySegment());
        graphics.context.restore();
    }

    function gameLoop() {
        g_elapsedTime = window.performance.now() - g_lastTimeStamp;
        update();
        render();

        g_lastTimeStamp = window.performance.now();
        requestAnimationFrame(gameLoop);
    }

    g_newGameBtn.addEventListener('click', init)
})(SnakeGame.graphics);