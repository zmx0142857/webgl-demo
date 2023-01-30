// draw pixel
export default class Scene01 {
  draw () {
    for (let i = 0; i < 100; ++i) {
      canvas.setPixel(i, i)
    }
  }
}