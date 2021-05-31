const bottomToolbar = document.getElementById('bottomToolbar');
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
var heightCalc;
init();

async function init() {
    await fetch("./config.json")
    .then(response => response.json())
    .then(data => {
        resizeCanvas()
        drawCanvas()
        setInterval(function () {
            heightCalc = window.innerHeight - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('height')) - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('padding-bottom'));
            resizeCanvas()
            drawCanvas()
        }, 300);
    });
};

function drawCanvas() {
    canvas.fillStyle = 'rgb(200, 0, 0)';
    canvas.fillRect(10, 10, 50, 50);

    canvas.fillStyle = 'rgba(0, 0, 200, 0.5)';
    canvas.fillRect(30, 30, 50, 50);
};

function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = heightCalc;
};