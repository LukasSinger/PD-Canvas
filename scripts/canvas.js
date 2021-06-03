const bottomToolbar = document.getElementById('bottomToolbar');
const loadButton = document.getElementById('loadButton');
const upload = document.getElementById('upload');
const saveButton = document.getElementById('saveButton');
const strokeButton = document.getElementById('sizeButton');
const colorButton = document.getElementById('colorButton');
var colorPreview = document.getElementById('colorPreview');
const toolButton = document.getElementById('toolButton');
const toolIcon = document.getElementById('toolIcon');
const tools = ["draw", "erase"];
var saved = true;
var tool = {"index": 0, "name": "draw"};
var drawThickness = 1;
var eraseThickness = 30;
var selectedColor = '#000000';
var canvasDimensions = {"x": 0, "y": 0};
var mouseDown = false;
var prevMouseX;
var prevMouseY;
init();

async function init() {
    await fetch("./config.json")
    .then(response => response.json())
    .then(data => {
        let interval =  setInterval(function() {
            if (createCanvas) {
                clearInterval(interval);
                main(data);
            }
        }, 100);
    });
};

function main(config) {
    setup();

    colorButton.onclick = function() {
        let response = prompt('Enter a hex (#) color.', selectedColor);
        let validHex = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        let count = 0;
        for (i=0; i<response.replace('#', '').length; i++) {
            if (validHex.includes(response.replace('#', '').charAt(i))) {
                count += 1;
            };
        };
        if (response.length >= 3 && response.length <= 7 && count == response.replace('#', '').length) {
            if (response.charAt(0) != '#') {
                response = `#${response}`
            }
            selectedColor = response;
            stroke(selectedColor);
            colorPreview.setAttribute('style', `background-color: ${selectedColor}`);
        };
        colorButton.dispatchEvent('onpointerup');
    };

    toolButton.onclick = function() {
        if (tool.index < tools.length - 1) {
            tool.index += 1;
        } else {
            tool.index = 0;
        };
        tool.name = tools[tool.index];
        toolIcon.src = `assets/tool-${tool.name}.svg`;
        if (tool.name == 'draw') {
            strokeWeight(drawThickness);
        } else if (tool.name == 'erase') {
            strokeWeight(eraseThickness);
        };
        toolButton.dispatchEvent('onpointerup');
    };

    strokeButton.onclick = function() {
        let response;
        if (tool.name == 'draw') {
            response = prompt('Enter a numeric brush size.', drawThickness);
        } else if (tool.name == 'erase') {
            response = prompt('Enter a numeric eraser size.', eraseThickness);
        };
        if (!isNaN(response) && response > 0) {
            if (tool.name == 'draw') {
                drawThickness = response;
            } else if (tool.name == 'erase') {
                eraseThickness = response;
            };
            strokeWeight(response);
        } else if (isNaN(response)) {
            alert(`Oops! The size must be a number.`);
        } else {
            alert(`Oops! The size must be greater than 0.`);
        };
        strokeButton.dispatchEvent('onpointerup');
    };

    upload.addEventListener(
        "change", function() {
            let canvasReplace = this.files[0];
            if (canvasReplace && checkSave()) {
                canvasReplace = URL.createObjectURL(canvasReplace);
                loadImage(canvasReplace, img => {
                    image(img, 0, 0, windowWidth, heightCalc());
                });
            }
            loadButton.dispatchEvent('onpointerup');
        }, false
    );

    loadButton.onclick = async function() {
        upload.click();
    };

    saveButton.onclick = function() {
        let date = new Date();
        let canvasExport;
        fetch(document.getElementById('defaultCanvas0').toDataURL())
        .then(res => res.blob())
        .then(blob => {
            return new File(
                [blob],
                `Sketch from ${new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric' }).format(date)} on ${new Intl.DateTimeFormat('default', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)}.png`.replace(':', '꞉'),
                {type: blob.type}
            );
        })
        .then(file => {
            canvasExport = {
                'files': [ file ],
                mimeType: 'image/png'
            }
            if (navigator.share(canvasExport)) {
                navigator.share();
            } else {
                saveCanvas();
            }
            saved = true;
        })
        // If share fails for some reason, this prompt will appear
        .catch(err => alert(`Your device doesn't appear to support saving this image. Please take a screenshot instead.`));
        saveButton.dispatchEvent('onpointerup');
    };
};

function setup() {
    var canvas = createCanvas(100, 100);
    frameRate(1000);
    canvas.parent('canvas');
    windowResized();
    canvas.mousePressed(function() {
        mouseDown = true;
    });
    canvas.mouseReleased(function() {
        mouseDown = false;
    });
    canvas.touchStarted(function() {
        mouseDown = true;
    });
    canvas.touchEnded(function() {
        mouseDown = false;
    });
    prevMouseX = mouseX;
    prevMouseY = mouseY;
};

function draw() {
    if (mouseDown && mouseIsPressed) {
        if (tool.name == 'draw') {
            noErase();
        } else if (tool.name == 'erase') {
            erase();
        }
        if (prevMouseX) {
            line(prevMouseX, prevMouseY, mouseX, mouseY);
        } else {
            line(mouseX, mouseY, mouseX, mouseY);
        };
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        saved = false;
    } else {
        prevMouseX = null;
    };
    windowResized();
};

function heightCalc() {
    return window.innerHeight - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('height')) - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('--bottom-inset'));
};

function windowResized() {
    if (canvasDimensions.x != windowWidth - canvas.width || canvasDimensions.y != heightCalc() - canvas.height) {
        resizeCanvas(windowWidth, heightCalc())
        canvasDimensions.x = windowWidth - canvas.width;
        canvasDimensions.y = heightCalc() - canvas.height;
    };
};

function checkSave() {
    if (saved) {
        return true;
    } else {
        return confirm("You have unsaved changes on your sketch. Continue anyway?");
    };
};