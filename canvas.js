const p5 = require('https://lukassinger.github.io/PD-Canvas/p5.min.js');
const canvas = document.getElementById('canvas').getContext('2d');

canvas.fillStyle = 'rgb(200, 0, 0)';
canvas.fillRect(10, 10, 50, 50);

canvas.fillStyle = 'rgba(0, 0, 200, 0.5)';
canvas.fillRect(30, 30, 50, 50);