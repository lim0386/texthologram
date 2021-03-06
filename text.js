//effect video loading
var videoSource = new Array();
videoSource[0] = 'video/01.mp4';
videoSource[1] = 'video/02.mp4';
videoSource[2] = 'video/03.mp4';
var videoCount = videoSource.length;

THREE.Cache.enabled = true;
var pointLight; //color of text
var stats, permalink, hex;
var camera, cameraTarget, scene, renderer;
var group, textMesh1, textMesh2, textGeo, materials;
var firstLetter = false;
var text = "",
  height = 20,
  size = 50,
  hover = 30,
  curveSegments = 4,
  bevelThickness = 2,
  bevelSize = 1.5,
  bevelEnabled = true,
  font = undefined,
  fontName = "NanumMyeongjo", // helvetiker, optimer, gentilis, droid sans, droid serif
  fontWeight = "Regular"; // normal bold

var rotationX = 0;
var rotationY = 0;

var buttonP = 0;
var pX = 0;
var pY = 0;

var textX = 0;
var textY = -40; //camera
var textZ = 700;

var video;

var mirror = true;
var fontMap = {
  "NanumMyeongjo": 0,
  "NanumGothic": 1,
  "TmonMonsoriBlack": 2
};

var weightMap = {
  "Regular": 0,
  "Bold": 1
};
// var reverseFontMap = [];
// var reverseWeightMap = [];
// for (var i in fontMap) reverseFontMap[fontMap[i]] = i;
// for (var i in weightMap) reverseWeightMap[weightMap[i]] = i;
// var targetRotation = 0;
// var targetRotationOnMouseDown = 0;
// var windowHalfX = window.innerWidth / 2;
// var fontIndex = 1;

init();
buttons();
animate();

// document.getElementById("effect1").hidden = true;
// document.getElementById("effect2").hidden = true;
// document.getElementById("effect3").hidden = true;

function decimalToHex(d) { //text color
  var hex = Number(d).toString(16);
  hex = "000000".substr(0, 6 - hex.length) + hex;
  return hex.toUpperCase();
}

function init() {

  const container = document.createElement('div');
  document.getElementById("myCanvas").appendChild(container);

  // CAMERA
  camera = new THREE.PerspectiveCamera(30, 1, 3, 10000);
  camera.position.set(textX, textY, textZ);
  cameraTarget = new THREE.Vector3(0, 0, 0); //Camera XYZ

  // SCENE
  scene = new THREE.Scene();
  scene.fog = null;
  // here to control background video-but need overthings!
  video = document.getElementById('myVid');


  var geometry = new THREE.BoxBufferGeometry(700, 700, -600); //background video size
  // geometry.scale( 1, 0.5, 1 );
  var texture = new THREE.VideoTexture(myVid);
  var material = new THREE.MeshBasicMaterial({
    map: texture
  });
  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // LIGHTS
  var dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight.position.set(100, 100, 1).normalize();
  scene.add(dirLight);

  var dirLight2 = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight2.position.set(599, 100, 200).normalize();
  scene.add(dirLight2);
  var dirLight3 = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight3.position.set(0, 100, 1).normalize();
  scene.add(dirLight3);
  var dirLight4 = new THREE.DirectionalLight(0xffffff, 0.125);
  dirLight4.position.set(599, 100, 1).normalize();
  scene.add(dirLight4);



  pointLight = new THREE.PointLight(0xffffff, 1.5);
  pointLight.position.set(400, 100, 90);
  scene.add(pointLight);

  // pointLight3 = new THREE.PointLight(0xffffff, 1.5);
  // pointLight3.position.set(522, 1, -10000);
  // scene.add(pointLight3);
  // pointLight2 = new THREE.PointLight(0xffffff, 1.5);
  // pointLight2.position.set(0, 1, -10000);
  // scene.add(pointLight2);

  // Get text from hash
  var hash = document.location.hash.substr(1);

  if (hash.length == 0) {
    pointLight.color.setHex(0xff0000);
    hex = decimalToHex(pointLight.color.getHex());
  }

  materials = [
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true
    }), // front
    new THREE.MeshPhongMaterial({
      color: 0xffffff
    }) // side
  ];

  group = new THREE.Group();
  group.position.y = 0;

  scene.add(group);

  loadFont();

  var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10000, 10000),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0, //�
      transparent: true
    })
  );
  plane.position.y = 100;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane); //X

  // RENDERER
  renderer = new THREE.WebGLRenderer({
    // antialias: true
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(522, 522); //original size
  container.appendChild(renderer.domElement);
  // STATS
  stats = new Stats();
}

//video background
function animate() {
  requestAnimationFrame(animate);
  update();
}

function update() {
  renderer.render(scene, camera);
}

function buttons() {
  document.getElementById("buttonRed").addEventListener('click', function() {
    pointLight.color.setHex(0xff0000);
    console.log(pointLight.color + "Red");
  }, false);

  document.getElementById("buttonYellow").addEventListener('click', function() {
    pointLight.color.setHex(0xffde6c);
    console.log("Yellow")
  }, false);

  document.getElementById("buttonGreen").addEventListener('click', function() {
    pointLight.color.setHex(0x00ff00);
  }, false);

  document.getElementById("buttonAqua").addEventListener('click', function() {
    pointLight.color.setHex(0x00ffff);
  }, false);

  document.getElementById("buttonBlue").addEventListener('click', function() {
    pointLight.color.setHex(0x5d8bff);
  }, false);

  document.getElementById("buttonViolet").addEventListener('click', function() {
    pointLight.color.setHex(0xb562d0);
  }, false);

  document.getElementById("buttonGray").addEventListener('click', function() {
    pointLight.color.setHex(0x808080);
  }, false);

  document.getElementById("mySize").addEventListener('click', function() {
    console.log(document.getElementById("mySize").value);
    size = document.getElementById("mySize").value;
    refreshText();
  }, false);
  document.getElementById("myThick").addEventListener('click', function() {
    bevelThickness = document.getElementById("myThick").value;
    console.log(document.getElementById("myThick").value);
    refreshText();
  }, false);
}

function boolToNum(b) {
  return b ? 1 : 0;
}

function myText() {
  text = document.getElementById("textInput").value;
  refreshText();
}

function fontOne() {
  fontName = "NanumMyeongjo";
  loadFont();
}

function fontTwo() {
  fontName = "NanumGothic";
  loadFont();
}

function fontThree() {
  fontName = "TmonMonsoriBlack";
  loadFont();
}

function textRegular() {
  fontWeight = "Regular";
  loadFont();
}

function textBold() {
  fontWeight = "Bold";
  loadFont();
}

function loadFont() {
  var loader = new THREE.FontLoader();
  loader.load('fonts/' + fontName + '_' + fontWeight + '.typeface.json', function(response) {
    font = response;
    refreshText();
  });
}

function createText() {
  textGeo = new THREE.TextGeometry(text, {
    font: font,
    size: size,
    height: height,
    curveSegments: curveSegments,

    bevelThickness: bevelThickness,
    bevelSize: bevelSize,
    bevelEnabled: bevelEnabled
  });
  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  if (!bevelEnabled) {
    var triangleAreaHeuristics = 0.1 * (height * size);
    for (var i = 0; i < textGeo.faces.length; i++) {
      var face = textGeo.faces[i];
      if (face.materialIndex == 1) {
        for (var j = 0; j < face.vertexNormals.length; j++) {
          face.vertexNormals[j].z = 0;
          face.vertexNormals[j].normalize();
        }
        var va = textGeo.vertices[face.a];
        var vb = textGeo.vertices[face.b];
        var vc = textGeo.vertices[face.c];
        var s = THREE.GeometryUtils.triangleArea(va, vb, vc);

        if (s > triangleAreaHeuristics) {
          for (var j = 0; j < face.vertexNormals.length; j++) {
            face.vertexNormals[j].copy(face.normal);
          }
        }
      }
    }
  }

  var centerOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
  textGeo = new THREE.BufferGeometry().fromGeometry(textGeo);
  textMesh1 = new THREE.Mesh(textGeo, materials);
  textMesh1.position.x = centerOffset;
  //textMesh1.position.y = hover; //hover = 30
  textMesh1.position.y = -20; //hover
  textMesh1.position.z = 0;
  textMesh1.rotation.x = 0;
  // textMesh1.rotation.y = Math.PI * 2;
  textMesh1.rotation.y = 0;
  group.add(textMesh1);

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
  group.remove(textMesh1);
  if (mirror) group.remove(textMesh2);
  if (!text) return;
  createText();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  // group.rotation.y += rotation; //ȸ���ӵ�
  group.rotation.x += rotationX;
  group.rotation.y += rotationY;

  console.log(buttonP);
  // console.log(group.rotation.x+", "+group.rotation.y);
  if (buttonP == 1) {
    // console.log("I 1")
    if (group.rotation.y > 6) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
    if (group.rotation.y < -6) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
    if (group.rotation.x > 6) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
  }
  if (buttonP == 2) {
    if (group.rotation.y > 12) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
    if (group.rotation.y < -12) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
    if (group.rotation.x > 12) {
      stopRecording();
      // document.getElementById('stopRecording').onclick;
    }
  }
  // if (buttonP == 3) {
  if (group.rotation.y > 18) {
    stopRecording();
    // document.getElementById('stopRecording').onclick;
  }
  if (group.rotation.y < -18) {
    stopRecording();
    // document.getElementById('stopRecording').onclick;
  }
  if (group.rotation.x > 18) {
    stopRecording();
    // document.getElementById('stopRecording').onclick;
  }
  // }


  camera.lookAt(cameraTarget);
  renderer.clear();
  renderer.render(scene, camera);
}

function renderX() {
  group.rotation.x = 0;
  group.rotation.y = 0;
  rotationX = 0.01;
  rotationY = 0;
}

function renderY() {
  group.rotation.x = 0;
  group.rotation.y = 0;
  rotationX = 0;
  rotationY = 0.01;
}

function renderZero() {
  group.rotation.x = 0;
  group.rotation.y = 0;
  rotationX = 0;
  rotationY = -0.01;
}

function effectOne() {
  document.getElementById("myVid").setAttribute("src", videoSource[0]);
  document.getElementById("myVid").load();
  document.getElementById("myVid").loop = true
  document.getElementById("myVid").play();

  refreshText();
}

function effectTwo() {
  document.getElementById("myVid").setAttribute("src", videoSource[1]);
  document.getElementById("myVid").load();
  document.getElementById("myVid").loop = true
  document.getElementById("myVid").play();

  refreshText();
}

function effectThree() {
  document.getElementById("myVid").setAttribute("src", videoSource[2]);
  document.getElementById("myVid").load();
  document.getElementById("myVid").loop = true
  document.getElementById("myVid").play();
  refreshText();
}

function reset() {
  window.location.reload();
  // group.rotation.x = 0;
  // group.rotation.y = 0;
}

function buttonStop() {
  console.log("STOPSTOPSTOP");
  if (group.rotation.y < 6 || group.rotation.y > -6 || group.rotation.x < 6) {
    buttonP = 1;
  }
  if (group.rotation.y < 12 && group.rotation.y > 6) {
    buttonP = 2;
  }
  if (group.rotation.y > -12 && group.rotation.y < -6) {
    buttonP = 2;
  }
  if (group.rotation.x < 12 && group.rotation.x > 6) {
    buttonP = 2;
  }
  // if (group.rotation.y > 12) {
  //   buttonP = 3;
  // }
  // if (group.rotation.y < -12) {
  //   buttonP = 3;
  // }
  // if (group.rotation.x > 12) {
  //   buttonP = 3;
  // }
}
