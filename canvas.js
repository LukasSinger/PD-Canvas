const config = import("./config.json");
const canvasElement = document.getElementById('canvas')
const canvas = canvasElement.getContext('2d');

canvas.fillStyle = 'rgb(200, 0, 0)';
canvas.fillRect(10, 10, 50, 50);

canvas.fillStyle = 'rgba(0, 0, 200, 0.5)';
canvas.fillRect(30, 30, 50, 50);

window.onresize = function () {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight - config.toolbarHeight;
}