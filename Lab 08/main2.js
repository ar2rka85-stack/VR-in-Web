/**
 * Використовуючи матеріал тижня, до кожної з 468 опорних точок обличчя
 * прив'яжіть сфери синього кольору.
 */
import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';

document.addEventListener("DOMContentLoaded", async () => {
    const mindarThree = new MindARThree({
        container: document.querySelector("#container"),
    });

    const { renderer, scene, camera } = mindarThree;

    // Створюємо маленьку синю сферу
    const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    // Додаємо сферу до кожної з 468 точок обличчя
    for (let i = 0; i < 468; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const anchor = mindarThree.addAnchor(i);
        anchor.group.add(sphere);
    }

    await mindarThree.start();

    // Кнопка для увімкнення/вимкнення фонового відео з камери
    const toggleBtn = document.querySelector("#toggle-btn");
    let videoVisible = true;

    toggleBtn.addEventListener("click", () => {
        videoVisible = !videoVisible;
        const video = document.querySelector("#container video");
        if (video) {
            video.style.visibility = videoVisible ? "visible" : "hidden";
        }
        toggleBtn.textContent = videoVisible ? "Приховати відео" : "Показати відео";
    });

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
});