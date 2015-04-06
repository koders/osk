var editableList, // sortable queue
    queue = [], // array with queue points
    minQueue = 0,
    maxQueue = 100,
    canvas,
    ctx,
    canvasWidthStep,
    canvasHeightStep,
    canvasRightMargin = 20,
    rulerY = 20,
    currentAlgorithm = 'fcfs',
    pointPart,
    totalHeadMovement,
    nextPos,
    nextJ;

var algorithms = {
    steps: [],
    calculated: false,
    currentStep: 0,
    fcfs: {
        //if(document.querySelector('#queueList li:nth-child(' + algorithms.currentStep + ')') != null) {
        // redrawing the canvas
        calculateSteps: function() {
            console.log('calculate steps');
            algorithms.calculated = true;
            algorithms.steps = queue;
            // TODO
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length - 1)return;
            algorithms.currentStep++;
            $('#queueList li:nth-child(' + (algorithms.currentStep + 1) + ')').css('color', 'red');
            intro = introJs();
            intro.setOptions({
                steps: [
                    {
                        element: document.querySelector('#queueList li:nth-child(' + (algorithms.currentStep + 1) + ')'),
                        intro: "Nākamais elements rindā."
                    },
                    {
                        element: document.querySelector('#canvas'),
                        intro: "Bīdam galvu uz " + queue[algorithms.currentStep] + " pozīciju."
                    }
                ]
            });
            intro.start();
            initCanvas();
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length - 1;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },
    sstf: {
        //if(document.querySelector('#queueList li:nth-child(' + algorithms.currentStep + ')') != null) {
        // redrawing the canvas
        calculateSteps: function() {
            console.log('calculate steps');
            algorithms.calculated = true;
            algorithms.steps = queue;
            // TODO
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length - 1)return;
            algorithms.currentStep++;
            initCanvas();
            intro = introJs();
            intro.setOptions({
                steps: [
                    {
                        element: document.querySelector('#queueList li:nth-child(' + (nextJ + 1) + ')'),
                        intro: "Nākamais tuvākais neizmantotais elements."
                    },
                    {
                        element: document.querySelector('#canvas'),
                        intro: "Bīdam galvu uz " + nextPos + " pozīciju."
                    }
                ]
            });
            intro.start();
            $('#queueList li:nth-child(' + (nextJ + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length - 1;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    }
};

$(document).ready(function () {

    intro = introJs();
    intro.setOptions({
        steps: [
            {
                intro: "Sveicināti!"
            },
            {
                element: document.querySelector('#algorithmRow'),
                intro: "Izvēlies algoritmu."
            },
            {
                element: document.querySelector('#discRow'),
                intro: "Izvēlies diska maksimālu adresu."
            },
            {
                element: document.querySelector('#queueRow'),
                intro: "Aizpildi rindu."
            },
            {
                element: document.querySelector('#controlsRow'),
                intro: "Klikšķino uz Nākamais solis lai redzēt nākamo soli vai Uz beigām lai uzreiz redzēt rezultātu."
            }
        ]
    });

    intro.start();

    // Canvas stuff
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    canvasWidthStep = (canvas.width - canvasRightMargin) / 100;
    canvasHeightStep = (canvas.height - 1) / 100;
    totalHeadMovement = 0; // TODO

    // Listeners
    document.getElementById('addToQueue').addEventListener('click', addToQueue);
    document.getElementById('nextStepLink').addEventListener('click', drawNextStep);
    document.getElementById('toEndLink').addEventListener('click', drawFinish);
    document.getElementById('algorithmPicker').addEventListener('change', selectAlgorithm);
    document.getElementById('diskLength').addEventListener('change', diskLengthValidation);

    for(var i = 0; i <= 4; i++) {
        var p = $('#opt' + i + '');
        p.append(' (' + calculateHeadMovement(p.text()) + ')');
    }

    // Sortable queue
    editableList = Sortable.create(document.getElementById('queueList'), {
        animation: 50,
        handle: ".drag-handle", // draggable icon
        filter: '.js-remove', // class of element for row removal
        onFilter: function(e) {
            // removing from queue array
            var index = queue.indexOf(getDigit(e.item));
            if (index > -1) { // if found
                queue.splice(index, 1);
            }

            // removing the HTML element
            var item = e.item;
            if (item && item.parentNode) {
                item.parentNode.removeChild(item);
            }

            // redraw canvas
            initCanvas();
        },
        onUpdate: function(e) {
            updateQueue();
            initCanvas();
        }
    });
});

var addToQueue = function() {
    var addToQueueNumber = document.getElementById('addToQueueNumber');
    var number = addToQueueNumber.value;

    // validation for min/max or already existing
    if ((number < minQueue) || (number > maxQueue)
        || (queue.indexOf(number) !== -1) || (number == '') || !isNumber(number)) {
        alert('Enter a unique numeric value from ' + minQueue + ' to ' + maxQueue + '.');
        addToQueueNumber.value = ''; // clear input
        return;
    }

    // pushing into global queue array
    queue.push(number);

    // adding to queue editable list
    var newLi = document.createElement('li');
    newLi.innerHTML = '<span class="drag-handle">&#9776;</span>\n' + number
    + '\n<i class="js-remove">&#10006;</i>';
    editableList.el.appendChild(newLi);

    $('#queueList li:first-child').css('color', 'red');

    // clear the input field
    addToQueueNumber.value = '';

    // redrawing the canvas
    initCanvas();

    // recalculate algorithm head movement
    for(var i = 0; i <= 4; i++) {
        var p = $('#opt' + i + '');
        var original = p.text().split(' ')[0];

        p.text(original + ' (' + calculateHeadMovement(p.text()) + ')');
    }

    return;
};

var getDigit = function(el) {
    return /\d+/.exec(el.innerHTML)[0];
};

var isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

var clearCanvas = function() {
    ctx.clearRect (0, 0, canvas.width, canvas.height);
};

var updateQueue = function() {
    // go through all childs of queueList and assign to queue
    var queueList = document.getElementById('queueList');

    for (var i = 0; i < queueList.children.length; i++) {
        queue[i] = getDigit(queueList.children[i]);
    };
};

var initCanvas = function() {
    clearCanvas();

    // canvas line setup
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 0.5; // 0.5px
    ctx.font="10px Georgia";
    pointPart = (canvas.height - rulerY) / (queue.length - 1);

    // ruler
    ctx.beginPath();
    ctx.moveTo(0, rulerY);
    ctx.lineTo(canvas.width - canvasRightMargin, rulerY);
    ctx.closePath();
    ctx.stroke();

    // vertical lines
    for (var i = 0; i < queue.length; i++) {
        ctx.beginPath();
        ctx.fillText(queue[i], queue[i] * canvasWidthStep, 15);
        ctx.moveTo(queue[i] * canvasWidthStep, rulerY);
        ctx.lineTo(queue[i] * canvasWidthStep, canvas.height);
        ctx.closePath();
        ctx.stroke();
    }

    // horizontal lines
    for (var i = 0; i < queue.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(0, rulerY + (pointPart * i));
        ctx.lineTo(canvas.width - canvasRightMargin, rulerY + (pointPart * i));
        ctx.closePath();
        ctx.stroke();
    }

    totalHeadMovement = 0;
    // step lines
    if(currentAlgorithm == 'fcfs') {
        for (var i = 0; i < algorithms.currentStep; i++) {
            ctx.beginPath();
            ctx.moveTo(queue[i] * canvasWidthStep, rulerY + (pointPart * i));
            ctx.lineTo(queue[i + 1] * canvasWidthStep, rulerY + (pointPart * (i + 1)));
            totalHeadMovement += Math.abs(queue[i + 1] - queue[i]);
            ctx.strokeStyle = '#ff0000';
            ctx.closePath();
            ctx.stroke();
        }
    }
    if(currentAlgorithm == 'sstf') {
        var usedFromQueue = [];
        var currentPos = queue[0];
        usedFromQueue[0] = true;
        for (var i = 0; i < algorithms.currentStep; i++) {
            var diff = Infinity;
            for(var j = 1; j < queue.length; j++) {
                if(!usedFromQueue[j] && diff > Math.abs(queue[j] - currentPos)) {
                    nextJ = j;
                    diff = Math.abs(queue[j] - currentPos);
                }
            }
            usedFromQueue[nextJ] = true;
            nextPos = queue[nextJ];
            ctx.beginPath();
            ctx.moveTo(currentPos * canvasWidthStep, rulerY + (pointPart * i));
            ctx.lineTo(nextPos * canvasWidthStep, rulerY + (pointPart * (i + 1)));
            totalHeadMovement += Math.abs(nextPos - currentPos);
            currentPos = nextPos;
            ctx.strokeStyle = '#ff0000';
            ctx.closePath();
            ctx.stroke();
        }
    }

    $('#totalHeadMovement').text(totalHeadMovement);
};

var selectAlgorithm = function(e) {
    currentAlgorithm = e.target.value;
    algorithms.calculated = false;
    algorithms.currentStep = 0;
    clearCanvas();
    for(var i = 2; i <= queue.length; i++) {
        $('#queueList li:nth-child('+i+')').css('color', '#555');
    }
    initCanvas();
};

var drawNextStep = function() {
    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Select an algorithm and add items to queue first!');
        return false;
    }
    algorithms[currentAlgorithm].drawNextStep();
};

var drawFinish = function() {
    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Select an algorithm and add items to queue first!');
        return false;
    }
    algorithms[currentAlgorithm].drawFinish();
};

function calculateHeadMovement(algorithm) {
    var totalHeadMovement = 0;
    console.log(algorithm.toLowerCase().substring(0,4));
    if(algorithm == null)return 0;
    if(algorithm.toLowerCase().substring(0,4) == 'fcfs') {
        for (var i = 0; i < queue.length - 1; i++) {
            totalHeadMovement += Math.abs(queue[i] - queue[i + 1]);
            currentPos = nextPos;
        }
    }
    if(algorithm.toLowerCase().substring(0,4) == 'sstf') {
        var usedFromQueue = [];
        var currentPos = queue[0];
        usedFromQueue[0] = true;
        var nextJ;
        var nextPos;
        for (var i = 0; i < queue.length - 1; i++) {
            var diff = Infinity;
            for (var j = 1; j < queue.length; j++) {
                if (!usedFromQueue[j] && diff > Math.abs(queue[j] - currentPos)) {
                    nextJ = j;
                    diff = Math.abs(queue[j] - currentPos);
                }
            }
            usedFromQueue[nextJ] = true;
            nextPos = queue[nextJ];
            totalHeadMovement += Math.abs(nextPos - currentPos);
            currentPos = nextPos;
        }
    }
    return totalHeadMovement;
};

var diskLengthValidation = function(e) {

};