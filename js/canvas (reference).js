let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

window.onload = function () {
    //JS waits for page to load first
    canvas = document.getElementById('canvas1');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
    
}

window.addEventListener('resize', function () {
    cancelAnimationFrame(flowFieldAnimation);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
});

const mouse = {
    x: 0,
    y: 0,
}

window.addEventListener('mousemove', function (e){
    mouse.x = e.x;
    mouse.y = e.y;
})

class FlowFieldEffect {
    //starting field with hash delineates private field, new JS feature...
    #ctx;
    #width;
    #height;

    constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#ctx.strokeStyle = "red";
        this.#ctx.lineWidth = 5;
        this.#width = width;
        this.#height = height;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.lastTime = 0;
        this.interval = 1000/60;
        this.timer = 0;

    }

    #draw(x, y){
        //draws a single frame of animation effect
        const length = 50;
        this.#ctx.beginPath();
        this.#ctx.moveTo(x, y); // moveTo specifies initial x,y coords
        this.#ctx.lineTo(mouse.x, mouse.y);
        this.#ctx.stroke();
    }

    animate(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (this.timer > this.interval)
        {
            this.angle += 0.1;
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            this.#draw(this.#width / 2, this.#height / 2);
            this.timer = 0;
        }
        else
        {
            this.timer += deltaTime;
        }

        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this)); //animate passes a time stamp implicitly
    }
}