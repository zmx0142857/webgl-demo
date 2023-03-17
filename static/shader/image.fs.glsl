precision mediump float;

uniform sampler2D uImage;
uniform vec2 uImageSize;
uniform vec2 uResolution;
uniform float uTime;
varying vec2 vTexture;

// 等比例缩放图片使它充满屏幕
vec2 objectFitCover () {
  float ratio = (uImageSize.x / uImageSize.y) / (uResolution.x / uResolution.y);
  return vec2(
   (vTexture.x - 0.5) / max(ratio, 1.0) + 0.5,
    (vTexture.y - 0.5) * min(ratio, 1.0) + 0.5
  );
}

// 等比例缩放图片使屏幕刚好装下它
vec2 objectFitContain () {
  float ratio = (uImageSize.x / uImageSize.y) / (uResolution.x / uResolution.y);
  return vec2(
    (vTexture.x - 0.5) / min(ratio, 1.0) + 0.5,
    (vTexture.y - 0.5) * max(ratio, 1.0) + 0.5
  );
}

// 若 x in [0, 1] 且 y in [0, 1] 则返回 1, 否则返回 0
float rect (vec2 xy) {
  vec2 lowerBound = vec2(0.0, 0.0);
  vec2 upperBound = vec2(1.0, 1.0);
  vec2 st = step(upperBound, xy) - step(lowerBound, xy);
  return st.x * st.y;
}

// 效果 1: 横向模糊, 取平均颜色
void xAxisBlur (vec2 texCoord) {
  vec2 px = 1.0 / uImageSize;
  gl_FragColor = (
    texture2D(uImage, texCoord)
    + texture2D(uImage, texCoord + vec2(px.x, 0))
    + texture2D(uImage, texCoord + vec2(-px.x, 0))
  ) / 3.0;
}

// 效果 2: 淡入淡出
void fadeInOut (vec2 texCoord) {
  vec4 image = texture2D(uImage, texCoord);
  vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
  float alpha = sin(uTime) * 0.5 + 0.5;
  gl_FragColor = mix(image, white, alpha);
}

// 效果 3: 百叶窗
void windowBlind (vec2 texCoord) {
  vec4 image = texture2D(uImage, texCoord);
  float alpha = sin(uTime) * 0.5 + 0.5;
  float fractPart = fract(texCoord.x * 10.0);
  gl_FragColor = image * step(fractPart, alpha);
}

void main() {
  vec2 texCoord = objectFitContain();

  // xAxisBlur(texCoord);
  // fadeInOut(texCoord);
  windowBlind(texCoord);

  // 超出部分显示为黑色
  gl_FragColor *= rect(texCoord);
}