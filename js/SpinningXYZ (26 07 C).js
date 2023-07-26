let canvas;
let ctx;
let flowField;
let visualiserAnimation;

window.onload = function () {
    //JS waits for page to load first
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 300
    canvas.height = 300

    //create function to generate a CubeModel
    let CubeModel = CreateCube(150);
    
    visualiserField = new VisualiserAnimation(ctx, canvas.width, canvas.height, CubeModel);
    visualiserField.animate();
    
}

function reset() {

    cancelAnimationFrame(visualiserAnimation);
    canvas.width = 300
    canvas.height = 300

    let TriangleModel = CreateTriangle(canvas.width, canvas.height);

    visualiserField = new VisualiserAnimation(ctx, canvas.width, canvas.height, TriangleModel);
    visualiserField.animate();
}

class PointCoordsNode{
    x;
    y;
    z;
    nodeLinkArray;

    xOriginal;
    yOriginal;
    zOriginal;

    thetaCount;
    phiCount;
    psiCount;
    
    decimals;

    cosResult;
    sinResult;

    constructor(xA, yA, zA, nodelinks = []) {
        this.x = xA;
        this.y = yA;
        this.z = zA;

        this.xOriginal = xA;
        this.yOriginal = yA;
        this.zOriginal = zA;

        this.isActive = true;
        this.nodeLinkArray = nodelinks; //empty by default

        this.thetaCount = 0; 
        this.phiCount = 0;
        this.psiCount = 0;
        this.decimals = 10;
        this.cosResultTheta = 0;
        this.sinResultTheta = 0;
        this.cosResultPhi = 0;
        this.sinResultPhi = 0;
        this.cosResultPsi = 0;
        this.sinResultPsi = 0;

    }

    //create generalised rotation function that takes 3 arguments and then uses these to sequentially modify the original coordinates within a domain of 0 - 2PI

    rotateZ(theta, xCentre, yCentre) { //rotates around the z-axis
        this.thetaCount += theta;

        if (Math.abs(this.thetaCount) < 6.283) {

            this.cosResultTheta = Math.cos(this.thetaCount)
            this.sinResultTheta = Math.sin(this.thetaCount)

            this.x = this.cosResultTheta * (this.xOriginal - xCentre) - this.sinResultTheta * (this.yOriginal - yCentre) + xCentre;
            this.y = this.sinResultTheta * (this.xOriginal - xCentre) + this.cosResultTheta * (this.yOriginal - yCentre) + yCentre;
        }
        else {
            this.thetaCount = 0;

            this.cosResultTheta = Math.cos(this.thetaCount)
            this.sinResultTheta = Math.sin(this.thetaCount)

            this.x = this.cosResultTheta * (this.xOriginal - xCentre) - this.sinResultTheta * (this.yOriginal - yCentre) + xCentre;
            this.y = this.sinResultTheta * (this.xOriginal - xCentre) + this.cosResultTheta * (this.yOriginal - yCentre) + yCentre;
        }

    }

    rotateY(phi, xCentre, zCentre) { // rotates around y-axis, obviously zCentre here will always be zero, but is provided for completeness
        this.phiCount += phi;

        if (Math.abs(this.phiCount) < 6.283) {

            this.cosResultPhi = Math.cos(this.phiCount)
            this.sinResultPhi = Math.sin(this.phiCount)

            this.x = this.cosResultPhi * (this.xOriginal - xCentre) + this.sinResultPhi * (this.zOriginal - zCentre) + xCentre;
            this.z = -this.sinResultPhi * (this.xOriginal - xCentre) + 0 + this.cosResultPhi * (this.zOriginal - zCentre) + zCentre;
        }
        else {
            this.phiCount = 0;

            this.cosResultPhi = Math.cos(this.phiCount)
            this.sinResultPhi = Math.sin(this.phiCount)

            this.x = this.cosResultPhi * (this.xOriginal - xCentre) + this.sinResultPhi * (this.zOriginal - zCentre) + xCentre;
            this.z = -this.sinResultPhi * (this.xOriginal - xCentre) + 0 + this.cosResultPhi * (this.zOriginal - zCentre) + zCentre;
            
        }
    }

    rotateX(psi, yCentre, zCentre) { // rotates around x-axis, zCentre will always be zero, but is provided for completeness
        this.psiCount += psi;

        this.cosResult = Math.cos(psi)
        this.sinResult = Math.sin(psi)

        this.y = 0 + Math.cos(psi) * (this.y - yCentre) - Math.sin(psi) * (this.z - zCentre) + yCentre;
        this.z = 0 + Math.sin(psi) * (this.y - yCentre) + Math.cos(psi) * (this.z - zCentre) + zCentre;
        
    }
}

class VisualiserAnimation {
    //starting field with hash delineates private field, new JS feature...
    #ctx;
    #width;
    #height;
    ModelMesh;

    constructor(ctx, width, height, meshArgument) {
        this.#ctx = ctx;
        this.#ctx.strokeStyle = "#FF400030"; //"#FF5500"; FF5500 is hot red
        this.#ctx.lineWidth = 1;
        this.#width = width;
        this.#height = height;
        this.ModelMesh = meshArgument;
        this.frameNum = 0
        this.widthCentre = width / 2
        this.heightCentre = height / 2;
        this.time = 0;
        this.radius = 5;
        this.thetaIncrement = -0.01; // i.e. speed of rotation, don't change this until I have made pi/2 detection more robust
        this.theta = 0;
        this.cameraLocation = [150, 150, 500];
        this.focalLength = 300; //focal length, vaguely analogous to zoom
        this.zO = 4; //focus...
        this.zPrime = this.focalLength + this.zO;


        //initial coordinates for x and y
        this.x = this.#width;
        this.y = this.#height;

        //background colour
        this.#ctx.fillStyle = "#00000080";
        this.#ctx.fillRect(0, 0, 300, 300);

       

    }

    #drawMesh() {
        //iterates through mesh data structure and

        //perspective pass should happen here

        for (let i = 0; i < this.ModelMesh.length; i++){
            this.#drawVertex(this.ModelMesh[i].x, this.ModelMesh[i].y, this.ModelMesh[i].z);
            this.#drawConnections(this.ModelMesh[i]);
        }
        
    }

    #coordProjectToScreen(x, y, z)
    {
        // Orthographic projection calls should be distentangled from vertex drawing
        // See the perspective model.jpg for details

        let xR = x - this.cameraLocation[0]; //xR means x Relative to camera location
        let yR = y - this.cameraLocation[1];
        let zR = z - this.cameraLocation[2];

        let u = -this.zPrime * xR / zR + this.zPrime * xR / Math.pow(zR, 2) + this.widthCentre; // second order taylor series
        let v = -this.zPrime * yR / zR + this.zPrime * yR / Math.pow(zR, 2) + this.heightCentre;

        return [u, v]
    }

    #drawVertex(x, y, z){
        //draws a single frame of animation effect

        let uv = this.#coordProjectToScreen(x, y, z);

        //circles
        this.#ctx.beginPath();
        this.#ctx.arc(uv[0], uv[1], this.radius, 0, 2 * Math.PI);

        this.#ctx.fillStyle = "#1AFF00FF"; //#FF5500FF";
        this.#ctx.stroke();
        this.#ctx.fill();
    
    }

    #drawConnections(nodeA) {
        let moverTo;
        let linerTo;

        for (let i = 0; i < nodeA.nodeLinkArray.length; i++) {

            moverTo = this.#coordProjectToScreen(nodeA.x, nodeA.y, nodeA.z);
            linerTo = this.#coordProjectToScreen(nodeA.nodeLinkArray[i].x, nodeA.nodeLinkArray[i].y, nodeA.nodeLinkArray[i].z);
            this.#ctx.lineWidth = 4;
            this.#ctx.beginPath();
            this.#ctx.moveTo(moverTo[0], moverTo[1]);
            this.#ctx.lineTo(linerTo[0], linerTo[1]);
            this.#ctx.stroke();
        }
    }

    #rotateMeshZ(speed = 1) {
        for (let i = 0; i < this.ModelMesh.length; i++) {
            this.ModelMesh[i].rotateZ(speed*this.thetaIncrement, this.widthCentre , this.heightCentre);
        }
    }

    #rotateMeshY(speed = 1) {
        for (let i = 0; i < this.ModelMesh.length; i++) {
            this.ModelMesh[i].rotateY(speed*this.thetaIncrement, this.widthCentre , 0);
        }
    }

    #rotateMeshX(speed = 1) {
        for (let i = 0; i < this.ModelMesh.length; i++) {
            this.ModelMesh[i].rotateX(speed*this.thetaIncrement, this.heightCentre , 0);
        }
    }

    animate() {
        //background
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        this.#ctx.fillStyle = "#00000090"; //transparent black
        this.#ctx.fillRect(0, 0, 300, 300);

        this.#drawMesh();
        //rotate
        this.#rotateMeshZ(2);
        this.#rotateMeshY(2);
        this.#rotateMeshX(80); // the max angular speed is 2

        visualiserAnimation = requestAnimationFrame(this.animate.bind(this)); //animate passes a time stamp implicitly

    }
}

function CreateCube(sideLength = 48, C = 150) {
    // C stands for "centre" regarding x, y coords, which in this case will always be 150, but can be overridden

    let vertex1 = new PointCoordsNode(-sideLength/2 + C, sideLength/2 + C, sideLength/2);
    let vertex2 = new PointCoordsNode(sideLength/2 + C, sideLength/2 + C, sideLength/2);
    let vertex3 = new PointCoordsNode(-sideLength/2 + C, sideLength/2 + C, -sideLength/2);
    let vertex4 = new PointCoordsNode(sideLength/2 + C, sideLength/2 + C, -sideLength / 2);
    
    let vertex5 = new PointCoordsNode(-sideLength/2 + C, -sideLength/2 + C, sideLength/2);
    let vertex6 = new PointCoordsNode(sideLength/2 + C, -sideLength/2 + C, sideLength/2);
    let vertex7 = new PointCoordsNode(-sideLength/2 + C, -sideLength/2 + C, -sideLength/2);
    let vertex8 = new PointCoordsNode(sideLength/2 + C, -sideLength/2 + C, -sideLength/2);

    vertex1.nodeLinkArray.push(vertex2, vertex3, vertex5);
    vertex4.nodeLinkArray.push(vertex2, vertex3, vertex8);
    vertex6.nodeLinkArray.push(vertex2, vertex5, vertex8);
    vertex7.nodeLinkArray.push(vertex5, vertex3, vertex8);

    return [
        vertex1,
        vertex2,
        vertex3,
        vertex4,
        vertex5,
        vertex6,
        vertex7,
        vertex8
    ];
}

function CreateTriangle(canvasWidth, canvasHeight) {

    let vertexA = new PointCoordsNode(100 + canvasWidth/2, canvasHeight/2 + 50, 0);
    let vertexB = new PointCoordsNode(canvasWidth/2, -100 + canvasHeight/2 + 50, 0);
    let vertexC = new PointCoordsNode(-100 + canvasWidth / 2, canvasHeight/2 + 50, 0);

    vertexB.nodeLinkArray.push(vertexA, vertexC);

    let TriangleModel = [
        vertexA,
        vertexB,
        vertexC
    ]

    return TriangleModel;
}