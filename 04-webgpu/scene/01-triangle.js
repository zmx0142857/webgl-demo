// draw a triangle
export default function Scene01 (props) {
  const { device, format, context } = props
  const module = device.createShaderModule({
    label: 'our hardcoded triangle shaders',
    code: `
      @vertex
      fn vs(
        @builtin(vertex_index) vertexIndex: u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f(0.0, 0.5),
          vec2f(-0.5, -0.5),
          vec2f(0.5, -0.5),
        );
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }

      @fragment
      fn fs() -> @location(0) vec4f {
        return vec4f(0.7, 1.0, 0.8, 0.0);
      }
    `
  })

  const pipeline = device.createRenderPipeline({
    label: 'our hardcoded triangle pipeline',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
    },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format }], // corresponds to @location(0)
    },
  })

  const renderPassDescriptor = {
    label: 'our basic canvas renderPass',
    colorAttachments: [
      // corresponds to @location(0)
      {
        view: undefined, // to be filled out when we render
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
  }

  function render () {
    // Get the current texture from the canvas context and
    // set it as the texture to render to
    renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()

    // make a command encoder to start encoding commands
    const encoder = device.createCommandEncoder({ label: 'our encoder' })

    // make a render pass encoder to encode render specific commands
    const pass = encoder.beginRenderPass(renderPassDescriptor)
    pass.setPipeline(pipeline)
    pass.draw(3) // call our vertex shader 3 times
    pass.end()

    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
  }

  render()
}