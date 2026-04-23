document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('body-map-container');
    if (!container) return;

    // Setup Scene
    const scene = new THREE.Scene();
    
    // Setup Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 8); 

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Setup Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 2); 
    dirLight2.position.set(-5, 0, -5);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x3b82f6, 1.5); 
    dirLight3.position.set(0, -5, 5);
    scene.add(dirLight3);

    // Materials
    const baseMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.9, 
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const hoverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 0.6,
        emissive: 0x2563eb,
        emissiveIntensity: 0.4
    });

    // Create Body Parts
    const humanoid = new THREE.Group();
    const interactableObjects = [];

    function createBodyPart(geometry, name, yPos, xPos = 0, zPos = 0) {
        const mesh = new THREE.Mesh(geometry, baseMaterial.clone());
        mesh.position.set(xPos, yPos, zPos);
        mesh.name = name;
        humanoid.add(mesh);
        interactableObjects.push(mesh);
        return mesh;
    }

    // Proportions
    const headGeo = new THREE.SphereGeometry(0.4, 32, 32);
    createBodyPart(headGeo, 'Head', 3.2);

    const neckGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16);
    createBodyPart(neckGeo, 'Neck', 2.7);

    const torsoGeo = new THREE.CapsuleGeometry(0.6, 1.2, 4, 16);
    const torso = createBodyPart(torsoGeo, 'Chest & Abdomen', 1.6);

    const armGeo = new THREE.CapsuleGeometry(0.18, 1.3, 4, 16);
    createBodyPart(armGeo, 'Right Arm', 1.7, -0.9);
    createBodyPart(armGeo, 'Left Arm', 1.7, 0.9);

    const legGeo = new THREE.CapsuleGeometry(0.22, 1.8, 4, 16);
    createBodyPart(legGeo, 'Right Leg', -0.3, -0.35);
    createBodyPart(legGeo, 'Left Leg', -0.3, 0.35);

    humanoid.position.y = -1;
    scene.add(humanoid);

    // Animation variables
    let targetRotation = 0;
    const rotationSpeed = 0.05;

    // Interaction variables
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;
    const tooltip = document.getElementById('body-tooltip');

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Handle Mouse Move 
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        tooltip.style.left = (event.clientX - rect.left) + 'px';
        tooltip.style.top = (event.clientY - rect.top - 15) + 'px';

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(interactableObjects);

        if (intersects.length > 0) {
            container.style.cursor = 'pointer';
            const object = intersects[0].object;

            if (hoveredObject !== object) {
                if (hoveredObject) {
                    hoveredObject.material = baseMaterial;
                }
                hoveredObject = object;
                hoveredObject.material = hoverMaterial;
                
                tooltip.textContent = hoveredObject.name;
                tooltip.style.opacity = '1';
            }
        } else {
            container.style.cursor = 'grab';
            if (hoveredObject) {
                hoveredObject.material = baseMaterial;
                hoveredObject = null;
                tooltip.style.opacity = '0';
            }
        }
    });

    container.addEventListener('mouseleave', () => {
        if (hoveredObject) {
            hoveredObject.material = baseMaterial;
            hoveredObject = null;
            tooltip.style.opacity = '0';
        }
    });

    container.addEventListener('click', () => {
        if (hoveredObject) {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                chatInput.value = `I am experiencing symptoms in my ${hoveredObject.name}. Specifically, `;
                chatInput.focus();
                
                chatInput.parentElement.style.boxShadow = '0 0 15px var(--primary)';
                setTimeout(() => {
                    chatInput.parentElement.style.boxShadow = '';
                }, 1000);
            }
        }
    });

    // Handle Rotate Button
    const rotateBtn = document.getElementById('rotate-btn');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            targetRotation += Math.PI; // Rotate 180 degrees
        });
    }

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        humanoid.position.y = -1 + Math.sin(elapsedTime * 1.5) * 0.05;

        if (Math.abs(humanoid.rotation.y - targetRotation) > 0.01) {
            humanoid.rotation.y += (targetRotation - humanoid.rotation.y) * rotationSpeed;
        }

        renderer.render(scene, camera);
    }

    animate();
});
