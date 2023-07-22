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
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, 5);
    flowField.animate();
    
}

function reset() {

    const newK = document.getElementById('kRange');
    console.log(newK.value);

    cancelAnimationFrame(flowFieldAnimation);
    canvas.width = 300
    canvas.height = 300
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, newK.value/3);

    flowField.animate();
}

class FlowFieldEffect {
    //starting field with hash delineates private field, new JS feature...
    #ctx;
    #width;
    #height;

    constructor(ctx, width, height, k) {
        this.#ctx = ctx;
        this.#ctx.strokeStyle = "#FF550040"; //"#FF5500"; FF5500 is hot red
        this.#ctx.lineWidth = 0;
        this.#width = width;
        this.#height = height;
        this.time = 0;
        this.radius = 3;
        this.kFactor = k; // k factor = 2/3 is an interesting and quick drawing option

        //initial coordinates for x and y
        this.x = this.#width / 2 + 120 * Math.cos(this.kFactor * this.time) * Math.cos(this.time);
        this.y = this.#height / 2 + 120 * Math.cos(this.kFactor * this.time) * Math.sin(this.time);

        //background colour
        this.#ctx.fillStyle = "#00000080";
        this.#ctx.fillRect(0, 0, 300, 300);

        //pre-compute an array filled with coordinates of figure

    }

    #draw(x, y){
        //draws a single frame of animation effect
        const length = 50;

        //draw line using previous and subsequent coords

        //circles
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        this.#ctx.fillStyle = "#FF5500";
        this.#ctx.stroke();
        this.#ctx.fill();
    
    }

    animate() {

        this.time += 0.2; // this is more like step size between points
        //this.#ctx.clearRect(0, 0, this.#width, this.#height);
        this.#draw(
            this.#width / 2 + 120 * Math.cos(this.kFactor * this.time)*Math.cos(this.time) ,
            this.#height / 2 + 120 * Math.cos(this.kFactor * this.time) * Math.sin(this.time),

        );

        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this)); //animate passes a time stamp implicitly
    }
}