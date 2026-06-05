const devices = [
  { id: 'robot-arm-001', name: '机械臂 A1', type: 'robot-arm', status: 'running', runtime: 28800, efficiency: 92.5, temperature: 45.2, position: { x: 10, y: 0, z: 10 } },
  { id: 'robot-arm-002', name: '机械臂 A2', type: 'robot-arm', status: 'running', runtime: 27600, efficiency: 88.3, temperature: 43.8, position: { x: 10, y: 0, z: 20 } },
  { id: 'robot-arm-003', name: '机械臂 A3', type: 'robot-arm', status: 'idle', runtime: 25200, efficiency: 90.1, temperature: 38.5, position: { x: 10, y: 0, z: 30 } },
  { id: 'robot-arm-004', name: '机械臂 B1', type: 'robot-arm', status: 'running', runtime: 28200, efficiency: 91.7, temperature: 44.1, position: { x: -10, y: 0, z: 10 } },
  { id: 'robot-arm-005', name: '机械臂 B2', type: 'robot-arm', status: 'warning', runtime: 26400, efficiency: 78.4, temperature: 52.3, position: { x: -10, y: 0, z: 20 } },
  { id: 'robot-arm-006', name: '机械臂 B3', type: 'robot-arm', status: 'running', runtime: 27000, efficiency: 89.9, temperature: 42.6, position: { x: -10, y: 0, z: 30 } },
  { id: 'conveyor-001', name: '传送带 1', type: 'conveyor', status: 'running', runtime: 30600, efficiency: 95.2, temperature: 35.4, position: { x: 0, y: 0, z: 5 } },
  { id: 'conveyor-002', name: '传送带 2', type: 'conveyor', status: 'running', runtime: 30000, efficiency: 94.8, temperature: 34.9, position: { x: 0, y: 0, z: 20 } },
  { id: 'conveyor-003', name: '传送带 3', type: 'conveyor', status: 'idle', runtime: 24000, efficiency: 93.5, temperature: 32.1, position: { x: 0, y: 0, z: 35 } },
  { id: 'lift-001', name: '升降机 1', type: 'lift', status: 'running', runtime: 18000, efficiency: 87.6, temperature: 40.2, position: { x: 20, y: 0, z: 20 } },
  { id: 'lift-002', name: '升降机 2', type: 'lift', status: 'running', runtime: 16800, efficiency: 89.1, temperature: 39.8, position: { x: -20, y: 0, z: 20 } },
  { id: 'lift-003', name: '升降机 3', type: 'lift', status: 'error', runtime: 0, efficiency: 0, temperature: 25.0, position: { x: 0, y: 0, z: 45 } },
  { id: 'agv-001', name: 'AGV 运输车 1', type: 'agv', status: 'running', runtime: 21600, efficiency: 91.3, temperature: 36.7, position: { x: 5, y: 0, z: 25 } },
  { id: 'agv-002', name: 'AGV 运输车 2', type: 'agv', status: 'running', runtime: 20400, efficiency: 88.7, temperature: 37.2, position: { x: -5, y: 0, z: 15 } }
]

export default devices
