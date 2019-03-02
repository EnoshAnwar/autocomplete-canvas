const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

// free draw on canvas variables
let clickX = [];
let clickY = [];
let clickDrag = [];
let paint;

// tracked values that assist in converting drawing into geometry
let minX, minY, maxX, maxY;
let startX, startY, endX, endY;

// converted geometry to draw
let rectangles = [];
let circles = [];
let lines = [];
let triangles = [];

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas before drawing every frame

    ctx.strokeStyle = '#df4b26';    // stroke color
    ctx.fillStyle = '#df4b26'       // fill color
    ctx.lineJoin = 'round';         // when drawing, make it look "smooth"
    ctx.lineWidth = 5;              // width of lines in pixels

    // draw geometry (when implementing bonus, we will probably have to combine into 1 data structure)
    drawRectangles();
    drawCircles();
    drawLines();
    drawTriangles();

    // draw "free draw" lines (probably dont need to touch this part)
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

// draw all rectangles
function drawRectangles() {
    for (let i = 0; i < rectangles.length; i++) {
        ctx.fillRect(rectangles[i].x, rectangles[i].y, rectangles[i].width, rectangles[i].height);
    }
}

// draw all circles
function drawCircles() {
    for (let i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// draw all lines
function drawLines() {
    for (let i = 0; i < lines.length; i++) {
        ctx.beginPath();
        ctx.moveTo(lines[i].sx, lines[i].sy);
        ctx.lineTo(lines[i].ex, lines[i].ey);
        ctx.stroke();
    }
}

// draw all triangles (only simple triangles supported for now)
function drawTriangles() {
    for (let i = 0; i < triangles.length; i++) {
        ctx.beginPath();
        ctx.moveTo(triangles[i].p1x, triangles[i].p1y);
        ctx.lineTo(triangles[i].p2x, triangles[i].p2y);
        ctx.lineTo(triangles[i].p3x, triangles[i].p3y);
        ctx.lineTo(triangles[i].p1x, triangles[i].p1y);
        ctx.fill();
    }
}

// on clicking the rectangle button, convert current "drawing" to a rectangle
// this function will clear the "drawing" and add a geometry to the rectangles array
function onRectangleButtonClick() {
    if (!minX || !minY || !maxX || !maxY)
        return;

    rectangles.push({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the circle button, convert current "drawing" to a circle
// this function will clear the "drawing" and add a geometry to the circles array
function onCircleButtonClick() {
    if (!minX || !minY || !maxX || !maxY)
        return;

    let r = ((maxX - minX) / 2 + (maxY - minY) / 2) / 2;

    circles.push({
        x: minX + r,
        y: minY + r,
        r,
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the line button, convert current "drawing" to a line
// this function will clear the "drawing" and add a geometry to the lines array
function onLineButtonClick() {
    if (!startX || !startY || !endX || !endY)
        return;

    lines.push({
        sx: startX,
        sy: startY,
        ex: endX,
        ey: endY
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the triangle button, convert current "drawing" to a triangle
// this function will clear the "drawing" and add a geometry to the triangles array
function onTriangleButtonClick() {
    if (!minX || !minY || !maxX || !maxY)
        return;

    triangles.push({
        p1x: minX,
        p1y: maxY,
        p2x: maxX,
        p2y: maxY,
        p3x: minX + ((maxX - minX) / 2),
        p3y: minY
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// clear "drawing" from the canvas
function clearSketchFromCanvas() {
    clickX = [];
    clickY = [];
    clickDrag = [];
    paint = false;
}

// clear tracked values
function clearTrackedValues() {
    minX = null;
    maxX = null;
    minY = null;
    maxY = null;
    startX = null;
    startY = null;
    endX = null;
    endY = null;
}

// add another x,y position to "drawing"
// probably dont need to touch anymore
function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);

    minX = minX ? Math.min(minX, x) : x;
    minY = minY ? Math.min(minY, y) : y;
    maxX = maxX ? Math.max(maxX, x) : x;
    maxY = maxY ? Math.max(maxY, y) : y;
    startX = startX != null ? startX : x;
    startY = startY != null ? startY : y;
    endX = x;
    endY = y;

    clickDrag.push(dragging);
}

// on mouse down update drawing and tracked values
function onMouseDown(e) {
    let mouseX = e.pageX;
    let mouseY = e.pageY;

    paint = true;
    addClick(mouseX, mouseY, false);

    e.preventDefault();
}

// on mouse move update drawing and tracked values
function onMouseMove(e) {
    let mouseX = e.pageX;
    let mouseY = e.pageY;

    if (paint) {
        addClick(mouseX, mouseY, true);
    }
}

// on mouse up, stop drawing
function onMouseUp(e) {
    paint = false;
}

// on mouse up, stop drawing
function onMouseLeave(e) {
    paint = false;
}

// registering mouse events
canvas.onmousedown = onMouseDown;
canvas.onmousemove = onMouseMove;
canvas.onmouseup = onMouseUp;
canvas.onmouseleave = onMouseLeave;

// registering touch events (enable later if necessary)
// canvas.ontouchstart = onMouseDown;
// canvas.ontouchmove = onMouseMove;
// canvas.ontouchend = onMouseUp;
// canvas.ontouchcancel = onMouseLeave;

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    clearTrackedValues();

    draw();
}

init();