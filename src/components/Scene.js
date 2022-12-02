import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { HalftonePass } from "three/addons/postprocessing/HalftonePass.js";

function Scene(props) {
  let viewer = React.useRef(null);
  const [gltfLoading, setGltfLoading] = React.useState(null);
  const [gltfLoadState, setGltfLoadState] = React.useState(false);
  let total = 25741674;
  let composer, renderPass, saoPass;
  let group;
  React.useEffect(() => {
    if (viewer) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.shadowMap.enabled = true;
      //renderer.shadowMap.type = THREE.VSMShadowMap;
      //renderer.shadowMap.type = THREE.PCFShadowMap
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      renderer.setSize(viewer.clientWidth, viewer.clientHeight);

      viewer.appendChild(renderer.domElement);

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 6.5;
      controls.maxDistance = 20;
      controls.update();

      let pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      let realReflection = new RGBELoader()
        .setDataType(THREE.HalfFloatType)
        .setPath("hdr/") //this is the path name
        .load("studio.hdr" /*this is the hdri image name*/, function (texture) {
          let envMap = pmremGenerator.fromEquirectangular(texture).texture;
          scene.environment = envMap;
          texture.dispose();
          pmremGenerator.dispose();
        });
      scene.add(realReflection);

      let model;
      const loader = new GLTFLoader();
      loader.load(
        // resource URL
        "models/car-4.gltf",
        // called when the resource is loaded
        function (gltf) {
          gltf.scene.traverse(function (object) {
            if (object.isMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              object.color = 0x333333;
            }
          });
          scene.add(gltf.scene);
          setGltfLoadState(true);
        },
        // called while loading is progressing
        function (xhr) {
          setGltfLoading(`Loading ${Math.round((xhr.loaded / total) * 100)}%`);
          if (Math.round((xhr.loaded / total) * 100) >= 90) {
          }
        },
        // called when loading has errors
        function (error) {
          setGltfLoadState(false);
          setGltfLoading(
            `Opps! something wrong has happened, Please try to refresh the page.`
          );
        }
      );

      const hemiLight = new THREE.HemisphereLight(0xf2f2f2, 0xc9c9c9, 3);
      scene.add(hemiLight);

      const light = new THREE.DirectionalLight(0xffffff, 7);
      light.position.set(3, 3, 3); //default; light shining from top
      light.castShadow = true; // default false
      light.lookAt(0, 0, 0);
      scene.add(light);

      const light2 = new THREE.DirectionalLight(0xffffff, 5);
      light2.position.set(-3, 3, 3); //default; light shining from top
      light2.lookAt(0, 0, 0);
      scene.add(light2);

      //Set up shadow properties for the light
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      light.shadow.camera.near = 0.001;
      light.shadow.camera.far = 25;
      light.shadow.camera.left = -10;
      light.shadow.camera.right = 10;
      light.shadow.camera.top = 10;
      light.shadow.camera.bottom = -10;
      light.shadow.bias = -0.005;
      light.shadow.radius = 15;
      light.shadow.blurSamples = 150;

      const geometry = new THREE.PlaneGeometry(2000, 2000);
      geometry.rotateX(-Math.PI / 2);

      const material = new THREE.ShadowMaterial();
      material.opacity = 0.3;

      const ground = new THREE.Mesh(geometry, material);
      ground.position.y = 0.05;
      ground.receiveShadow = true;
      scene.add(ground);

      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      const params = {
        shape: 1,
        radius: 1,
        rotateR: 90,
        rotateB: 30,
        rotateG: 50,
        scatter: 0.1,
        blending: 1,
        blendingMode: 5,
        greyscale: false,
        disable: false,
      };
      const halftonePass = new HalftonePass(
        window.innerWidth,
        window.innerHeight,
        params
      );
      composer.addPass(renderPass);
      composer.addPass(halftonePass);

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        composer.render();
      }
      animate();
      return () => viewer.removeChild(renderer.domElement);
    }
  }, [viewer]);
  return (
    <div
      {...props}
      className={`h-full w-full fixed`}
      ref={node => {
        viewer = node;
      }}>
      {!gltfLoadState && (
        <div
          className={`h-full w-full flex justify-center items-center bg-stone-700 text-stone-400 font-extrabold text-4xl absolute z-20`}>
          {gltfLoading}
        </div>
      )}
    </div>
  );
}

export default Scene;
