const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

let clickX = [];
let clickY = [];
let clickDrag = [];
let paint;

let minX, minY, maxX, maxY;

let rectangles = [];

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas

    ctx.strokeStyle = "#df4b26";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;

    drawRectangles();

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

function drawRectangles() {
    for (let i = 0; i < rectangles.length; i++) {
        ctx.fillRect(rectangles[i].x, rectangles[i].y, rectangles[i].width, rectangles[i].height);
    }
}

function onRectangleButtonClick() {
    convertToRectangle();
}

function convertToRectangle() {
    if (!minX || !minY || !maxX || !maxY)
        return;

    rectangles.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

function clearSketchFromCanvas() {
    clickX = [];
    clickY = [];
    clickDrag = [];
    paint = false;
}

function clearTrackedValues() {
    minX = null;
    maxX = null;
    minY = null;
    maxY = null;
}

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);

    minX = minX ? Math.min(minX, x) : x;
    minY = minY ? Math.min(minY, y) : y;
    maxX = maxX ? Math.max(maxX, x) : x;
    maxY = maxY ? Math.max(maxY, y) : y;

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

    clearTrackedValues();

    draw();
}

init();