var elementToRecord = document.getElementById('start');
var canvas2d = document.getElementById('background-canvas');
var context = canvas2d.getContext('2d');

// canvas2d.width = elementToRecord.clientWidth;
// canvas2d.height = elementToRecord.clientHeight;

var isRecordingStarted = false;
var isStoppedRecording = false;

(function looper() {
    if(!isRecordingStarted) {
        return setTimeout(looper, 500);
    }

    html2canvas(elementToRecord).then(function(canvas) {
        context.clearRect(270, 130, 520, 520);
        context.drawImage(canvas, 270, 130, 520, 520);

        if(isStoppedRecording) {
            return;
        }

        requestAnimationFrame(looper);
    });
})();

var recorder = new RecordRTC(canvas2d, {
    type: 'canvas'
});

document.getElementById('startRecording').onclick = function() {
    this.disabled = true;

    isStoppedRecording =false;
    isRecordingStarted = true;

    recorder.startRecording();
    document.getElementById('stopRecording').disabled = false;
};

document.getElementById('stopRecording').onclick = function() {
    this.disabled = true;

    recorder.stopRecording(function() {
        isRecordingStarted = false;
        isStoppedRecording = true;

        var blob = recorder.getBlob();
        // document.getElementById('preview-video').srcObject = null;
        var video = document.createElement('video');
		    video.src = URL.createObjectURL(blob);
		    video.setAttribute('style', 'position: absolute; width:520px; height:520px%; top:130px; left:270px');
		    var body = document.querySelector('body');

		    body.appendChild(video);
		    // document.getElementById("myVideo").appendChild(video);
		    video.controls = true;
		    video.play();
    });
};
