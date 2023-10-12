import * as THREE from '../../node_modules/three/build/three.module.js';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();





renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.body.appendChild(renderer.domElement);

const verticesOfCube = [
    -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
    -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
];

const indicesOfFaces = [
    2,1,0,    0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
];

const geometry = new THREE.PolyhedronGeometry( verticesOfCube, indicesOfFaces, 18, 1 );

// Create a sphere with a custom shader material

const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
const light = new THREE.PointLight( 0xffffff, 20, 100 );
light.position.set( 30, 30, 30 );
scene.add(light);
const light2 = new THREE.AmbientLight( 0x404040, 0.04 ); // soft white light
scene.add( light2 );

// Create an AudioContext and Analyser
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Create an Audio source and connect it to the AudioContext
const audioLoader = new THREE.AudioLoader();
const audioSource = new THREE.Audio(audioListener);
audioListener.add(audioSource);


const playButton = document.getElementById('playButton');

playButton.addEventListener('click', () => {
audioLoader.load(songData.fileUrl, function (buffer) {
  audioSource.setBuffer(buffer);
  audioSource.setLoop(true);
  audioSource.setVolume(1); // Adjust the volume as needed
  audioSource.play();
})});
// Create an AudioAnalyser
const analyser = new THREE.AudioAnalyser(audioSource, 32);



const stars = [];

function addStar (){
	const geometry=new THREE.SphereGeometry(0.5,25,25);
	const material = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff})
	const star = new THREE.Mesh(geometry,material);

	const [x,y,z] = Array(3).fill().map(()=>THREE.MathUtils.randFloatSpread(150))
	star.position.set(x,y,z);
	const orbitSpeed = (Math.random() * (0.01 - 0.001) + 0.0004);

	stars.push({ star, orbitSpeed });
	scene.add(star);
}

Array(200).fill().forEach(addStar);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Get the average frequency
  const averageFrequency = analyser.getAverageFrequency();
  const getFrequencyData = analyser.getFrequencyData();

  stars.forEach(({ star, orbitSpeed }) => {
	const currSpeed = orbitSpeed/6 ;
    const angle = Date.now() * currSpeed;
    const radius = 85; // Adjust this to control the orbit radius
    star.position.x = radius * Math.cos(angle);
    star.position.y = radius * Math.sin(angle);
	star.scale.set(1+orbitSpeed/3, 1+orbitSpeed/3,1+orbitSpeed/3)
  });

  // Modify the sphere's vertices and color based on the audio data
  sphere.scale.set(1 + averageFrequency / 1000, 1 + averageFrequency / 200, 1 + averageFrequency / 200);
  sphere.rotation.x += averageFrequency / 1000;
  sphere.rotation.y += averageFrequency / 1000;
  sphere.castShadow;
  sphere.material.color.setRGB(
    getFrequencyData[4],
    (sphere.scale.y)/1.5,
	100 - averageFrequency
  );

  

  renderer.render(scene, camera);
}

// Camera setup
camera.position.z = 60;

// Start the animation
animate();