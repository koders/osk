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
    totalHeadMovement;

var algorithms = {
    steps: [],
    calculated: false,
    currentStep: 0,
    fcfs: {
        calculateSteps: function() {
            console.log('calculate steps');
            algorithms.calculated = true;
            algorithms.steps = queue;
            // TODO
        },
        drawNextStep: function() {
            console.log('draw next step');
            // TODO
            algorithms.currentStep++;

        },
        drawFinish: function() {
            console.log('draw finish');
            // while possible, drawNextStep... 
        }
    }
};

$(document).ready(function () {
    // Canvas stuff
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    canvasWidthStep = (canvas.width - canvasRightMargin) / 100;
    canvasHeightStep = (canvas.height - 1) / 100;
    totalHeadMovement = 0; // TODO

    var pointPart = (canvas.height - rulerY) / queue.length;

    // Listeners
    document.getElementById('addToQueue').addEventListener("click", addToQueue);
    document.getElementById('nextStepLink').addEventListener("click", drawNextStep);
    document.getElementById('toEndLink').addEventListener("click", drawFinish);
    document.getElementById('radio1').addEventListener("change", selectAlgorithm);
    document.getElementById('radio2').addEventListener("change", selectAlgorithm);
    document.getElementById('radio3').addEventListener("change", selectAlgorithm);
    document.getElementById('radio4').addEventListener("change", selectAlgorithm);
    document.getElementById('radio5').addEventListener("change", selectAlgorithm);

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
    newLi.innerHTML = '<span class="drag-handle">☰</span>\n' + number 
                        + '\n<i class="js-remove">✖</i>';
    editableList.el.appendChild(newLi);

    // clear the input field
    addToQueueNumber.value = '';

    // redrawing the canvas
    initCanvas();

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
    pointPart = (canvas.height - rulerY) / queue.length;

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
    for (var i = 0; i < queue.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, rulerY + (pointPart * i));
        ctx.lineTo(canvas.width - canvasRightMargin, rulerY + (pointPart * i));
        ctx.closePath();
        ctx.stroke();
    }
};

var selectAlgorithm = function(e) {
    currentAlgorithm = e.target.value;
    algorithms.calculated = false;
};

var drawNextStep = function() {
    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Select an algorithm and enter queue first!');
        return false;
    }
    algorithms[currentAlgorithm].drawNextStep();
};

var drawFinish = function() {
    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Select an algorithm and enter queue first!');
        return false;
    }
    algorithms[currentAlgorithm].drawFinish();
};