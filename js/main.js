var disk = {
    name: "",
    memory: 0,
	used: 0,
    blockSize : 0,
    position: 0
}

var memoryValue = "KB";
var processHight = 0;
var ProcessCount = -1;
var width = 1000;
var position = 0;
var counter = 0;
//var point = 0;

function Process(){
	this.name = "";
	this.memory = 0;
	this.ProcessId = 0;
}

$(document).ready(function () {
    $('h3').textillate({ in: { effect: 'fadeIn' } });
    changeName();
    $('.disk').hide();

    createDisk('Test1', 100, 53);

    $('#name').keyup(function(){changeName()});
	$('#name2').keyup(function(){changeProcessName()});

    $('#create-disk').click(function() {
        createDisk($('#name').val(), $('#memory div select').val());
    });

    $('#new-point-button').click(function() {
        var value = $('#new-point-value').val();
        addPoint(value);
    });

});

function createDisk(diskName, memory, startingPosition) {
    if(diskName == "" || diskName == null) {
        diskName = ("Fancy Pancy disk");
    }
    disk.name = diskName;
    disk.memory = memory;
    disk.position = startingPosition;
    $('.disk').show();
    createLineSegments();
    $('#new-disk-button').hide();
    $('#disk-name-heading').text(diskName);
    $('#disk-name-heading').textillate({ in: { effect: 'fadeIn' } });
    addPath(disk.position);
    addToQueue(disk.position, true);
}

function addStartingPoint(memory) {
    $('.point:eq('+ memory +')').css('visibility', 'visible');
}

function addPoint(memory) {
    if(validateRange(memory)) {
        $('.point:eq('+ memory +')').css('visibility', 'visible');
        drawLine(memory);
        counter++;
        addPath(memory);
        addToQueue(memory);
    } else {
        alert('Please enter value that is in range 0 - ' + disk.memory);
    }
}

function drawLine(memory) {
    var length = Math.sqrt(((disk.position - memory) * disk.blockSize)*((disk.position - memory) * disk.blockSize) + (0 - 10)*(0 - 10) + 5);
    var angle  = Math.atan2(10, (memory - disk.position) * disk.blockSize) * 180 / Math.PI;
    var transform = 'rotate(' + angle + 'deg)';

    var id = 'line' + counter;

    var line = $('<div>')
        .addClass('line')
        .attr('id', id)
        .css({
            'position': 'relative',
            'transform': transform
        })
        .width(0)
        .offset({left: Math.min(disk.position * disk.blockSize, memory * disk.blockSize), top: 0});

    move('#' + id, length);

    disk.position = memory;

    $('#path1').append(line);
}

function createLineSegments() {
    disk.blockSize = ($('#ruler1').width() - 2) / disk.memory;
    for(var i = 0; i < disk.memory; i++) {
        $('#ruler1').append('<div class="point" style="float: left;"></div>');
    }
    $('.point').css('width', disk.blockSize);
    $('.point').css('visibility', 'hidden');
    addStartingPoint(0);
    addStartingPoint(disk.memory);
}

function changeName() {
    var name = $('#name').val();
    if(name == "" || name == null) {
        $('#disk-name').text("Fancy Pancy disk");
    } else {
        $('#disk-name').text(name);
    }
}

function validateRange(data) {
    if(data == parseInt(data, 10)) {
        if(data >= 0 && data <= disk.memory) {
            return true;
        }
    }
    return false;
}

function addPath(value) {
    $('#path1').append('<div class="circle" style="margin-left: '+ (value * disk.blockSize) +'px;"></div>');
}

function addToQueue(value, first) {
    $('.queue').append((first ? '' : ', ') + value);
}

function move(elem, length) {

    var left = 0

    function frame() {
        left++  // update parameters
        $(elem).width(left);// show frame
        if (left >= length)  // check finish condition
        clearInterval(id)
    }

    var id = setInterval(frame, 1) // draw every 10ms
}
