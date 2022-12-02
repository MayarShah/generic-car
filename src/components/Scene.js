import React from "react";
import * as THREE from "three";

function Scene(props) {
  let viewer = React.createRef(null);

  React.useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    viewer.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const hemiLight = new THREE.HemisphereLight(0xf2f2f2, 0xc9c9c9, 1);
    scene.add(hemiLight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    animate();

    return () => viewer.removeChild(renderer.domElement);
  }, [viewer]);
  return (
    <div
      {...props}
      className={`h-full w-full absolute`}
      ref={node => (viewer = node)}></div>
  );
}

export default Scene;
