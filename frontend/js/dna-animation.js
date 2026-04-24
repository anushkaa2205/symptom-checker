const container = document.getElementById("dna-container");

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // Position camera to view DNA
    camera.position.set(0, 0, 45);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();

    // Premium solid materials for luxury healthcare look
    const nodeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2563eb, // blue-600
        metalness: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9
    });
    
    const linkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xbfdbfe, // blue-200
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.9
    });

    const numPairs = 45;
    const helixRadius = 3.5;
    const helixHeight = 1.3;

    // Create the smooth backbone curves
    class HelixCurve extends THREE.Curve {
        constructor(scale = 1, offset = 0) {
            super();
            this.scale = scale;
            this.offset = offset;
        }
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            const length = numPairs * helixHeight;
            const y = (t - 0.5) * length;
            const angle = t * numPairs * 0.4 + this.offset;
            const x = Math.cos(angle) * helixRadius;
            const z = Math.sin(angle) * helixRadius;
            return optionalTarget.set(x, y, z).multiplyScalar(this.scale);
        }
    }

    // Backbones
    const backboneGeo1 = new THREE.TubeGeometry(new HelixCurve(1, 0), 150, 0.4, 16, false);
    const backboneGeo2 = new THREE.TubeGeometry(new HelixCurve(1, Math.PI), 150, 0.4, 16, false);
    
    const backbone1 = new THREE.Mesh(backboneGeo1, nodeMaterial);
    const backbone2 = new THREE.Mesh(backboneGeo2, nodeMaterial);
    
    dnaGroup.add(backbone1);
    dnaGroup.add(backbone2);

    // Rungs (links) and spheres
    const linkGeo = new THREE.CylinderGeometry(0.15, 0.15, helixRadius * 2, 16);
    const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32);

    for (let i = 0; i < numPairs; i++) {
        const t = i / (numPairs - 1);
        const y = (t - 0.5) * numPairs * helixHeight;
        const angle = t * numPairs * 0.4;
        
        const x1 = Math.cos(angle) * helixRadius;
        const z1 = Math.sin(angle) * helixRadius;
        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;

        // Spheres on strands
        const node1 = new THREE.Mesh(sphereGeo, nodeMaterial);
        node1.position.set(x1, y, z1);
        dnaGroup.add(node1);
        
        const node2 = new THREE.Mesh(sphereGeo, nodeMaterial);
        node2.position.set(x2, y, z2);
        dnaGroup.add(node2);

        // Connecting rung
        const link = new THREE.Mesh(linkGeo, linkMaterial);
        link.position.set(0, y, 0);
        link.rotation.y = -angle;
        link.rotation.z = Math.PI / 2;
        dnaGroup.add(link);
    }
    
    // Position and angle the DNA diagonally across the screen to fit right-side SaaS layout
    dnaGroup.rotation.z = -Math.PI / 5; 
    dnaGroup.position.x = 10;
    dnaGroup.position.y = 0;
    scene.add(dnaGroup);
    
    // Background Floating Particles (Sexy and Attractive effect)
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for(let i = 0; i < particleCount * 3; i += 3) {
        // Spread particles across the background
        particlePositions[i] = (Math.random() - 0.5) * 80;     // x
        particlePositions[i+1] = (Math.random() - 0.5) * 80;   // y
        particlePositions[i+2] = (Math.random() - 0.5) * 50 - 10; // z (slightly pushed back)
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x8b5cf6, // Subtle purple tint matching the theme
        size: 0.2,
        transparent: true,
        opacity: 0.4,
        depthWrite: false
        // Blending is set dynamically in the render loop based on theme
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting for glass/premium effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x60a5fa, 2, 100);
    blueLight.position.set(-10, -10, 20);
    scene.add(blueLight);
    
    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.0005;
        mouseY = (event.clientY - windowHalfY) * 0.0005;
    });
    
    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.002;
        
        // Slow rotation for DNA
        dnaGroup.rotation.y += 0.0015;
        
        // Interactive tilt
        dnaGroup.rotation.x += 0.05 * (mouseY * 0.5 - dnaGroup.rotation.x);
        
        // Animate floating particles
        particles.rotation.y = time * 0.5;
        particles.rotation.x = time * 0.2;
        
        // Adjust particle blending and opacity for light/dark mode dynamically
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            particleMaterial.blending = THREE.AdditiveBlending;
            particleMaterial.color.setHex(0x8b5cf6); // Light purple
            particleMaterial.opacity = 0.6;
        } else {
            // Additive blending is invisible on white backgrounds
            particleMaterial.blending = THREE.NormalBlending;
            particleMaterial.color.setHex(0x2563eb); // Deeper blue for contrast
            particleMaterial.opacity = 0.8; // Higher opacity for light mode
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
