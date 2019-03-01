const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

let clickX = [];
let clickY = [];
let clickDrag = [];
let paint;

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas

    ctx.strokeStyle = "#df4b26";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    for (var i = 0; i < clickX.length; i++) {
        ctx.beginPath();
        if (clickDrag[i] && i) {
            ctx.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            ctx.moveTo(clickX[i] - 1, clickY[i]);
        }
        ctx.lineTo(clickX[i], clickY[i]);
        ctx.closePath();
        ctx.stroke();
    }
}

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}

canvas.onmousedown = (e) => {
    let mouseX = e.pageX;
    let mouseY = e.pageY;

    paint = true;
    addClick(mouseX, mouseY, false);
}

canvas.onmousemove = (e) => {
    let mouseX = e.pageX;
    let mouseY = e.pageY;

    if (paint) {
        addClick(mouseX, mouseY, true);
    }
}

canvas.onmouseup = (e) => {
    paint = false;
}

canvas.onmouseleave = (e) => {
    paint = false;
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    draw();
}

init();