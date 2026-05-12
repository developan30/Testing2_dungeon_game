import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { CameraRig } from './components/CameraRig';

export default function App() {
  return (
    <div className="app">
      <Canvas camera={{ position: [0, 8, 10], fov: 55 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#09090d']} />
        <fog attach="fog" args={['#09090d', 6, 28]} />
        <ambientLight intensity={0.12} color="#8790a8" />
        <directionalLight position={[5, 8, 4]} intensity={0.3} color="#b8c6e0" castShadow />
        <CameraRig />
        <Scene />
      </Canvas>
      <UI />
    </div>
  );
}
