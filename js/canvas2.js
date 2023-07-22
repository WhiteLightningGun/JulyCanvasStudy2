let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

window.onload = function () {
    //JS waits for page to load first
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 300
    canvas.height = 300
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, 6/5);

    flowField.staticDraw();
    flowField.animate();
    
}

function reset() {

    const newK = document.getElementById('kRange');
    console.log(`new k value: ${newK.value}`);

    cancelAnimationFrame(flowFieldAnimation);
    canvas.width = 300
    canvas.height = 300
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, newK.value/5);

 
    flowField.staticDraw();
    flowField.animate();
}

class PointCoords{
    x;
    y;
    speed;

    constructor(xA, yA) {
        this.x = xA;
        this.y = yA;
        this.speed = 0;
    }

    rotate(theta, xCentre, yCentre) {
        this.x = Math.cos(theta) * (this.x - xCentre) - Math.sin(theta) * (this.y - yCentre) + xCentre;
        this.y = Math.sin(theta) * (this.x - xCentre) + Math.cos(theta) * (this.y - yCentre) + yCentre;
    }

    //function that accelerates the point in the down direction (positive y) 
}

class FlowFieldEffect {
    //starting field with hash delineates private field, new JS feature...
    #ctx;
    #width;
    #height;

    constructor(ctx, width, height, k) {
        this.#ctx = ctx;
        this.#ctx.strokeStyle = "#FF004010"; //"#FF5500"; FF5500 is hot red
        this.#ctx.lineWidth = 1;
        this.#width = width;
        this.#height = height;
        this.frameNum = 0
        this.widthCentre = width / 2
        this.heightCentre = height / 2;
        this.time = 0;
        this.radius = 4;
        this.kFactor = k; // k factor = 2/3 is an interesting and quick drawing option
        this.thetaIncrement = -0.01; // i.e. speed of rotation

        //initial coordinates for x and y
        this.x = this.#width;
        this.y = this.#height;

        //background colour
        this.#ctx.fillStyle = "#00000080";
        this.#ctx.fillRect(0, 0, 300, 300);

        //pre-compute an array filled with coordinates of figure
        this.coordsArrayN = 500;
        this.coordsArray =  this.#createCoords(); // create function that returns array populated with coordinates of rose according to current value of k


    }

    #createCoords() {
        let arrayResult = [];
        let time = 0;

        let xCoord;
        let yCoord;

        for (let i = 0; i < this.coordsArrayN; i++){

            xCoord = this.#width / 2 + 120 * Math.cos(this.kFactor * time) * Math.cos(time);
            yCoord = this.#height / 2 + 120 * Math.cos(this.kFactor * time) * Math.sin(time);
            let circle = new PointCoords(xCoord, yCoord);

            arrayResult.push(circle);

            time += 0.1;
        }
        return arrayResult;
    }

    staticDraw() {
        //calls the draw function on everything in the coordsArray
        // modify this.radius with a sinusoid? 
        for (let i = 0; i < this.coordsArray.length; i++){
            this.#draw(this.coordsArray[i].x, this.coordsArray[i].y );
        }
    }

    #draw(x, y){
        //draws a single frame of animation effect
        const length = 50;

        //draw line using previous and subsequent coords

        this.#ctx.lineWidth = 15 * Math.pow(Math.cos(0.001 * this.time), 2) + 10;
        this.radius = 2*Math.cos(-0.001 * this.time) + 2.9;

        this.time += 0.03;

        //circles
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        this.#ctx.fillStyle = "#FF5500FF";
        this.#ctx.stroke();
        this.#ctx.fill();
    
    }

    iterDraw(n) { 
        //draws the coordsArray iteratively
        for (let i = 0; i < n; i++){
            this.#draw(this.coordsArray[i].x, this.coordsArray[i].y );
        }
    }

    animate() {
        
        //background
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        this.#ctx.fillStyle = "#00000080";
        this.#ctx.fillRect(0, 0, 300, 300);

        for (let i = 0; i < this.coordsArray.length; i++){
            this.coordsArray[i].rotate(this.thetaIncrement, this.widthCentre, this.heightCentre);
        }

        this.thetaIncrement += 0.00001;

        if (this.frameNum < this.coordsArrayN) {
            this.iterDraw(this.frameNum)
            this.frameNum += 1;
        }
        else {

            this.staticDraw();
        }


        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this)); //animate passes a time stamp implicitly
    }
}