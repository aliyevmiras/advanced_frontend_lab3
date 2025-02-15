import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const InteractiveScene = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const cubesRef = useRef([]); // Ref to store the cubes

  // Variables for camera rotation
  const cameraRotation = useRef({ angleX: 0, angleY: 0, radius: 5, isDragging: false });

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('lightblue');

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 500, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 5, 10); // Position the camera higher and back
    camera.lookAt(0, 0, 0); // Make the camera look at the center of the scene

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, 500);

    // Append the canvas to the container
    if (containerRef.current && !containerRef.current.contains(renderer.domElement)) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Lighting
    // 1. Ambient Light (soft overall light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
    scene.add(ambientLight);

    // 2. Directional Light (sun-like light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color, Intensity
    directionalLight.position.set(5, 5, 5); // Position the light
    directionalLight.castShadow = true; // Enable shadows (optional)
    scene.add(directionalLight);

    // 3. Point Light (light bulb effect)
    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Color, Intensity, Distance
    pointLight.position.set(-5, 5, 5); // Position the light
    scene.add(pointLight);

    // Cubes
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    const cubes = colors.map((color, index) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (index - 1) * 2; // Position cubes in a row
      cube.castShadow = true; // Enable shadow casting (optional)
      cube.receiveShadow = true; // Enable shadow receiving (optional)
      scene.add(cube);
      return cube;
    });
    cubesRef.current = cubes; // Store cubes in the ref

    // Click handler
    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(cubes);

      if (intersects.length > 0) {
        const cube = intersects[0].object;
        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        cube.material.color = randomColor;
      }
    };

    renderer.domElement.addEventListener('click', onClick);

    // Mouse down handler
    const onMouseDown = () => {
      cameraRotation.current.isDragging = true;
    };

    // Mouse up handler
    const onMouseUp = () => {
      cameraRotation.current.isDragging = false;
    };

    // Mouse move handler
    const onMouseMove = (event) => {
      if (cameraRotation.current.isDragging) {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // Update camera angles based on mouse movement
        cameraRotation.current.angleX -= movementX * 0.01; // Horizontal rotation
        cameraRotation.current.angleY -= movementY * 0.01; // Vertical rotation

        // Clamp vertical rotation to avoid flipping
        cameraRotation.current.angleY = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, cameraRotation.current.angleY)
        );
      }
    };

    // Add mouse event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate all cubes at the same speed
      const cubeRotationSpeed = 0.01; // Speed of cube rotation
      cubesRef.current.forEach((cube) => {
        cube.rotation.x += cubeRotationSpeed;
        cube.rotation.y += cubeRotationSpeed;
      });

      // Update camera position based on mouse drag
      const { angleX, angleY, radius } = cameraRotation.current;
      camera.position.x = radius * Math.cos(angleX) * Math.cos(angleY);
      camera.position.y = radius * Math.sin(angleY);
      camera.position.z = radius * Math.sin(angleX) * Math.cos(angleY);
      camera.lookAt(0, 0, 0); // Make the camera always look at the center

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();

      // Remove all objects from the scene
      while (scene.children.length > 0) {
        const object = scene.children[0];
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      }

      // Remove the canvas from the DOM
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '500px' }} />
  );
};

export default React.memo(InteractiveScene);