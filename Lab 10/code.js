import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';

document.addEventListener("DOMContentLoaded", () => {
    // Знайдемо кнопку старту
    const startBtn = document.querySelector("#start-btn");

    // Запуск AR-сцени тільки після кліку (вимога безпеки браузерів)
    startBtn.addEventListener("click", async () => {
        // Ховаємо кнопку
        startBtn.style.display = "none";

        const mindarThree = new MindARThree({
            container: document.querySelector("#container"),
        });

        const { renderer, scene, camera } = mindarThree;

        // Освітлення (щоб текстура маски була яскравою)
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(hemisphereLight);

        // === СТВОРЕННЯ МАСКИ (FaceMesh) ===
        // 1. Отримуємо стандартну сітку обличчя від MindAR
        const faceMesh = mindarThree.addFaceMesh();

        // 2. Ініціалізуємо завантажувач текстур
        const textureLoader = new THREE.TextureLoader();

        // 3. ЗАВАНТАЖУЄМО ВЛАСНУ ТЕКСТУРУ (Публічне посилання на маску Кішки)
        // Ви можете замінити це посилання на будь-яке інше (avatar.jpg з L1, тощо)
        const maskTextureUrl = 'https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/face-tracking/assets/mask/mask.png';

        textureLoader.load(maskTextureUrl, (texture) => {
            // Накладаємо текстуру на матеріал маски
            faceMesh.material.map = texture;
            
            // Вмикаємо прозорість (щоб маска була красивою)
            faceMesh.material.transparent = true;
            
            // За необхідності коригуємо колір або яскравість
            faceMesh.material.needsUpdate = true;
        });

        // Додаємо маску до сцени
        scene.add(faceMesh);

        // Запуск камери
        await mindarThree.start();

        // Цикл рендерингу
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    </script>
});