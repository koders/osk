var editableList, // sortable queue
    queue = [], // array with queue points
    minQueue = 0,
    maxQueue = 99,
    canvas,
    ctx,
    canvasWidthStep,
    canvasHeightStep,
    canvasRightMargin = 20,
    rulerY = 20,
    currentAlgorithm,
    pointPart,
    totalHeadMovement,
    nextPos,
    nextJ,
    tutorial = true;

var algorithms = {
    steps: [],
    calculated: false,
    currentStep: 0,

    // First Come First Serve
    fcfs: {
        maxSteps: -1,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
            for (var i = 0; i < queue.length - 1; i++) {
                totalHeadMovement += Math.abs(queue[i] - queue[i + 1]);
            }
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            $('#queueList li:nth-child(' + (algorithms.currentStep + 1) + ')').css('color', 'red');
            if(tutorial) {
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
            }
            initCanvas();
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

    //Shortest Seek Time First
    sstf: {
        maxSteps: -1,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
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
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            initCanvas();
            if(tutorial) {
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
            }
            $('#queueList li:nth-child(' + (nextJ + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

    // SCAN
    scan: {
        maxSteps: 1,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
            for (var i = 0; i < queue.length - 1; i++) {
                totalHeadMovement = parseInt(queue[0]) + maxQueue;
            }
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            initCanvas();
            if(tutorial) {
                intro = introJs();
                var introText;
                if(nextPos != minQueue && nextPos != maxQueue)
                    introText = "Skenējam... nākamā adrese ir " + nextPos + ", bīdam galvu uz " + nextPos + " pozīciju.";
                if(nextPos == minQueue)
                    introText = "Skenējam... Sasniedzam " + minQueue + " un neatrodam nevienu adresi, griežamies apkārt un sākam skenēt uz otru pusi.";
                if(nextPos == maxQueue)
                    introText = "Skenējam... Sasniedzam " + maxQueue + " un neatrodam nevienu adresi, esam pabeiguši skenēšanu.";
                intro.setOptions({
                    steps: [
                        //{
                        //    element: document.querySelector('#queueList li:nth-child(' + (nextJ + 1) + ')'),
                        //    intro: "Nākamais tuvākais neizmantotais elements."
                        //},
                        {
                            element: document.querySelector('#canvas'),
                            intro: introText
                        }
                    ]
                });
                intro.start();
            }
            $('#queueList li:nth-child(' + (queue.indexOf(nextPos) + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

    // Circular SCAN
    cscan: {
        maxSteps: 2,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
            for (var i = 0; i < queue.length - 1; i++) {
                totalHeadMovement = maxQueue;
            }
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            initCanvas();
            if(tutorial) {
                intro = introJs();
                var introText;
                if(nextPos != maxQueue)
                    introText = "Skenējam... nākamā adrese ir " + nextPos + ", bīdam galvu uz " + nextPos + " pozīciju.";
                if(nextPos == minQueue)
                    introText = "Pārlecam uz " + minQueue;
                if(nextPos == maxQueue)
                    introText = "Skenējam... Sasniedzam " + maxQueue + " un neatrodam nevienu adresi";
                if(algorithms.currentStep == queue.length + this.maxSteps)
                    introText = "Skenējam... Esam atraduši visas rindas adreses, tāpēc beidzam skenēšanu";
                intro.setOptions({
                    steps: [
                        //{
                        //    element: document.querySelector('#queueList li:nth-child(' + (nextJ + 1) + ')'),
                        //    intro: "Nākamais tuvākais neizmantotais elements."
                        //},
                        {
                            element: document.querySelector('#canvas'),
                            intro: introText
                        }
                    ]
                });
                intro.start();
            }
            $('#queueList li:nth-child(' + (queue.indexOf(nextPos) + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

    // LOOK
    look: {
        maxSteps: -1,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
            var sortedQueue = [];
            for(var i = 0; i < queue.length; i++) {
                sortedQueue[i] = queue[i];
            }
            sortedQueue.sort(sortNumber);
            var startingPos;
            for(var i = 0; i < sortedQueue.length; i++) {
                if(sortedQueue[i] == queue[0]) {
                    startingPos = i;
                }
            }
            for(var i = startingPos - 1; i >= 0; i--) {
                totalHeadMovement += sortedQueue[i + 1] - sortedQueue[i];
            }
            if(startingPos < sortedQueue.length - 1)
                totalHeadMovement += sortedQueue[startingPos + 1] - sortedQueue[0];
            for(var i = startingPos + 1; i < sortedQueue.length - 1; i++) {
                totalHeadMovement += sortedQueue[i + 1] - sortedQueue[i];
            }
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            initCanvas();
            if(tutorial) {
                intro = introJs();
                var introText;
                introText = "Meklējam... nākamā adrese ir " + nextPos + ", bīdam galvu uz " + nextPos + " pozīciju.";
                if(nextPos == minElement(queue))
                    introText = "Meklējam... nākamais elements ir " + nextPos + ", tālāk pa kreisi vairs nav neviena adrese, tāpēc griežamies apkārt un sākam meklēt uz otru pusi.";
                if(algorithms.currentStep == queue.length + this.maxSteps)
                    introText = "Meklējam... nākamais elements ir " + nextPos + ", tālāk pa labi vairs nav neviena adrese, tāpēc esam beiguši meklēšanu";
                intro.setOptions({
                    steps: [
                        //{
                        //    element: document.querySelector('#queueList li:nth-child(' + (nextJ + 1) + ')'),
                        //    intro: "Nākamais tuvākais neizmantotais elements."
                        //},
                        {
                            element: document.querySelector('#canvas'),
                            intro: introText
                        }
                    ]
                });
                intro.start();
            }
            $('#queueList li:nth-child(' + (queue.indexOf(nextPos) + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

    // Circular LOOK
    clook: {
        maxSteps: -1,
        calculateSteps: function() {
            algorithms.calculated = true;
            algorithms.steps = queue;
            var totalHeadMovement = 0;
            var sortedQueue = [];
            for(var i = 0; i < queue.length; i++) {
                sortedQueue[i] = queue[i];
            }
            sortedQueue.sort(sortNumber);
            var startingPos;
            for(var i = 0; i < sortedQueue.length; i++) {
                if(sortedQueue[i] == queue[0]) {
                    startingPos = i;
                }
            }
            for(var i = startingPos; i < sortedQueue.length - 1; i++) {
                totalHeadMovement += sortedQueue[i + 1] - sortedQueue[i];
            }
            for(var i = 0; i < startingPos - 1; i++) {
                totalHeadMovement += sortedQueue[i + 1] - sortedQueue[i];
            }
            return totalHeadMovement;
        },
        drawNextStep: function() {
            if (algorithms.currentStep == queue.length + this.maxSteps)return;
            algorithms.currentStep++;
            initCanvas();
            if(tutorial) {
                intro = introJs();
                var introText;
                introText = "Meklējam... nākamais elements ir " + nextPos + ", bīdam galvu uz " + nextPos + " pozīciju.";
                if(nextPos == minElement(queue))
                    introText = "Tālāk pa labi vairs nav neviena lasāma adrese, tāpēc lecam uz mazāko adresi.";
                if(algorithms.currentStep == queue.length + this.maxSteps)
                    introText = "Meklējam... nākamais elements ir " + nextPos + ", bīdam galvu uz " + nextPos + " pozīciju. Esam nolasījuši visus elementus, tāpēc beidzam meklēšanu";
                intro.setOptions({
                    steps: [
                        //{
                        //    element: document.querySelector('#queueList li:nth-child(' + (nextJ + 1) + ')'),
                        //    intro: "Nākamais tuvākais neizmantotais elements."
                        //},
                        {
                            element: document.querySelector('#canvas'),
                            intro: introText
                        }
                    ]
                });
                intro.start();
            }
            $('#queueList li:nth-child(' + (queue.indexOf(nextPos) + 1) + ')').css('color', 'red');
        },
        drawFinish: function() {
            algorithms.currentStep = queue.length + this.maxSteps;
            // redrawing the canvas
            initCanvas();
            for(var i = 2; i <= queue.length; i++) {
                $('#queueList li:nth-child('+i+')').css('color', 'red');
            }
        }
    },

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
                intro: "Ieraksti diska lielumu."
            },
            {
                element: document.querySelector('#queueRow'),
                intro: "Aizpildi rindu."
            },
            {
                element: document.querySelector('#controlsRow'),
                intro: "Izmanto algoritma izpildes vadības paneli."
            },
            {
                element: document.querySelector('#videoButton'),
                intro: "Ievada video. Cilvēkiem ar vājiem nerviem nav ieteicams skatīties..."
            }
        ]
    });

    intro.start();
    //setTimeout(function(){intro.start()}, 2000);

    // Canvas stuff
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    canvasWidthStep = (canvas.width - canvasRightMargin) / maxQueue;
    canvasHeightStep = (canvas.height - 1) / maxQueue;
    totalHeadMovement = 0;

    // Listeners
    document.getElementById('addToQueue').addEventListener('click', addToQueue);
    document.getElementById('toStartLink').addEventListener('click', replay);
    document.getElementById('nextStepLink').addEventListener('click', drawNextStep);
    document.getElementById('toEndLink').addEventListener('click', drawFinish);
    $('#tutorialLabel span').on('click', toggleTutorial);
    document.getElementById('algorithmPicker').addEventListener('change', selectAlgorithm);
    document.getElementById('diskLength').addEventListener('change', diskLengthValidation);

    for(var i = 0; i <= 5; i++) {
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
            var index = queue.indexOf(parseInt(getDigit(e.item)));
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
    //$('.header').textillate({ in: { effect: 'flipInX' } });
});

var addToQueue = function(e) {
    // preventing changing of url
    if (e) {
        e.preventDefault();
    }

    var addToQueueNumber = document.getElementById('addToQueueNumber');
    var number = addToQueueNumber.value;

    // validation for min/max or already existing
    if ((number < minQueue) || (number > maxQueue) || (number == '') || !isNumber(number)) {
        alert('Ievadi skaitli no ' + minQueue + ' līdz ' + maxQueue + '.');

        addToQueueNumber.value = ''; // clear input
        return;
    }

    // pushing into global queue array
    queue.push(parseInt(number));

    // adding to queue editable list
    var newLi = document.createElement('li');
    newLi.className = 'list-inline';
    newLi.innerHTML = '<span class="drag-handle">&#9776;</span>\n' + number
    + '\n<i class="js-remove">&#10006;</i>';
    editableList.el.appendChild(newLi);

    $('#queueList li:first-child').css('color', 'red');

    // clear the input field
    addToQueueNumber.value = '';

    // redrawing the canvas
    initCanvas();

    // recalculate algorithm head movement
    for(var i = 0; i <= 5; i++) {
        var p = $('#opt' + i + '');
        var original = p.text().split(' ')[0];

        p.text(original + ' (' + calculateHeadMovement(p.text()) + ')');
    }

    if(currentAlgorithm != "fcfs")
        replay();

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


var selectAlgorithm = function(e) {
    currentAlgorithm = e.target.value.replace('-','');
    algorithms.calculated = false;
    algorithms.currentStep = 0;
    for(var i = 2; i <= queue.length; i++) {
        $('#queueList li:nth-child('+i+')').css('color', '#555');
    }
    initCanvas();
};

var replay = function(e) {
    // preventing changing of url
    if (e) {
        e.preventDefault();
    }

    algorithms.currentStep = 0;
    initCanvas();
    for(var i = 2; i <= queue.length; i++) {
        $('#queueList li:nth-child('+i+')').css('color', '#555555');
    }
};

var drawNextStep = function(e) {
    // preventing changing of url
    if (e) {
        e.preventDefault();
    }

    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Vispirms izvēlies algoritmu un izveido rindu!');
        return false;
    }
    algorithms[currentAlgorithm].drawNextStep();
};

var drawFinish = function(e) {
    // preventing changing of url
    if (e) {
        e.preventDefault();
    }

    if (!currentAlgorithm || (queue.length == 0)) {
        alert('Vispirms izvēlies algoritmu un izveido rindu!');
        return false;
    }
    algorithms[currentAlgorithm].drawFinish();
};

// Calculates total head movement for an algorithm
function calculateHeadMovement(algorithm) {
    var totalHeadMovement = 0;
    if(algorithm == null || queue.length == 0)return 0;
    var algorithmUncut = algorithm;
    algorithm = algorithm.toLowerCase().substring(0,4);
    if(algorithm == 'fcfs' || algorithm == 'sstf' || algorithm == 'scan' || algorithm == 'look') {
        return algorithms[algorithm].calculateSteps();
    }
    algorithm = algorithmUncut.toLowerCase().substring(0,6).replace('-','');
    if(algorithm == 'cscan' || algorithm == 'clook') {
        return algorithms[algorithm].calculateSteps();
    }
    return totalHeadMovement;
};

var diskLengthValidation = function() {

    var diskLengthInput = document.getElementById('diskLength');
    var number = diskLengthInput.value;

    // disk length validation
    if (!isNumber(number) || number <= minQueue) {
        alert('Ievadi pozitīvu skaitli');
        diskLengthInput.value = ''; // clear input
        return;
    }

    // update max queue
    maxQueue = parseInt(number);

    // update queue input placeholder
    var addToQueueNumber = document.getElementById('addToQueueNumber');
    addToQueueNumber.placeholder = minQueue + ' - ' + maxQueue;

    // recalculate height and width steps
    canvasWidthStep = (canvas.width - canvasRightMargin) / maxQueue;
    canvasHeightStep = (canvas.height - 1) / maxQueue;

    // reset queue
    resetQueue();

    // redraw
    initCanvas();
};

var resetQueue = function() {
    // resetting array
    queue = [];

    // resetting html queue
    var queueList = document.getElementById('queueList');
    queueList.innerHTML = '';

    // resetting steps if already started
    algorithms.currentStep = 0;
};

function toggleTutorial() {
    tutorial = !tutorial;
}

function sortNumber(a,b) {
    return a - b;
}

function minElement(a) {
    if(a.length == 0) return;
    var min = a[0];
    for(var i = 1; i < a.length; i++) {
        if(a[i] < min)min = a[i];
    }
    return min;
}

function maxElement(a) {
    if(a.length == 0) return;
    var max = a[0];
    for(var i = 1; i < a.length; i++) {
        if(a[i] > max)max = a[i];
    }
    return max;
}