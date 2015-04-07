var initCanvas = function() {
    clearCanvas();

    // canvas line setup
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 0.5; // 0.5px
    ctx.font="10px Georgia";
    ctx.fillStyle = 'gray';
    //var count = currentAlgorithm == "scan" || currentAlgorithm == "cscan" ? -1 : 1;
    //var count = currentAlgorithm == "clook" ? 0 : count;
    var count = 0;
    if(currentAlgorithm)
        count = -algorithms[currentAlgorithm].maxSteps;
    pointPart = (canvas.height - rulerY) / (queue.length - count);

    // ruler
    ctx.beginPath();
    ctx.moveTo(0, rulerY);
    ctx.lineTo(canvas.width - canvasRightMargin, rulerY);
    ctx.closePath();
    ctx.stroke();

    console.log(queue);
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
    for (var i = 0; i < queue.length - count; i++) {
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

    if(currentAlgorithm == 'scan' || currentAlgorithm == 'look') {
        var currentPos = nextPos = queue[0];
        var sortedQueue = [];
        for(var i = 0; i < queue.length; i++) {
            sortedQueue[i] = queue[i];
        }
        if(currentAlgorithm == 'scan') {
            sortedQueue.push(minQueue);
            sortedQueue.push(maxQueue);
        }
        sortedQueue.sort(sortNumber);
        var startingPos;
        for(var i = 0; i < sortedQueue.length; i++) {
            if(sortedQueue[i] == queue[0]) {
                startingPos = i;
            }
        }
        var currentPos1 = startingPos;
        var phase = 1;
        for (var i = 0; i < algorithms.currentStep; i++) {
            if(phase == 1) {
                currentPos1--;
                if(currentPos1 < 0) {
                    phase = 2;
                    currentPos1 = startingPos;
                }
            }
            if(phase == 2) {
                currentPos1++;
            }
            nextPos = sortedQueue[currentPos1];
            ctx.beginPath();
            ctx.arc(nextPos * canvasWidthStep, rulerY + (pointPart * (i + 1)), 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
            //ctx.lineWidth = 5;
            //ctx.strokeStyle = 'red';
            ctx.closePath();
            ctx.stroke();

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

    if(currentAlgorithm == 'cscan' || currentAlgorithm == 'clook') {
        var currentPos = nextPos = queue[0];
        var sortedQueue = [];
        for(var i = 0; i < queue.length; i++) {
            sortedQueue[i] = queue[i];
        }
        if(currentAlgorithm == 'cscan') {
            sortedQueue.push(minQueue);
            sortedQueue.push(maxQueue);
        }
        sortedQueue.sort(sortNumber);
        var startingPos;
        for(var i = 0; i < sortedQueue.length; i++) {
            if(sortedQueue[i] == queue[0]) {
                startingPos = i;
            }
        }
        var currentPos1 = startingPos;
        var phase = 1;
        for (var i = 0; i < algorithms.currentStep; i++) {
            if(currentPos1 == sortedQueue.length - 1) {
                currentPos1 = 0;
                nextPos = sortedQueue[currentPos1];
                ctx.setLineDash([5, 15]);
                ctx.beginPath();
                ctx.moveTo(currentPos * canvasWidthStep, rulerY + (pointPart * i));
                ctx.lineTo(nextPos * canvasWidthStep, rulerY + (pointPart * (i + 1)));
                //totalHeadMovement += Math.abs(nextPos - currentPos);
                currentPos = nextPos;
                ctx.strokeStyle = '#ff0000';
                ctx.closePath();
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                currentPos1++;
                nextPos = sortedQueue[currentPos1];
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
    }

    $('#totalHeadMovement').text(totalHeadMovement);
};