import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { CameraRig } from './components/CameraRig';

export default function App() {
  return (
    <div className="app">
      <Canvas camera={{ position: [0, 8, 10], fov: 55 }} shadows>
        <color attach="background" args={['#0d0d12']} />
        <fog attach="fog" args={['#0d0d12', 8, 32]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 8, 4]} intensity={0.75} castShadow />
        <CameraRig />
        <Scene />
      </Canvas>
      <UI />
    </div>
  );
}
