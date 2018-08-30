'use strict';

var PI = Math.PI,
    cos = Math.cos,
    sin = Math.sin,
    abs = Math.abs,
    sqrt = Math.sqrt,
    pow = Math.pow,
    floor = Math.floor,
    round = Math.round,
    random = Math.random,
    atan2 = Math.atan2;

var HALF_PI = 0.5 * PI;
var TAU = 2 * PI;
var TO_RAD = PI / 180;
var rand = function rand(n) {
    return n * random();
};
var randRange = function randRange(n) {
    return n - rand(2 * n);
};
var fadeIn = function fadeIn(t, m) {
    return t / m;
};
var fadeOut = function fadeOut(t, m) {
    return (m - t) / m;
};
var fadeInOut = function fadeInOut(t, m) {
    var hm = 0.5 * m;
    return abs((t + hm) % m - hm) / hm;
};
var dist = function dist(x1, y1, x2, y2) {
    return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
};
var angle = function angle(x1, y1, x2, y2) {
    return atan2(y2 - y1, x2 - x1);
};
var lerp = function lerp(n1, n2, speed) {
    return (1 - speed) * n1 + speed * n2;
};

var deflectorCount = 50;
var particleCount = 100;

var canvas = void 0;
var ctx = void 0;
var branchNum = void 0;
var baseHue = void 0;
var deflectors = void 0;
var particles = void 0;

function setup() {
    canvas = {
        a: document.createElement('canvas'),
        b: document.createElement('canvas')
    };
    ctx = {
        a: canvas.a.getContext('2d'),
        b: canvas.b.getContext('2d')
    };
    canvas.b.style = '\n\t\tcursor: pointer;\n\t\ttop: 0;\n\t\tleft: 0;\n\t\twidth: 100%;\n\t\theight: 100%;\n\t';
    var canv = document.getElementById('particle-canvas')
    canv.appendChild(canvas.b);
    init();
    draw();
}

function init() {
    resize();
    // branchNum = round(rand(5)) + 3;
    // baseHue = rand(360);

    branchNum = 7;
    baseHue = 140;

    deflectors = [];
    for (var i = 0; i < deflectorCount; i++) {
        deflectors.push(getDeflector());
    }

    particles = [];
    for (var _i = 0; _i < particleCount; _i++) {
        particles.push(getParticle(_i).create());
    }
}

function resize() {
    canvas.a.width = canvas.b.width = window.innerWidth;
    canvas.a.height = canvas.b.height = window.innerHeight;
}

function getDeflector() {
    return {
        position: {
            x: rand(window.innerWidth),
            y: rand(window.innerHeight)
        },
        threshold: rand(100) + 50
    };
}

function getParticle(i) {
    return {
        create: function create() {
            this.position.x = 0.5 * canvas.a.width + randRange(1);
            this.position.y = 0.5 * canvas.a.height + randRange(1);
            this.speed = 2;
            this.life = 0;
            this.ttl = rand(500) + 200;
            this.size = rand(2) + 2;
            this.hue = randRange(40) + baseHue;
            this.saturation = i / particleCount * 50 + 20;
            this.lightness = i / particleCount * 30 + 20;
            this.direction = round(randRange(branchNum)) * (360 / branchNum) * TO_RAD;
            this.turnRate = round(rand(20)) + 10;
            this.changeDirection = false;
            return this;
        },

        position: {
            x: 0,
            y: 0
        },
        velocity: {
            x: 0,
            y: 0
        },
        update: function update() {
            this.life++;
            if (this.changeDirection && this.life % this.turnRate === 0) {
                this.direction += round(randRange(1)) * (360 / branchNum) * TO_RAD;
                this.changeDirection = false;
            }
            this.position.x += cos(this.direction) * this.speed;
            this.position.y += sin(this.direction) * this.speed;
            this.destroy = this.life > this.ttl;
        },
        draw: function draw() {
            this.update();
            ctx.a.beginPath();
            ctx.a.strokeStyle = 'hsla(' + this.hue + ',' + this.saturation + '%,' + this.lightness + '%,' + fadeInOut(this.life, this.ttl) * 0.125 + ')';
            ctx.a.arc(this.position.x, this.position.y, this.size, 0, TAU);
            ctx.a.stroke();
            ctx.a.closePath();
        }
    };
}

var deflector = void 0,
    particle = void 0;

function draw() {
    var i = void 0,
        j = void 0;
    for (i = 0; i < particles.length; i++) {
        particle = particles[i];
        for (j = 0; j < deflectors.length; j++) {
            deflector = deflectors[j];
            if (dist(particle.position.x, particle.position.y, deflector.position.x, deflector.position.y) < deflector.threshold) {
                particle.changeDirection = true;
            }
        }

        particle.draw();
        if (particle.destroy) {
            particles.splice(i, 1);
            continue;
        };
    }
    if (particles.length) {
        ctx.b.save();
        ctx.b.fillStyle = "rgb(0,0,0)";
        ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
        ctx.b.restore();

        ctx.b.save();
        ctx.b.filter = "blur(20px)";
        ctx.b.drawImage(canvas.a, 0, 0);
        ctx.b.restore();

        ctx.b.save();
        ctx.b.drawImage(canvas.a, 0, 0);
        ctx.b.restore();
    }
    window.requestAnimationFrame(draw);
}

window.addEventListener("load", setup);
// window.addEventListener("resize", _.debounce(function () {
//     resize();
//     init();
// }, 50));
window.addEventListener("click", init);