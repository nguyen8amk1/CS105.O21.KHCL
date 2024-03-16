//Initialize 

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var width = 800;
var height = 600;

var bgRgba = [240, 240, 200, 255];
var pointRgba = [0, 0, 255, 255];
var lineRgba = [0, 0, 0, 255];
var vlineRgba = [255, 0, 0, 255];

canvas.setAttribute("width", width);
canvas.setAttribute("height", height);


const DRAW_LINE = 100;
const DRAW_POINT = 200;
const DRAW_CIRCLE = 300;


let state = 0;

function Painter(context, width, height){
    this.context = context;
    this.imageData = context.createImageData(width, height);
    this.points = [];
    this.now = [-1, -1];
    this.width = width;
    this.height = height;

    this.currentDrawingMode = DRAW_LINE;
    this.drawLineImplementation = ddaDrawLine;

    this.clear = function () {
        console.log("clear");
        this.imageData.data.fill(255);
        this.points = [];

        this.draw();
    }

    this.changeDrawLineImplementation = function (drawLineImplementation) {
        this.drawLineImplementation = drawLineImplementation;
    }

    this.changeDrawingMode = function (mode) {
        this.currentDrawingMode = mode;
    }

    this.getPixelIndex = function(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return -1;
        return (x + y * width) << 2;
    }

    this.setPixel = function(x, y, rgba) {
        const pixelIndex = this.getPixelIndex(x, y);
        if (pixelIndex == -1) return;
        for (var i = 0; i < 4; i++) {
            this.imageData.data[pixelIndex + i] = rgba[i];
        }
    }

    this.drawPoint = function(p, rgba){
        var x = p[0];
        var y = p[1];
        for (var i = -1; i <= 1; i++)
            for (var j = -1; j <= 1; j++)
                this.setPixel(x + i, y + j, rgba);
    }

    this.drawLine = function(p0, p1, rgba) {
        const pixels = this.drawLineImplementation(p0, p1);

        // Set all pixels at once
        if(pixels)
            pixels.forEach(pixel => {
                this.setPixel(pixel[0], pixel[1], rgba);
            });

    }

    this.drawCircle = function(p, r, rgba) {
        // draw a circle using MidPointI
        var x = 0;
        var y = r;
        var P = 1 - r;
        let x0 = p[0];
        let y0 = p[1];

        //console.log(p, r, rgba);
        while (x < y) {
            this.setPixel(x0 + x, y0 + y, rgba);
            this.setPixel(x0 + y, y0 + x, rgba);
            this.setPixel(x0 + y, y0 - x, rgba); 
            this.setPixel(x0 + x, y0 - y, rgba);
            this.setPixel(x0 - x, y0 - y, rgba);
            this.setPixel(x0 - y, y0 - x, rgba);
            this.setPixel(x0 - y, y0 + x, rgba);
            this.setPixel(x0 - x, y0 + y, rgba);
            x++;

            if (P < 0) {
                P += 2*x + 3;
            }
            else {
                y--;
                P += 2*(x - y) + 5;
            }
        }
    }

    this.length = function (p1, p2) {
        // Extract coordinates of each point
        let x1 = p1[0];
        let y1 = p1[1];
        let x2 = p2[0];
        let y2 = p2[1];

        // Calculate the squared differences in coordinates
        let deltaX = x2 - x1;
        let deltaY = y2 - y1;

        // Calculate the square of the Euclidean distance
        let distanceSquared = deltaX * deltaX + deltaY * deltaY;

        // Take the square root to get the final distance
        let distance = Math.floor(Math.sqrt(distanceSquared));

        return distance;

    }

    this.draw = function (p) {
        if(this.points.length < 0) return;
        this.imageData.data.fill(255);

        switch(this.currentDrawingMode) {
            case DRAW_LINE: 
                if(this.points.length > 0 && this.points.length %2 !=0) {
                    this.drawLine(this.points[this.points.length -1], p, [255, 0, 0, 255]);
                }

                for(let i = 0; i < this.points.length-1; i+=2) {
                    this.drawLine(this.points[i], this.points[i+1], [0, 0, 0, 255]);
                }

                break;

            case DRAW_POINT: 
                for(let i = 0; i < this.points.length; i++) {
                    this.drawPoint(this.points[i], [0, 255, 0, 255]);
                }
                break;

            case DRAW_CIRCLE: 
                if(this.points.length > 0 && this.points.length %2 !=0) {
                    this.drawCircle(this.points[this.points.length -1],  this.length(this.points[this.points.length-1], p), [255, 0, 0, 255]);
                }

                for(let i = 0; i < this.points.length-1; i+=2) {
                    this.drawCircle(this.points[i],  this.length(this.points[i], this.points[i+1]), [0, 0, 0, 255]);
                }
                break;
        }

        
        context.putImageData(this.imageData, 0, 0);

    }

    this.addPoint = function (p) {
        // TODO: 
        this.points.push(p);
        console.log("add point: ", this.points);
    }
}

const painter = new Painter(context, width, height);

const getPosOnCanvas = function(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return [Math.floor(x - bbox.left * (canvas.width / bbox.width) + 0.5),
        Math.floor(y - bbox.top * (canvas.height / bbox.height) + 0.5)]; 
}

// State 1 = mouse move 
// State 0, 1 = mouse down
//

const doMouseMove = function(e) {
    //this.now = [e.clientX, e.clientY]; 
    if (state == 0 || state == 2) {
        return;
    }
    var p = getPosOnCanvas(e.clientX, e.clientY);
    painter.draw(p); 
}


const doMouseDown = function(e) {
    if (state == 2 || e.button != 0) {
        return;
    }

    var p = getPosOnCanvas (e.clientX, e.clientY);
    //console.log("mouse down ",  p);
    
    painter.addPoint(p);
    painter.draw(p);

    if (state == 0) {
        state = 1;
        //console.log("state ", state);
    }
}

const doKeyDown = function(e) {
    //console.log("keydown: ", e);

    if (state == 2) {
        return;
    }

    var keyId = e.keyCode ? e.keyCode : e.which;
    if (keyId == 27 && state == 1) { // esc
        state = 2;
        //console.log("state ", state);
        //currentDrawingMode = DRAW_POINT;
        painter.draw(painter.points[painter.points.length - 1]); 
    } // clear red line
}

canvas.addEventListener('mousemove', doMouseMove);
canvas.addEventListener('mousedown', doMouseDown);
document.addEventListener('keydown', doKeyDown);
const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", (event) => {
    // TODO: clear all the states
    painter.clear();

});

const drawSelection = document.getElementById("draw-options");
const title = document.getElementById("title");
console.log(drawSelection);

drawSelection.addEventListener("change", (event) => {
    const selection = event.target.value.substring(
        event.target.selectionStart,
        event.target.selectionEnd,
    );

    switch(selection) {
        case "midpoint": 
            painter.changeDrawingMode(DRAW_CIRCLE);
            title.innerHTML = "Midpoint Algorithm";
            break;
        case "dda": 
            painter.changeDrawingMode(DRAW_LINE);
            painter.changeDrawLineImplementation(ddaDrawLine);
            title.innerHTML = "DDA Algorithm";
            break;
        case "bresenham": 
            painter.changeDrawingMode(DRAW_LINE);
            painter.changeDrawLineImplementation(bresenhamDrawLine);
            title.innerHTML = "Bresenham Algorithm";
            break;
    }

    console.log(`You selected: ${selection}`);
});

