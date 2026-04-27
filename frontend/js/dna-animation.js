const container = document.getElementById("canvas-bg");

if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 45);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    const dnaGroup = new THREE.Group();
    const nodeMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2563eb, 
        metalness: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9
    });
    const linkMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xbfdbfe, 
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 0.8,
        transparent: true,
        opacity: 0.9
    });
    const numPairs = 45;
    const helixRadius = 3.5;
    const helixHeight = 1.3;
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
    const backboneGeo1 = new THREE.TubeGeometry(new HelixCurve(1, 0), 150, 0.4, 16, false);
    const backboneGeo2 = new THREE.TubeGeometry(new HelixCurve(1, Math.PI), 150, 0.4, 16, false);
    const backbone1 = new THREE.Mesh(backboneGeo1, nodeMaterial);
    const backbone2 = new THREE.Mesh(backboneGeo2, nodeMaterial);
    dnaGroup.add(backbone1);
    dnaGroup.add(backbone2);
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
        const node1 = new THREE.Mesh(sphereGeo, nodeMaterial);
        node1.position.set(x1, y, z1);
        dnaGroup.add(node1);
        const node2 = new THREE.Mesh(sphereGeo, nodeMaterial);
        node2.position.set(x2, y, z2);
        dnaGroup.add(node2);
        const link = new THREE.Mesh(linkGeo, linkMaterial);
        link.position.set(0, y, 0);
        link.rotation.y = -angle;
        link.rotation.z = Math.PI / 2;
        dnaGroup.add(link);
    }
    dnaGroup.rotation.z = -Math.PI / 6; 
    dnaGroup.position.x = 8;
    dnaGroup.position.y = 0;
    scene.add(dnaGroup);
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3); 
    for(let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 140;
        particlePositions[i+1] = (Math.random() - 0.5) * 140;
        particlePositions[i+2] = (Math.random() - 0.5) * 60 - 20;
    } 
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff, 
        size: 0.22,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    const blueLight = new THREE.PointLight(0x3b82f6, 2, 80);
    blueLight.position.set(5, 5, 10);
    scene.add(blueLight);
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;   
        const scrollProgress = Math.min(scrollY / 800, 1); 
        dnaGroup.children.forEach(child => {
            if (child.material) {
                child.material.opacity = Math.max(0.9 - (scrollProgress * 0.2), 0.7);
            }
        });
    });
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.0005;
    });
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.001;
        dnaGroup.rotation.y += 0.002;
        dnaGroup.rotation.x += 0.02 * (mouseY - dnaGroup.rotation.x);
        const scale = 1 + Math.sin(time * 2) * 0.02;
        dnaGroup.scale.set(scale, scale, scale);
        const isDark = document.documentElement.classList.contains('dark'); 
        if (isDark) {
            particleMaterial.color.setHex(0xffffff); 
            particleMaterial.opacity = 0.6;
            particleMaterial.size = 0.22;
            particleMaterial.blending = THREE.AdditiveBlending;
        } else {
            particleMaterial.color.setHex(0x2563eb);
            particleMaterial.opacity = 0.7;
            particleMaterial.size = 0.35;
            particleMaterial.blending = THREE.NormalBlending;
        }  
        particles.rotation.y = time * 0.2;
        particles.rotation.x = time * 0.1;    
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener("resize", () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
