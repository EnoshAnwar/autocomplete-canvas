const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));

const DELETE_SWIPE_DISTANCE = 150;

// free draw on canvas variables
let clickX = [];
let clickY = [];
let clickDrag = [];
let paint;

// tracked values that assist in converting drawing into geometry
let minX, minY, maxX, maxY;
let startX, startY, endX, endY;

// offset to adjust the canvas and drawings
const yOffset = 85; 

// converted geometry to draw
let rectangles = [];
let circles = [];
let lines = [];
let triangles = [];

let currColor = 'black';

let allDrawnShapes = [];
let currShapeIndex = 0;

let isDeleteMode = false;

function changeColor(color) {
    if(isDeleteMode){
        isDeleteMode = false;
        clearTrackedValues();
        clearSketchFromCanvas();
    }

    ctx.strokeStyle = color;
    currColor = color;
}

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clears the canvas before drawing every frame

    ctx.lineJoin = 'round';         // when drawing, make it look "smooth"
    ctx.lineWidth = 5;              // width of lines in pixels

    // draw geometry (when implementing bonus, we will probably have to combine into 1 data structure)
    // drawRectangles();
    // drawCircles();
    // drawLines();
    // drawTriangles();
    
    drawShapes();
    drawShapeSelection();

    ctx.strokeStyle = currColor;

    // draw "free draw" lines (probably dont need to touch this part)
    for (var i = 0; i < clickX.length && !isDeleteMode; i++) {
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

function drawShapeSelection(){
    if(isDeleteMode && allDrawnShapes.length > 0){
        console.log(currShapeIndex);
        const selectedShape = allDrawnShapes[currShapeIndex];
        selectedShape.data.selected = true;
        selectedShape.drawFunc(selectedShape.data);
    }
}

function drawShapes(){
    for (let shape of allDrawnShapes) {
        shape.drawFunc(shape.data);
    }
}

// sets the size of the canvas based on the screen size
function setCanvasSize() {
    ctx.canvas.width = window.innerWidth / 1.01;
    ctx.canvas.height = window.innerHeight / 1.4;
}

// draw all rectangles
function drawRectangles() {
    for (let i = 0; i < rectangles.length; i++) {
        ctx.fillStyle = rectangles[i].color;
        ctx.fillRect(rectangles[i].x, rectangles[i].y, rectangles[i].width, rectangles[i].height);
    }
}

function drawRectangle(rectangle) {
    ctx.fillStyle = rectangle.color;

    if(isDeleteMode && rectangle.selected){
        ctx.strokeStyle = "#FF0000";
        ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }else{
        ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
}

// draw all circles
function drawCircles() {
    for (let i = 0; i < circles.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = circles[i].color;
        ctx.arc(circles[i].x, circles[i].y, circles[i].r, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// draw a circle
function drawCircle(circle) {
    ctx.beginPath();
    ctx.fillStyle = circle.color;
    ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    ctx.fill();
}

// draw all lines
function drawLines() {
    for (let i = 0; i < lines.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = lines[i].color;
        ctx.moveTo(lines[i].sx, lines[i].sy);
        ctx.lineTo(lines[i].ex, lines[i].ey);
        ctx.stroke();
    }
}

// draw a line
function drawLine(line) {
    ctx.beginPath();
    ctx.strokeStyle = line.color;
    ctx.moveTo(line.sx, line.sy);
    ctx.lineTo(line.ex, line.ey);
    ctx.stroke();
}

// draw all triangles (only simple triangles supported for now)
function drawTriangles() {
    for (let i = 0; i < triangles.length; i++) {
        ctx.beginPath();
        ctx.fillStyle = triangles[i].color;
        ctx.moveTo(triangles[i].p1x, triangles[i].p1y);
        ctx.lineTo(triangles[i].p2x, triangles[i].p2y);
        ctx.lineTo(triangles[i].p3x, triangles[i].p3y);
        ctx.lineTo(triangles[i].p1x, triangles[i].p1y);
        ctx.fill();
    }
}

// draw a triangle
function drawTriangle(triangle) {
    ctx.beginPath();
    ctx.fillStyle = triangle.color;
    ctx.moveTo(triangle.p1x, triangle.p1y);
    ctx.lineTo(triangle.p2x, triangle.p2y);
    ctx.lineTo(triangle.p3x, triangle.p3y);
    ctx.lineTo(triangle.p1x, triangle.p1y);
    ctx.fill();
}

function onDeleteButtonClick() {
    isDeleteMode = true;
}

// on clicking the rectangle button, convert current "drawing" to a rectangle
// this function will clear the "drawing" and add a geometry to the rectangles array
function onRectangleButtonClick() {
    if(isDeleteMode){
        isDeleteMode = false;
        clearTrackedValues();
        clearSketchFromCanvas();
    }

    if (!minX || !minY || !maxX || !maxY)
        return;

    // rectangles.push({
    //     shape: 'rectangle',
    //     x: minX,
    //     y: minY,
    //     width: maxX - minX,
    //     height: maxY - minY,
    //     color: currColor
    // });

    allDrawnShapes.push({
            drawFunc: drawRectangle,
            data: {
                shape: 'rectangle',
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                color: currColor,
                selected: false
            }
    });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the circle button, convert current "drawing" to a circle
// this function will clear the "drawing" and add a geometry to the circles array
function onCircleButtonClick() {
    if(isDeleteMode){
        isDeleteMode = false;
        clearTrackedValues();
        clearSketchFromCanvas();
    }

    if (!minX || !minY || !maxX || !maxY)
        return;

    let r = ((maxX - minX) / 2 + (maxY - minY) / 2) / 2;

    // circles.push({
    //     x: minX + r,
    //     y: minY + r,
    //     r,
    //     color: currColor
    // });

    allDrawnShapes.push(
        {
            drawFunc: drawCircle,
            data: {
                x: minX + r,
                y: minY + r,
                r,
                color: currColor,
                selected: false
            }
        });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the line button, convert current "drawing" to a line
// this function will clear the "drawing" and add a geometry to the lines array
function onLineButtonClick() {
    if(isDeleteMode){
        isDeleteMode = false;
        clearTrackedValues();
        clearSketchFromCanvas();
    }

    if (!startX || !startY || !endX || !endY)
        return;

    // lines.push({
    //     sx: startX,
    //     sy: startY,
    //     ex: endX,
    //     ey: endY,
    //     color: currColor
    // });

    allDrawnShapes.push(
        {
            drawFunc: drawLine,
            data: {
                sx: startX,
                sy: startY,
                ex: endX,
                ey: endY,
                color: currColor,
                selected: false
            }
        });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// on clicking the triangle button, convert current "drawing" to a triangle
// this function will clear the "drawing" and add a geometry to the triangles array
function onTriangleButtonClick() {
    if(isDeleteMode){
        isDeleteMode = false;
        clearTrackedValues();
        clearSketchFromCanvas();
    }

    if (!minX || !minY || !maxX || !maxY)
        return;

    // triangles.push({
    //     p1x: minX,
    //     p1y: maxY,
    //     p2x: maxX,
    //     p2y: maxY,
    //     p3x: minX + ((maxX - minX) / 2),
    //     p3y: minY,
    //     color: currColor
    // });

    allDrawnShapes.push(
        {
            drawFunc: drawTriangle,
            data: {
                p1x: minX,
                p1y: maxY,
                p2x: maxX,
                p2y: maxY,
                p3x: minX + ((maxX - minX) / 2),
                p3y: minY,
                color: currColor,
                selected: false
            }
        });

    clearTrackedValues();

    clearSketchFromCanvas();
}

// clear canvas on click
function onClearButtonClick() {
    isDeleteMode = false;
    clearSketchFromCanvas()
    clearTrackedValues();
    allDrawnShapes = [];
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
    y = y - yOffset;

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
    if(isDeleteMode)
        deleteModeController();
    paint = false;
}

function deleteModeController(){
    if(allDrawnShapes.length > 0){
        const lastShapeIndex = allDrawnShapes.length - 1;
        allDrawnShapes[currShapeIndex].data.selected = false;

        if(isSwipeVertical()){
            allDrawnShapes.splice(currShapeIndex, 1);
            if(currShapeIndex > 0) currShapeIndex--;
        } else if(isSwipeRight()){
            if(currShapeIndex != lastShapeIndex)
                currShapeIndex++;
            else 
                currShapeIndex = 0;  
        } else if(isSwipeLeft()){
            if(currShapeIndex != 0)
                currShapeIndex--;
            else 
                currShapeIndex = lastShapeIndex;  
        } 
        
        clearTrackedValues();
        clearSketchFromCanvas();
    }
}

function isSwipeVertical() {
    let prevY = clickY[0];
    let currY = clickY[clickY.length - 1];

    console.log(prevY);
    console.log(currY);

    if(Math.abs(currY - prevY) >= DELETE_SWIPE_DISTANCE)
        return true;

    return false;
}

function isSwipeRight(){
    let prevX = clickX[0];
    let currX = clickX[clickX.length - 1];

    if(currX > prevX)
        return true;

    return false;
}

function isSwipeLeft(){
    let prevX = clickX[0];
    let currX = clickX[clickX.length - 1];

    if(currX < prevX)
        return true;

    return false;
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
    setCanvasSize();
    clearTrackedValues();

    draw();
}

// Set up for touch events
canvas.addEventListener("touchstart", (e) => {
    mousePos = getTouchPos(canvas, e);
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchend", (e) => {
    const mouseEvent = new MouseEvent("mouseup", {});
    canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
    const rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}


// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", (e) => {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

document.body.addEventListener("touchend", (e) => {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

document.body.addEventListener("touchmove", (e) => {
    if (e.target == canvas) {
        e.preventDefault();
    }
}, false);

init();
