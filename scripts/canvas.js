const tools = ["draw", "erase"];
var tool = {"index": 0, "name": "draw"};
var drawThickness = 1;
var eraseThickness = 30;
var selectedColor = '#000000';
var saved = true;
var canvasDimensions = {"x": 0, "y": 0};
var mouseDown = false;
var prevMouseX;
var prevMouseY;
init();

function element(id) {
    return document.getElementById(id);
}

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

    element('colorButton').onclick = function() {
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
            element('colorPreview').setAttribute('style', `background-color: ${selectedColor}`);
        } else {
            alert(`Oops! That color wasn't in hexadecimal format.`);
        };
        element('colorButton').dispatchEvent('onpointerup');
    };

    element('toolButton').onclick = function() {
        if (tool.index < tools.length - 1) {
            tool.index += 1;
        } else {
            tool.index = 0;
        };
        tool.name = tools[tool.index];
        element('toolIcon').src = `assets/tool-${tool.name}.svg`;
        if (tool.name == 'draw') {
            strokeWeight(drawThickness);
        } else if (tool.name == 'erase') {
            strokeWeight(eraseThickness);
        };
        updateUI();
        element('toolButton').dispatchEvent('onpointerup');
    };

    element('sizeButton').onclick = function() {
        let response;
        if (tool.name == 'draw') {
            response = prompt('Enter a numeric PEN size.', drawThickness);
        } else if (tool.name == 'erase') {
            response = prompt('Enter a numeric ERASER size.', eraseThickness);
        };
        if (!isNaN(response) && response > 0 && response < 1000) {
            if (tool.name == 'draw') {
                drawThickness = response;
            } else if (tool.name == 'erase') {
                eraseThickness = response;
            };
            strokeWeight(response);
            updateUI();
        } else if (isNaN(response)) {
            alert(`That's not a number! The size must be between 0 and 1000.`);
        } else if (response != null) {
            if (response <= 0) {
                alert(`That's too small! The size must be bigger than 0.`);
            } else {
                alert(`That's too big! The size must be smaller than 1000.`);
            };
        };
        element('sizeButton').dispatchEvent('onpointerup');
    };

    element('upload').addEventListener(
        "change", function() {
            let canvasReplace = this.files[0];
            if (canvasReplace && checkSave()) {
                canvasReplace = URL.createObjectURL(canvasReplace);
                loadImage(canvasReplace, img => {
                    image(img, 0, 0, windowWidth, heightCalc());
                });
            }
            element('loadButton').dispatchEvent('onpointerup');
        }, false
    );

    element('loadButton').onclick = async function() {
        element('upload').click();
    };

    element('saveButton').onclick = function() {
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
        element('saveButton').dispatchEvent('onpointerup');
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
    return window.innerHeight - parseInt(window.getComputedStyle(element('bottomToolbar')).getPropertyValue('height')) - parseInt(window.getComputedStyle(element('bottomToolbar')).getPropertyValue('--bottom-inset'));
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

function updateUI() {
    if (tool.name == 'draw') {
        element('toolLabel').innerHTML = 'Pen';
        element('sizeLabel').innerHTML = drawThickness;
        element('sizeLabel').setAttribute('style', 'color: #2d3139;');
        element('sizePreview').setAttribute('style', 'border-color: #2d3139;');
        element('colorButton').setAttribute('style', 'visibility: default;')
    } else if (tool.name == 'erase') {
        element('toolLabel').innerHTML = 'Eraser';
        element('sizeLabel').innerHTML = eraseThickness;
        element('sizeLabel').setAttribute('style', 'color: #eb374f;');
        element('sizePreview').setAttribute('style', 'border-color: #eb374f;');
        element('colorButton').setAttribute('style', 'visibility: hidden;')
    };
    if (element('sizeLabel').innerHTML.toString().length >= 3) {
        element('sizeLabel').setAttribute('style', `${this.getAttribute('style')} font-size: 10px;`);
    } else {
        element('sizeLabel').setAttribute('style', `${this.getAttribute('style')} font-size: 12px;`);
    };
};