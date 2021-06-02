const bottomToolbar = document.getElementById('bottomToolbar');
const loadButton = document.getElementById('loadButton');
const upload = document.getElementById('upload');
const saveButton = document.getElementById('saveButton');
const strokeButton = document.getElementById('sizeButton');
const colorButton = document.getElementById('colorButton');
var colorPreview = document.getElementById('colorPreview');
const colorPicker = document.getElementById('colorPicker');
const toolButton = document.getElementById('toolButton');
const toolIcon = document.getElementById('toolIcon');
const tools = ["draw", "erase"];
var saved = true;
var tool = {"index": 0, "name": "draw"};
var thickness = 1;
var color = '#000';
var mouseDown = false;
var prevMouseX;
var prevMouseY;
init();

async function init() {
    await fetch("./config.json")
    .then(response => response.json())
    .then(data => {
        main(data);
    });
};

function main(config) {
    setup();

    colorPicker.addEventListener(
        "input", function() {
            color = this.value;
            stroke(color);
            colorPreview.setAttribute('style', `background-color: ${color}`);
        }, false
    );

    colorButton.onclick = function() {
        colorPicker.click();
    };

    toolButton.onclick = function() {
        if (tool.index < tools.length - 1) {
            tool.index += 1
        } else {
            tool.index = 0;
        };
        tool.name = tools[tool.index];
        toolIcon.src = `assets/tool-${tool.name}.svg`;
    };

    strokeButton.onclick = function() {
        let response = prompt('Enter a numeric brush size.', thickness);
        if (!isNaN(response) && response >= 1) {
            thickness = response;
            strokeWeight(thickness);
        }
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
};

function heightCalc() {
    return window.innerHeight - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('height')) - parseInt(window.getComputedStyle(bottomToolbar).getPropertyValue('--bottom-inset'));
};

function windowResized() {
    resizeCanvas(windowWidth, heightCalc());
};

function checkSave() {
    if (saved) {
        return true;
    } else {
        return confirm("You have unsaved changes on your sketch. Continue anyway?");
    };
};