import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
// Використовуємо офіційний завантажувач замість локального loader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Зручна функція для завантаження моделей (замінює ваш loader.js)
const loadGLTF = (url) => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(url, resolve, undefined, reject);
    });
};

const capture = (mindarThree) => {
    const {video, renderer, scene, camera} = mindarThree;
    const renderCanvas = renderer.domElement;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = renderCanvas.width;
    canvas.height = renderCanvas.height;

    const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
    const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
    const sw = video.videoWidth - sx * 2;
    const sh = video.videoHeight - sy * 2;

    context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    renderer.preserveDrawingBuffer = true;
    renderer.render(scene, camera);
    context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
    renderer.preserveDrawingBuffer = false;

    return canvas.toDataURL("image/png");
}

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.querySelector("#start-btn");

    startBtn.addEventListener("click", async () => {
        // Ховаємо кнопку старту і показуємо інтерфейс
        startBtn.style.display = "none";
        document.querySelectorAll('.control-btn, #capture').forEach(el => el.style.display = "block");

        const mindarThree = new MindARThree({
            container: document.querySelector("#container"),
        });

        const { renderer, scene, camera } = mindarThree;

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(-0.5, 1, 1);
        scene.add(directionalLight);

        // 1. Оклюдер голови (з публічного посилання)
        const occluder = await loadGLTF('https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/sparkar/headOccluder.glb');
        occluder.scene.scale.set(0.065, 0.065, 0.065);
        occluder.scene.position.set(0, -0.3, 0.15);
        
        const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
        occluder.scene.traverse((o) => {
            if (o.isMesh) o.material = occluderMaterial;
        });
        occluder.scene.renderOrder = 0; 
        const occluderAnchor = mindarThree.addAnchor(168); 
        occluderAnchor.group.add(occluder.scene);

        // 2. Капелюх (з публічного посилання)
        const hat = await loadGLTF('https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/hat/scene.gltf');
        hat.scene.scale.set(0.35, 0.35, 0.35);
        hat.scene.position.set(0, 1, -0.45);
        hat.scene.renderOrder = 1; 
        const hatAnchor = mindarThree.addAnchor(10); 
        hatAnchor.group.add(hat.scene);

        // 3. Маска (з публічного посилання)
        const faceMesh = mindarThree.addFaceMesh();
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/sparkar/faceMesh.png', (texture) => {
            faceMesh.material.map = texture;
            faceMesh.material.transparent = true;
            faceMesh.material.needsUpdate = true;
        });
        
        let maskActive = false; 
        faceMesh.visible = maskActive;
        scene.add(faceMesh);

        await mindarThree.start();

        // UI Логіка
        const toggleVideoBtn = document.querySelector("#toggle-video-btn");
        let videoVisible = true;
        toggleVideoBtn.addEventListener("click", () => {
            videoVisible = !videoVisible;
            const video = document.querySelector("#container video");
            if (video) video.style.visibility = videoVisible ? "visible" : "hidden";
            toggleVideoBtn.textContent = videoVisible ? "Приховати відео" : "Показати відео";
        });

        const toggleMaskBtn = document.querySelector("#toggle-mask-btn");
        toggleMaskBtn.addEventListener("click", () => {
            maskActive = !maskActive;
            toggleMaskBtn.textContent = maskActive ? "Приховати маску" : "Показати маску";
        });

        const toggleOccluderBtn = document.querySelector("#toggle-occluder-btn");
        let occluderDebugVisible = false;
        toggleOccluderBtn.addEventListener("click", () => {
            occluderDebugVisible = !occluderDebugVisible;
            occluder.scene.traverse((o) => {
                if (o.isMesh) {
                    o.material.colorWrite = occluderDebugVisible;
                    o.material.color.setHex(0x0000ff); // Показуємо синім для тесту
                }
            });
            toggleOccluderBtn.textContent = occluderDebugVisible ? "Приховати оклюдер" : "Показати оклюдер";
        });

        const previewImage = document.querySelector("#preview-image");
        const previewClose = document.querySelector("#preview-close");
        const preview = document.querySelector("#preview");
        const previewShare = document.querySelector("#preview-share");

        document.querySelector("#capture").addEventListener("click", () => {
            const data = capture(mindarThree);
            preview.style.visibility = "visible";
            previewImage.src = data;
        });

        previewClose.addEventListener("click", () => {
            preview.style.visibility = "hidden";
        });

        previewShare.addEventListener("click", () => {
            const link = document.createElement("a");
            link.download = "ar-photo.png";
            link.href = previewImage.src;
            link.click();
        });

        renderer.setAnimationLoop(() => {
            faceMesh.visible = maskActive;
            if (faceMesh.material) faceMesh.material.visible = maskActive;
            renderer.render(scene, camera);
        });
    });
});