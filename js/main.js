var disk = {
    name: "",
    memory: 0,
	used: 0,
    blockSize : 0
}

var memoryValue = "KB";
var processHight = 0;
var ProcessCount = -1;
var width = 1000;
var position = 0;
var counter = 0;
var point = 0;

function Process(){
	this.name = "";
	this.memory = 0;
	this.ProcessId = 0;
}

$(document).ready(function () {
    $('h3').textillate({ in: { effect: 'fadeIn' } });
    changeName();
    $('.disk').hide();

    createDisk('Test1', 100);

    $('#name').keyup(function(){changeName()});
	$('#name2').keyup(function(){changeProcessName()});

    $('#create-disk').click(function() {
        createDisk($('#name').val(), $('#memory div select').val());
    });

    $('#new-point-button').click(function() {
        var value = $('#new-point-value').val();
        if(validateRange(value)) {
            addPoint(value);
            addPath(value);
        } else {
            alert('Please enter value that is in range 0 - ' + disk.memory);
        }
    });

});

function createDisk(diskName, memory) {
    if(diskName == "" || diskName == null) {
        diskName = ("Fancy Pancy disk");
    }
    disk.name = diskName;
    disk.memory = memory;
    $('.disk').show();
    createLineSegments();
    $('#new-disk-button').hide();
    $('#disk-name-heading').text(diskName);
    $('#disk-name-heading').textillate({ in: { effect: 'fadeIn' } });
}

function addStartingPoint(memory) {
    $('.point:eq('+ memory +')').css('visibility', 'visible');
}

function addPoint(memory) {
    $('.point:eq('+ memory +')').css('visibility', 'visible');
    drawLine(memory);
    counter++;
}

function drawLine(memory) {
    var length = Math.sqrt((point - memory * disk.blockSize)*(point - memory * disk.blockSize) + (0 - 10)*(0 - 10) + 5);
    var angle  = Math.atan2(10, memory * disk.blockSize - point) * 180 / Math.PI;
    var transform = 'rotate('+angle+'deg)';

    var line = $('<div>')
        .addClass('line')
        .css({
            'position': 'relative',
            'transform': transform
        })
        .width(length)
        .offset({left: Math.min(point, memory * disk.blockSize), top: 0});

    point = memory * disk.blockSize;

    $('#path1').append(line);
}

function createLineSegments() {
    disk.blockSize = ($('#line1').width() - 2) / disk.memory;
    for(var i = 0; i < disk.memory; i++) {
        $('#line1').append('<div class="point" style="float: left;"></div>');
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