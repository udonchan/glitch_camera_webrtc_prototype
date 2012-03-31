var _video_element;
var _canvas;
var _glitchAmount = 5;

setTimeout(function() {
    video_element = document.getElementById("video");
    canvas = document.getElementById("dest");
    navigator.webkitGetUserMedia("video", successHandler, errorHandler);
},1);

successHandler = function (stream) {
    this.video_element.src = window.webkitURL.createObjectURL(stream);
    setInterval(draw, 1000);
}

errorHandler = function(error) {
    alert("This site rquires WebRTC. Please get Chrome Canary and set MediaStream available.");
}

draw = function () {
    width = video_element.videoWidth;
    height = video_element.videoHeight;
    canvas.width = width;
    canvas.height = height;

    //draw input image to output canvas
    outputBMD = new BitmapData(width, height);
    outputBMD.draw(video_element);

    //init inputBMD
    inputBMD = new BitmapData(width, height);
    inputBMD.draw(video_element);
    var maxOffset = _glitchAmount * _glitchAmount / 100 * width;

    for (i = 0; i < _glitchAmount * 2; i++) {
	var startY = getRandInt(0, height);
	var chunkHeight = getRandInt(1, height / 4);
	chunkHeight = Math.min(chunkHeight, height - startY);
	var offset = getRandInt(-maxOffset, maxOffset);
	if (offset == 0)
	    continue;
	if (offset < 0) {
	    //shift left
	    outputBMD.copyPixels(inputBMD, new Rectangle(-offset, startY, width + offset, chunkHeight), new Point(0, startY));
	    //wrap around
	    outputBMD.copyPixels(inputBMD, new Rectangle(0, startY, -offset, chunkHeight), new Point(width + offset,startY));
	} else {
	    //shuft right
	    outputBMD.copyPixels(inputBMD, new Rectangle(0, startY, width, chunkHeight), new Point(offset, startY));
	    //wrap around
	    outputBMD.copyPixels(inputBMD, new Rectangle(width - offset, startY, offset, chunkHeight), new Point(0, startY));
	}
    }

    var channel = getRandChannel();
    outputBMD.copyChannel(inputBMD, new Rectangle(0, 0, width, height), new Point(getRandInt(-_glitchAmount * 2, _glitchAmount * 2), getRandInt(-_glitchAmount * 2, _glitchAmount * 2)), channel, channel);

    //make brighter
    var brightMat=[
	2, 0, 0, 0, 0,
	0, 2, 0, 0, 0,
	0, 0, 2, 0, 0,
	0, 0, 0, 1, 0
    ];
    
    zeroPoint = new Point();
    brightnessFilter = new ColorMatrixFilter(brightMat);
    outputBMD.applyFilter(outputBMD, outputBMD.rect, zeroPoint, brightnessFilter);

    //Add Scan Lines
    var line = new Rectangle(0, 0, width, 1);

    for (i = 0; i < height; i++) {
	if (i % 2 == 0) {
	    line.y = i;
	    outputBMD.fillRect(line, 0);
	}
    }
    
    var context = canvas.getContext('2d');
    context.putImageData(outputBMD.data, 0, 0);
}

function getRandInt(min, max) {
    return (Math.floor(Math.random() * (max - min) + min));
}

function getRandChannel() {
    var r = Math.random();
    if (r < .33){
	return BitmapDataChannel.GREEN;
    }else if (r > .33 && r < .66){
	return BitmapDataChannel.RED;
    }else{
	return BitmapDataChannel.BLUE;
    }
}
