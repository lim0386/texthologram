		/* JAVASCRIPT CODE for video */
		// var elementToShare = document.querySelector('#effect1');

		var elementToShare = document.querySelector('canvas');

		var recorder = RecordRTC(elementToShare, {
		  type: 'canvas',
		});

		document.getElementById('startRecording').onclick = function() {
			group.rotation.x = 0;
		  group.rotation.y = 0;
			this.disabled = true;

		  isRecordingStarted = true;
		  isStoppedRecording = false;
		  recorder.startRecording();

		  // document.getElementById('stopRecording').disabled = false;
		};

		document.getElementById('stopRecording').onclick = function() {
			console.log(group.rotation.y);
		  this.disabled = true;

		  isStoppedRecording = true;
		  recorder.stopRecording(function(url) {
				var d = new Date();
		    var blob = recorder.getBlob();
				// var fileName = d + '.webm';
				var fileName = d + '.mp4';

            invokeSaveAsDialog(this.getBlob(), fileName);

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
