import * as THREE from '../../node_modules/three/build/three.module.js';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

scene.background = new THREE.Color(0x977FD9);

renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.body.appendChild(renderer.domElement);

// Create a sphere with a custom shader material
const geometry = new THREE.SphereGeometry(2, 64, 64);
const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);


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



// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Get the average frequency
  const averageFrequency = analyser.getAverageFrequency();
  const getFrequencyData = analyser.getFrequencyData();
	


  // Modify the sphere's vertices and color based on the audio data
  sphere.scale.set(1 + averageFrequency / 500, 1 + averageFrequency / 200, 1 + averageFrequency / 200);
  sphere.rotation.x += averageFrequency / 1000;
  sphere.rotation.y += averageFrequency / 1000;
  sphere.castShadow;
  sphere.material.color.setRGB(
    sphere.scale.y-sphere.scale.x,
    (sphere.scale.y)/1.5,
	100 - averageFrequency
  );

  

  renderer.render(scene, camera);
}

// Camera setup
camera.position.z = 5;

// Start the animation
animate();