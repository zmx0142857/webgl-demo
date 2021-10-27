// 假阴影，弹跳的小球
import * as THREE from 'three'

export default function scene09 (app) {
  app.camera.position.set(0, 5, 30);
  app.scene.background = new THREE.Color('white')

  const loader = new THREE.TextureLoader();
  // 平面
  {
    const planeSize = 40;

    const texture = loader.load('checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    planeMat.color.setRGB(1.5, 1.5, 1.5); // 使纹理增亮 1.5 倍
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    app.add(mesh);
  }

  // 假阴影, 随球体移动
  const sphereShadowBases = [];
  {
    const shadowTexture = loader.load('roundshadow.png');
    const sphereRadius = 1;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions
    );
    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const numSpheres = 15;
    for (let i = 0; i < numSpheres; ++i) {
      // make a base for the shadow and the sphere
      // so they move together.
      const base = new THREE.Object3D();
      app.add(base);

      // add the shadow to the base
      // note: we make a new material for each sphere
      // so we can set that sphere's material transparency
      // separately.
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true, // so we can see the ground
        depthWrite: false, // so we don't have to sort
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = 0.001; // so we're above the ground slightly
      shadowMesh.rotation.x = Math.PI * -0.5;
      const shadowSize = sphereRadius * 4;
      shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
      base.add(shadowMesh);

      // add the sphere to the base
      const u = i / numSpheres; // goes from 0 to 1 as we iterate the spheres.
      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL(u, 1, 0.75);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, sphereRadius + 2, 0);
      base.add(sphereMesh);

      // remember all 3 plus the y position
      sphereShadowBases.push({
        base,
        sphereMesh,
        shadowMesh,
        y: sphereMesh.position.y,
      });
    }
  }
  // 光照
  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 0.5;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    app.add(light);
  }
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 5);
    light.target.position.set(-5, 0, 0);
    app.add(light);
    app.add(light.target);
  }

  app.animate(time => {
    sphereShadowBases.forEach((sphereShadowBase, ndx) => {
      const {base, sphereMesh, shadowMesh, y} = sphereShadowBase;

      // u is a value that goes from 0 to 1 as we iterate the spheres
      const u = ndx / sphereShadowBases.length;

      // compute a position for the base. This will move
      // both the sphere and its shadow
      const speed = time * .2;
      const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
      const radius = Math.sin(speed - ndx) * 10;
      base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      // yOff is a value that goes from 0 to 1
      const yOff = Math.abs(Math.sin(time * 2 + ndx));
      // move the sphere up and down
      sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
      // fade the shadow as the sphere goes up
      shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
    });
  })
}
