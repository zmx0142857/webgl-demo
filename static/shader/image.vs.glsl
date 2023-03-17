attribute vec3 aPosition;
attribute vec2 aTexture;
varying vec2 vTexture;

void main() {
    // flip y-axis
    vTexture = vec2(aTexture.x, 1.0 - aTexture.y);
    gl_Position = vec4(aPosition, 1);
}