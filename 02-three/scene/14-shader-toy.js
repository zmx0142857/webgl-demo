import * as THREE from 'three';

export default function scene14 (app) {

  app.renderer.autoClearColor = false;
  app.camera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
  );
  const plane = new THREE.PlaneGeometry(2, 2);

  const fragmentShader = `
  #include <common>

  uniform vec3 iResolution;
  uniform float iTime;

  // By iq: https://www.shadertoy.com/user/iq  
  // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;

      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

      // Output to screen
      fragColor = vec4(col,1.0);
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
  `;
  const uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3() },
  };
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms,
  });
  app.scene.add(new THREE.Mesh(plane, material));

  app.animate(time => {
    uniforms.iResolution.value.set(app.canvas.width, app.canvas.height, 1);
    uniforms.iTime.value = time;
  })
}

