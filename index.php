<!DOCTYPE html>
<html lang="kr">
	<head>
		<title>three.js webgl - geometry - text</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<style>
			body {
				font-family: Monospace;
				background-color: #000;
				color: #fff;
				margin: 0px;
				overflow: hidden;
			}
			#info {
				position: absolute;
				top: 10px;
				width: 100%;
				text-align: center;
				z-index: 100;
				display:block;
			}
			#info a, .button { color: #f00; font-weight: bold; text-decoration: underline; cursor: pointer }
		</style>
    <script src="js/RecordRTC.js"></script>
    <script src="js/screenshot.js"></script>
	</head>
	<body>

		<div id="info">
			<input type="text" id="textInput" value="">
	    <button onclick="myText()">input</button><p>
			<input type="range" min="0" max="100" value="0" id="speed"><p>
			<span class="button" id="color">change color</span>,
			<span class="button" id="font">change font</span>,
			<span class="button" id="weight">change weight</span>

			<!-- <span class="button" id="bevel">change bevel</span><p> -->

		  <p><button type="button" id="startRecording" name="button">Start Recording</button>
			<button type="button" id="stopRecording" name="button" disabled>Stop Recording</button>
		</div>

		<script src="build/three.js"></script>
		<script src="js/GeometryUtils.js"></script>
		<script src="js/WebGL.js"></script>
		<script src="js/stats.min.js"></script>

		<script>
			if ( WEBGL.isWebGLAvailable() === false ) {
				document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			}
			THREE.Cache.enabled = true;
			var container, stats, permalink, hex;
			var camera, cameraTarget, scene, renderer;
			var group, textMesh1, textMesh2, textGeo, materials;
			var firstLetter = false;
			var text = "",
				height = 20,
				size = 70,
				hover = 30,
				curveSegments = 4,
				bevelThickness = 2,
				bevelSize = 1.5,
				bevelEnabled = true,
				font = undefined,
				fontName = "NanumGothic", // helvetiker, optimer, gentilis, droid sans, droid serif
				fontWeight = "bold"; // normal bold

			var mirror = true;
			var fontMap = {
				"NanumGothic": 0,
				"NanumMyeongjo": 1
				// "gentilis": 2,
				// "droid/droid_sans": 3,
				// "droid/droid_serif": 4
			};

			var weightMap = {
				"regular": 0,
				"bold": 1
			};
			var reverseFontMap = [];
			var reverseWeightMap = [];
			for ( var i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
			for ( var i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;
			var targetRotation = 0;
			var targetRotationOnMouseDown = 0;
			var windowHalfX = window.innerWidth / 2;
			var fontIndex = 1;
			init();
			animate();

			function decimalToHex( d ) {
				var hex = Number( d ).toString( 16 );
				hex = "000000".substr( 0, 6 - hex.length ) + hex;
				return hex.toUpperCase();
			}

			function init() {
				container = document.createElement( 'div' );
				document.body.appendChild( container );

				// CAMERA
				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
				camera.position.set( 0, 400, 700 );
				cameraTarget = new THREE.Vector3( 0, 150, 0 );

				// SCENE
				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x000000 );
				scene.fog = new THREE.Fog( 0x000000, 250, 1400 );

				// LIGHTS
				var dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
				dirLight.position.set( 0, 0, 1 ).normalize();
				scene.add( dirLight );
				var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
				pointLight.position.set( 0, 100, 90 );
				scene.add( pointLight );

				// Get text from hash
				var hash = document.location.hash.substr( 1 );

				if ( hash.length !== 0 ) {
					var colorhash = hash.substring( 0, 6 );
					var fonthash = hash.substring( 0, 1 );
					var weighthash = hash.substring( 7, 8 );
					var bevelhash = hash.substring( 8, 9 );
					var texthash = hash.substring( 10 );
					hex = colorhash;
					pointLight.color.setHex( parseInt( colorhash, 16 ) );
					fontName = reverseFontMap[ parseInt( fonthash ) ];
					fontWeight = reverseWeightMap[ parseInt( weighthash ) ];
					bevelEnabled = parseInt( bevelhash );
					// text = decodeURI( texthash );
					text = "";
				} else {
					pointLight.color.setHSL( Math.random(), 1, 0.5 );
					hex = decimalToHex( pointLight.color.getHex() );
				}

				materials = [
					new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
					new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
				];

				group = new THREE.Group();
				group.position.y = 100;

				scene.add( group );

				loadFont();

				var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 10000, 10000 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
				);
				plane.position.y = 100;
				plane.rotation.x = - Math.PI / 2;
				scene.add( plane );

				// RENDERER
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				// STATS
				stats = new Stats();
				document.getElementById( "color" ).addEventListener( 'click', function () {
					pointLight.color.setHSL( Math.random(), 1, 0.5 );
					hex = decimalToHex( pointLight.color.getHex() );
				}, false );
				document.getElementById( "font" ).addEventListener( 'click', function () {
					fontIndex ++;
					fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];
					loadFont();
				}, false );
				document.getElementById( "weight" ).addEventListener( 'click', function () {

					if ( fontWeight === "bold" ) {
						fontWeight = "regular";
					} else {
						fontWeight = "bold";
					}
					loadFont();
				}, false );

//soft
				// document.getElementById( "bevel" ).addEventListener( 'click', function () {
				// 	bevelEnabled = ! bevelEnabled;
				// 	refreshText();
				// }, false );
//soft

				window.addEventListener( 'resize', onWindowResize, false );
			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function boolToNum( b ) {
				return b ? 1 : 0;
			}

			function myText(){
				text = document.getElementById("textInput").value;
				refreshText();
			}

			function loadFont() {
				var loader = new THREE.FontLoader();
				loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
					font = response;
					refreshText();
				} );
			}

			function createText() {
				textGeo = new THREE.TextGeometry( text, {
					font: font,
					size: size,
					height: height,
					curveSegments: curveSegments,

					bevelThickness: bevelThickness,
					bevelSize: bevelSize,
					bevelEnabled: bevelEnabled
				} );
				textGeo.computeBoundingBox();
				textGeo.computeVertexNormals();

				if ( ! bevelEnabled ) {
					var triangleAreaHeuristics = 0.1 * ( height * size );
					for ( var i = 0; i < textGeo.faces.length; i ++ ) {
						var face = textGeo.faces[ i ];
						if ( face.materialIndex == 1 ) {
							for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
								face.vertexNormals[ j ].z = 0;
								face.vertexNormals[ j ].normalize();
							}
							var va = textGeo.vertices[ face.a ];
							var vb = textGeo.vertices[ face.b ];
							var vc = textGeo.vertices[ face.c ];
							var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

							if ( s > triangleAreaHeuristics ) {
								for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
									face.vertexNormals[ j ].copy( face.normal );
								}
							}
						}
					}
				}

				var centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
				textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );
				textMesh1 = new THREE.Mesh( textGeo, materials );
				textMesh1.position.x = centerOffset;
				textMesh1.position.y = hover;
				textMesh1.position.z = 0;
				textMesh1.rotation.x = 0;
				textMesh1.rotation.y = Math.PI * 2;
				group.add( textMesh1 );

				// if ( mirror ) {
				// 	textMesh2 = new THREE.Mesh( textGeo, materials );
				// 	textMesh2.position.x = centerOffset;
				// 	textMesh2.position.y = - hover;
				// 	textMesh2.position.z = height;
				// 	textMesh2.rotation.x = Math.PI;
				// 	textMesh2.rotation.y = Math.PI * 2;
				// 	group.add( textMesh2 );
				// }
			}

			function refreshText() {
				group.remove( textMesh1 );
				if ( mirror ) group.remove( textMesh2 );
				if ( ! text ) return;
				createText();
			}

			function animate() {
				requestAnimationFrame( animate );
				render();
				stats.update();
			}

			function render() {
        // var rotation = 0.01;
				var rotation = document.getElementById("speed").value*0.001;
				group.rotation.y += rotation; //회전속도
				camera.lookAt( cameraTarget );
				renderer.clear();
				renderer.render( scene, camera );
			}

		</script>

		<script type="text/javascript">
        /* JAVASCRIPT CODE for video */
        var elementToShare = document.querySelector('canvas');
        var recorder = RecordRTC(elementToShare, {
            type: 'canvas',
            showMousePointer: true
        });

        document.getElementById('startRecording').onclick = function() {
            this.disabled = true;

            isRecordingStarted = true;
            isStoppedRecording = false;
            recorder.startRecording();

            document.getElementById('stopRecording').disabled = false;
        };

        document.getElementById('stopRecording').onclick = function() {
            this.disabled = true;

            isStoppedRecording = true;
            recorder.stopRecording(function(url) {
                var blob = recorder.getBlob();
                console.log('blob', blob);

                var video = document.createElement('video');
                video.src = URL.createObjectURL(blob);
                video.setAttribute('style', 'height: 100%; position: absolute; top:0;');
                var body = document.querySelector('body');
                body.innerHTML = '';
                body.appendChild(video);
                video.controls = true;
                video.play();
            });
        };
    </script>
	</body>
</html>
