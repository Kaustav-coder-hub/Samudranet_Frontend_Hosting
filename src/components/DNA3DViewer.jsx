import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import FallbackDNA from "./FallbackDNA";

const DNA3DViewer = ({ sequence = "", gcContent = 50, dnaLength = 1000 }) => {
  const mountRef = useRef(null);
  const [debugMessage, setDebugMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let scene, camera, renderer, labelRenderer, controls;
    let animationFrameId = null;

    const initScene = () => {
      if (!mountRef.current) {
        setDebugMessage("Container ref not available");
        return;
      }

      try {
        console.log("Initializing DNA 3D scene");
        setDebugMessage("Initializing 3D scene...");
        setIsLoading(true);

        try {
          const canvas = document.createElement("canvas");
          const gl =
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
          if (!gl) {
            throw new Error("WebGL is not supported in this browser");
          }
        } catch (e) {
          console.warn("WebGL check failed:", e);
        }

        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f9ff);
        const width = mountRef.current.clientWidth || 300;
        const height = mountRef.current.clientHeight || 300;
        camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 20;
        camera.position.y = 5;

        try {
          renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          });
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          mountRef.current.appendChild(renderer.domElement);

          labelRenderer = new CSS2DRenderer();
          labelRenderer.setSize(width, height);
          labelRenderer.domElement.style.position = "absolute";
          labelRenderer.domElement.style.top = "0";
          labelRenderer.domElement.style.pointerEvents = "none";
          mountRef.current.appendChild(labelRenderer.domElement);

          setDebugMessage("Renderers created");
        } catch (err) {
          console.error("Failed to create renderers:", err);
          throw new Error("Could not initialize renderers: " + err.message);
        }

        try {
          controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.rotateSpeed = 0.5;
          controls.enableZoom = true;
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.0;
        } catch (err) {
          console.warn("OrbitControls could not be initialized:", err);
        }

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(10, 20, 10);
        scene.add(directionalLight);

        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({
          color: 0xf5f5f5,
          side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = Math.PI / 2;
        plane.position.y = -15;
        scene.add(plane);

        const dnaModel = createDNAModel();
        scene.add(dnaModel);

        setDebugMessage("DNA model created");
        setIsLoading(false);

        const animate = () => {
          try {
            animationFrameId = requestAnimationFrame(animate);

            if (dnaModel && !controls.autoRotate) {
              dnaModel.rotation.y += 0.003;
            }
            if (controls) {
              controls.update();
            }

            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
          } catch (err) {
            console.error("Animation error:", err);
            cancelAnimationFrame(animationFrameId);
            setDebugMessage("Animation error: " + err.message);
          }
        };

        animate();

        const handleResize = () => {
          if (!mountRef.current || !camera || !renderer || !labelRenderer)
            return;

          try {
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            labelRenderer.setSize(width, height);
          } catch (err) {
            console.warn("Resize handling error:", err);
          }
        };

        window.addEventListener("resize", handleResize);

        setTimeout(() => {
          if (mountRef.current && mountRef.current.children.length > 0) {
            setDebugMessage("DNA model rendering");
          } else {
            setDebugMessage("Render issue detected");
          }
        }, 1000);

        return () => {
          window.removeEventListener("resize", handleResize);
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }

          if (scene) {
            scene.traverse((object) => {
              if (object.geometry) object.geometry.dispose();

              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material) => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }

          if (renderer) renderer.dispose();
          if (controls) controls.dispose();

          if (
            mountRef.current &&
            renderer &&
            mountRef.current.contains(renderer.domElement)
          ) {
            mountRef.current.removeChild(renderer.domElement);
          }

          if (
            mountRef.current &&
            labelRenderer &&
            mountRef.current.contains(labelRenderer.domElement)
          ) {
            mountRef.current.removeChild(labelRenderer.domElement);
          }
        };
      } catch (err) {
        console.error("Error in DNA viewer:", err);
        setDebugMessage(`Error: ${err.message}`);
        setHasError(true);
        setIsLoading(false);
        return () => {};
      }
    };

    const createLabel = (text, color) => {
      const div = document.createElement("div");
      div.className = "dna-label";
      div.style.backgroundColor = "#ffffff";
      div.style.color =
        typeof color === "string"
          ? color.startsWith("#")
            ? color
            : `#${color}`
          : "#000000";

      const isShortLabel = text.length === 1;

      div.style.padding = isShortLabel ? "1px 3px" : "2px 5px";
      div.style.borderRadius = "3px";
      div.style.fontSize = isShortLabel ? "8px" : "10px";
      div.style.fontWeight = "bold";
      div.style.boxShadow = isShortLabel
        ? "0 0 2px rgba(0,0,0,0.2)"
        : "0 0 3px rgba(0,0,0,0.3)";
      div.style.border = `1px solid ${div.style.color}`;
      div.style.userSelect = "none";
      div.style.textAlign = "center";
      div.textContent = text;

      const label = new CSS2DObject(div);
      return label;
    };

    const createDNAModel = () => {
      const dnaGroup = new THREE.Group();

      const radius = 5;
      const height = 30;
      const turns = 3; 
      const basePairsPerTurn = 4;

      const helix1Points = [];
      const helix2Points = [];

      const numPoints = turns * 32;

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const angle = t * turns * Math.PI * 2;

        const x1 = radius * Math.cos(angle);
        const y = height * (t - 0.5);
        const z1 = radius * Math.sin(angle);

        const x2 = radius * Math.cos(angle + Math.PI);
        const z2 = radius * Math.sin(angle + Math.PI);

        helix1Points.push(new THREE.Vector3(x1, y, z1));
        helix2Points.push(new THREE.Vector3(x2, y, z2));
      }

      const backbone1Material = new THREE.LineBasicMaterial({
        color: 0x0055aa,
        linewidth: 3,
      });
      const backbone2Material = new THREE.LineBasicMaterial({
        color: 0x00aa55,
        linewidth: 3,
      });

      const backbone1Geometry = new THREE.BufferGeometry().setFromPoints(
        helix1Points
      );
      const backbone2Geometry = new THREE.BufferGeometry().setFromPoints(
        helix2Points
      );

      const backbone1 = new THREE.Line(backbone1Geometry, backbone1Material);
      const backbone2 = new THREE.Line(backbone2Geometry, backbone2Material);

      dnaGroup.add(backbone1);
      dnaGroup.add(backbone2);

      const totalBasePairs = turns * basePairsPerTurn;

      const nucleotideColors = {
        A: 0xff3333,
        T: 0x3333ff,
        G: 0xffcc00,
        C: 0x33cc33,
      };

      const nucleotides = ["A", "T", "G", "C"];
      const sequence = [];

      for (let i = 0; i < totalBasePairs; i++) {
        sequence.push(nucleotides[i % 4]);
      }

      const nucleotideNames = {
        A: "Adenine (A)",
        T: "Thymine (T)",
        G: "Guanine (G)",
        C: "Cytosine (C)",
      };

      const lineLength = 2.0;
      const labelOffset = 0.3;

      for (let i = 0; i < totalBasePairs; i++) {
        const t = i / totalBasePairs;
        const angle = t * turns * Math.PI * 2;
        const y = height * (t - 0.5);

        const base = sequence[i];
        let complementaryBase;
        switch (base) {
          case "A":
            complementaryBase = "T";
            break;
          case "T":
            complementaryBase = "A";
            break;
          case "G":
            complementaryBase = "C";
            break;
          case "C":
            complementaryBase = "G";
            break;
          default:
            complementaryBase = "A";
        }

        const x1 = radius * Math.cos(angle);
        const z1 = radius * Math.sin(angle);

        const x2 = radius * Math.cos(angle + Math.PI);
        const z2 = radius * Math.sin(angle + Math.PI);

        const nucleotide1Geometry = new THREE.SphereGeometry(0.7, 8, 8); 
        const nucleotide1Material = new THREE.MeshBasicMaterial({
          color: nucleotideColors[base],
        });
        const nucleotide1 = new THREE.Mesh(
          nucleotide1Geometry,
          nucleotide1Material
        );
        nucleotide1.position.set(x1, y, z1);
        dnaGroup.add(nucleotide1);

        const lineMaterial1 = new THREE.LineBasicMaterial({
          color: nucleotideColors[base],
        });

        const directionX1 = x1;
        const directionZ1 = z1;
        const length1 = Math.sqrt(
          directionX1 * directionX1 + directionZ1 * directionZ1
        );
        const normalizedX1 = directionX1 / length1;
        const normalizedZ1 = directionZ1 / length1;

        const points1 = [
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(
            x1 + normalizedX1 * lineLength,
            y,
            z1 + normalizedZ1 * lineLength
          ),
        ];

        const lineGeometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const line1 = new THREE.Line(lineGeometry1, lineMaterial1);
        dnaGroup.add(line1);

        const label1 = createLabel(
          base,
          new THREE.Color(nucleotideColors[base]).getHexString()
        );
        label1.position.set(
          x1 + normalizedX1 * (lineLength + labelOffset),
          y,
          z1 + normalizedZ1 * (lineLength + labelOffset)
        );
        dnaGroup.add(label1);

        const nucleotide2Geometry = new THREE.SphereGeometry(0.7, 8, 8);
        const nucleotide2Material = new THREE.MeshBasicMaterial({
          color: nucleotideColors[complementaryBase],
        });
        const nucleotide2 = new THREE.Mesh(
          nucleotide2Geometry,
          nucleotide2Material
        );
        nucleotide2.position.set(x2, y, z2);
        dnaGroup.add(nucleotide2);

        const lineMaterial2 = new THREE.LineBasicMaterial({
          color: nucleotideColors[complementaryBase],
        });

        const directionX2 = x2;
        const directionZ2 = z2;
        const length2 = Math.sqrt(
          directionX2 * directionX2 + directionZ2 * directionZ2
        );
        const normalizedX2 = directionX2 / length2;
        const normalizedZ2 = directionZ2 / length2;

        const points2 = [
          new THREE.Vector3(x2, y, z2),
          new THREE.Vector3(
            x2 + normalizedX2 * lineLength,
            y,
            z2 + normalizedZ2 * lineLength
          ),
        ];

        const lineGeometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const line2 = new THREE.Line(lineGeometry2, lineMaterial2);
        dnaGroup.add(line2);

        const label2 = createLabel(
          complementaryBase, 
          new THREE.Color(nucleotideColors[complementaryBase]).getHexString()
        );
        label2.position.set(
          x2 + normalizedX2 * (lineLength + labelOffset),
          y,
          z2 + normalizedZ2 * (lineLength + labelOffset)
        );
        dnaGroup.add(label2);

        const bondGeometry = new THREE.CylinderGeometry(
          0.1,
          0.1,
          2 * radius,
          6
        );
        const bondMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8,
        });
        const bond = new THREE.Mesh(bondGeometry, bondMaterial);

        bond.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        bond.lookAt(x2, y, z2);
        bond.rotateX(Math.PI / 2);

        dnaGroup.add(bond);
      }

      const axesHelper = new THREE.AxesHelper(5);
      dnaGroup.add(axesHelper);

      const baseGeometry = new THREE.CylinderGeometry(8, 8, 1, 32);
      const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -height / 2 - 1, 0);
      dnaGroup.add(base);

      dnaGroup.rotation.y = Math.PI / 4;

      return dnaGroup;
    };

    const cleanup = initScene();
    return cleanup;
  }, [sequence, gcContent, dnaLength]);

  if (hasError) {
    return <FallbackDNA message={`3D viewer error: ${debugMessage}`} />;
  }

  return (
    <>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "300px",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f0f9ff",
          position: "relative",
        }}
      />
      {debugMessage && (
        <div className="absolute top-2 left-2 text-xs bg-black text-white px-2 py-1 rounded opacity-70 z-10">
          {debugMessage}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-50 z-20">
          <div className="text-blue-600 font-semibold">
            Loading DNA Model...
          </div>
        </div>
      )}
    </>
  );
};

export default DNA3DViewer;
