/* game parameters
*
* @Box.ay: how fast box falls
* @Box.jump: how high box jumps
* @Block.vx: how fast blocks move
* @b1_start, b2_start, b_during_start: distance between blocks
*
*/

/* class */
class Box {
    constructor() {
        this.x = canvas.width * 0.2; // start point x, top left point
        this.y = canvas.height * 0.3;
        this.edge = 40;
        this.brx = this.x + this.edge; // bottom right point x
        this.bry = this.y + this.edge;
        this.vy = 0; // vertical moving velocity
        this.ay = .25; // acceleration
        this.jump = -4.5; // velocity when jump
    }
}

class Block { // Block instance is a vertical set of blocks
    constructor() {
        this.x = '';
        this.y = 10; // top block start point (regardless holes)
        this.edge = 40;
        this.rx = this.x + this.edge; // right bound x
        this.gap = 10;
        this.count = 8; // based on canvas height and block edge
        this.isNew = true; // whether to rand new holes
        this.vx = -2.2; // horizontal moving velocity
        this.holeIndex = ''; // start index of 1st hole
        this.holeUpper = ''; // upper bound of hole area
        this.holeLower = '';
    }
    makeHoles() {
        this.holeIndex = Math.floor(Math.random() * (this.count - 3)) + 1;
    }
    computeBound() { // compute hole area upper bound and lower bound
        this.holeUpper = this.y + this.edge * this.holeIndex + this.gap * (this.holeIndex - 1);
        this.holeLower = this.holeUpper + 2 * this.edge + 3 * this.gap;
    }
}


/* variables */
const canvas = document.getElementById('main'),
      ctx = canvas.getContext('2d'),
      b1_start = canvas.width * 1.5;
      b2_start = canvas.width * 2.25;
      b_during_start = canvas.width * 1.4; // both blocks' start position after first round

let raf, // id of animation request
    score = 0,
    isEnd = false, // whether to play ending animation
    hero = new Box(),
    b1 = new Block(),
    b2 = new Block();


/* function */
function init() {
    // reset data
    hero.y = canvas.height * 0.3;
    hero.vy = 0;
    b1.x = b1_start;
    b1.isNew = true;
    b2.x = b2_start;
    b2.isNew = true;
    score = 0;
    isEnd = false;
    game();
}

function game() {
    // core of animation, default about 60 fps
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(game);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw all parts
    initBlock(b1);
    initBlock(b2);
    drawBrid();
    drawScore();
    // where game end
    if (isCollision(b1) || isCollision(b2)) { // box crashes into the block
        if (!isEnd) { // box fall from where it crashes
            hero.vy = 0;
        }
        isEnd = true;
    }
    if (isInvisible()) { // box out of view, start new game
        init();
    }
}

function drawScore() {
    ctx.fillStyle = 'salmon';
    ctx.font = '24px sans-serif';
    ctx.fillText(score, 10, 30);
}

function drawBrid() {
    ctx.lineWidth = 2.5;
    ctx.strokeRect(hero.x, hero.y, hero.edge, hero.edge);
    ctx.fillStyle = 'orange';
    ctx.fillRect(hero.x + 2, hero.y + 2, hero.edge - 4, hero.edge - 4);
    // box is always falling, simulate gravity acceleration
    hero.vy += hero.ay;
    hero.y += hero.vy;
    hero.bry = hero.y + hero.edge;
}

function initBlock(block) {
    if (block.x <= canvas.width) { // enter canvas
        if (block.isNew) { // generate the hole
            block.isNew = false;
            block.makeHoles();
            block.computeBound();
            score++;
        }
        drawBlock(block);
    }
    if (block.x + block.edge < 0) { // out of canvas
        block.x = b_during_start; // where new round of block starts
        block.isNew = true;
    }
    if (!isEnd) { // if game doesn't end, block always moves left
        block.x += block.vx;
        block.rx = block.x + block.edge;
    }
}

function drawBlock(block) {
    ctx.fillStyle = 'lime';
    for (let i = 0; i < block.count; i++) { // only draw non-hole blocks
        if (i !== block.holeIndex && i !== block.holeIndex + 1) {
            let cy = block.y + i * (block.edge + block.gap); // current block position y
            ctx.strokeRect(block.x, cy, block.edge, block.edge);
            ctx.fillRect(block.x + 2, cy + 2, block.edge - 4, block.edge - 4);
        }
    }
}

function isInvisible() {
    return hero.bry < -10 || hero.y > canvas.height + 20;
}

function isCollision(block) {
    if (hero.brx >= block.x && hero.x <= block.rx) { // only verify when box into the vertical block area
        return hero.y <= block.holeUpper || hero.bry >= block.holeLower;
    }
}

function jump(e) {
    if ((e.type === 'click' || e.code === 'Space') && !isEnd) {
        hero.vy = hero.jump;
    }
}


/* event listener */
canvas.onclick = jump;
window.onkeyup = jump;
window.onload = init;
