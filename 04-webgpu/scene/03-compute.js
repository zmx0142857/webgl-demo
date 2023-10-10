// compute shader
export default function Scene03 ({ device }) {
  const module = device.createShaderModule({
    label: 'doubling compute module',
    code: `
      @group(0) @binding(0)
      var<storage, read_write> data: array<f32>;

      @compute @workgroup_size(1)
      fn computeSomething(
        @builtin(global_invocation_id) id: vec3<u32>
      ) {
        let i = id.x;
        data[i] = data[i] * 2.0;
      }
    `
  })

  const pipeline = device.createComputePipeline({
    label: 'doubling compute pipeline',
    layout: 'auto',
    compute: {
      module,
      entryPoint: 'computeSomething',
    },
  })

  const input = new Float32Array([1, 3, 5])

  // create a buffer on the GPU to hold our computation input and output
  const workBuffer = device.createBuffer({
    label: 'work buffer',
    size: input.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  })
  // copy our input data to that buffer
  device.queue.writeBuffer(workBuffer, 0, input) 

  // create a buffer on the GPU to get a copy of the results
  const resultBuffer = device.createBuffer({
    label: 'result buffer',
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
  })

  // Setup a bindGroup to tell the shader which buffer to use for the computation
  const bindGroup = device.createBindGroup({
    label: 'bindGroup for work buffer',
    layout: pipeline.getBindGroupLayout(0), // corresponds to @group(0)
    entries: [
      { binding: 0, resource: { buffer: workBuffer } }, // corresponds to @binding(0)
    ],
  })

  // Encode commands to do the computation
  const encoder = device.createCommandEncoder({
    label: 'doubling encoder',
  })
  const pass = encoder.beginComputePass({
    label: 'doubling compute pass',
  })
  pass.setPipeline(pipeline)
  pass.setBindGroup(0, bindGroup) // corresponds to @group(0)
  pass.dispatchWorkgroups(input.length) // run the compute shader 3 times
  pass.end()

  // Encode a command to copy the results to a mappable buffer
  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size)

  // Finish encoding and submit the commands
  const commandBuffer = encoder.finish()
  device.queue.submit([commandBuffer])

  // Read the results
  resultBuffer.mapAsync(GPUMapMode.READ).then(() => {
    const result = new Float32Array(resultBuffer.getMappedRange())
    console.log('input', input)
    console.log('result', result)
    resultBuffer.unmap()
  })
}