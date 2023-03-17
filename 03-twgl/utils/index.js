export function fetchShaders(vs, fs) {
  return Promise.all([
    fetch(vs).then(res => res.text()),
    fetch(fs).then(res => res.text()),
  ])
}
