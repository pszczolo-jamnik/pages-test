
import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.03, 1000);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.minDistance = 0.1;
controls.maxDistance = 50;

// Handle file input
const fileInput = document.getElementById('fileInput');
const loader = new PLYLoader();

let currentPoints = null;

loader.setCustomPropertyNameMapping( {
    generation: ['generation'],
});

loader.load(
    'flea_test_0.ply',
    function (geometry) {
        if (currentPoints) {
            scene.remove(currentPoints);
        }

        // Extract the 'generation' attribute
        const generationAttribute = geometry.getAttribute('generation');
        const colors = [];
        const color = new THREE.Color();

        for (let i = 0; i < generationAttribute.count; i++) {
            const generation = generationAttribute.getX(i);
            color.setHSL(generation * 0.0018 + 0.35, 0.8, 0.5); // Adjust color mapping as needed
            colors.push(color.r, color.g, color.b);
        }

        // Create a BufferAttribute for the colors
        const colorAttribute = new THREE.Float32BufferAttribute(colors, 3);
        geometry.setAttribute('color', colorAttribute);

        // Create points material with vertex colors
        const material = new THREE.PointsMaterial({
            size: 0.0005,
            vertexColors: true
        });

        currentPoints = new THREE.Points(geometry, material);

        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        currentPoints.position.sub(center);

        const box = geometry.boundingBox;
        const maxDim = Math.max(
            box.max.x - box.min.x,
            box.max.y - box.min.y,
            box.max.z - box.min.z
        );
        camera.position.z = maxDim * 0.9;
        controls.target.set(0, 0, 0);
        controls.update();

        scene.add(currentPoints);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading PLY file:', error);
    }
);


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();