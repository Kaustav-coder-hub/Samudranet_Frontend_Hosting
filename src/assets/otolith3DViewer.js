// Make the function globally available for use in React components
window.initOtolith3DViewer = function(encodedData) {
  // Decode base64 encoded JSON data
  const jsonData = atob(encodedData);
  const data = JSON.parse(jsonData);
  
  // Extract the XYZ coordinates and dimensions
  const { x, y, z, width, height } = data;
  
  // Create a scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);
  
  // Create a camera
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 2;
  
  // Set up renderer
  const container = document.getElementById('otolith-3d-viewer');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // Create a material
  const material = new THREE.MeshPhongMaterial({
    color: 0x0088ff,
    shininess: 70,
    specular: 0x004488,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  
  // Create geometry from the points
  const geometry = new THREE.BufferGeometry();
  
  // Center the model around origin
  const xOffset = width / 2;
  const yOffset = height / 2;
  
  const positions = [];
  const indices = [];
  
  // Create a 2D grid of positions
  const positions2D = Array(height).fill().map(() => Array(width).fill(null));
  
  // Fill the grid with actual positions
  for (let i = 0; i < x.length; i++) {
    const xVal = (x[i] - xOffset) / Math.max(width, height) * 2;
    const yVal = (y[i] - yOffset) / Math.max(width, height) * 2;
    const zVal = z[i] * 0.5; // Scale Z to make it more visible
    
    positions.push(xVal, zVal, yVal); // Note: Y and Z are swapped for better orientation
    
    // Store in 2D grid if within bounds
    const xIdx = x[i];
    const yIdx = y[i];
    if (xIdx >= 0 && xIdx < width && yIdx >= 0 && yIdx < height) {
      positions2D[yIdx][xIdx] = i;
    }
  }
  
  // Create faces (triangles) from the grid
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const topLeft = positions2D[y][x];
      const topRight = positions2D[y][x + 1];
      const bottomLeft = positions2D[y + 1][x];
      const bottomRight = positions2D[y + 1][x + 1];
      
      if (topLeft !== null && topRight !== null && bottomLeft !== null) {
        indices.push(topLeft, topRight, bottomLeft);
      }
      
      if (topRight !== null && bottomRight !== null && bottomLeft !== null) {
        indices.push(topRight, bottomRight, bottomLeft);
      }
    }
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  
  // Create mesh and add to scene
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  // Add orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.maxPolarAngle = Math.PI / 2;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  window.addEventListener('resize', onWindowResize, false);
  
  // Initialize animation
  animate();
  
  // Expose rotation controls to window object
  window.rotateOtolith3D = function(direction) {
    const rotationSpeed = 0.3; // Radians
    if (direction === 'left') {
      mesh.rotation.y -= rotationSpeed;
    } else if (direction === 'right') {
      mesh.rotation.y += rotationSpeed;
    } else if (direction === 'up') {
      mesh.rotation.x -= rotationSpeed;
    } else if (direction === 'down') {
      mesh.rotation.x += rotationSpeed;
    }
  };
  
  window.resetOtolith3D = function() {
    mesh.rotation.set(0, 0, 0);
    controls.reset();
  };
};
