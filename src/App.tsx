import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
export default function App() {
  return <div className="app"><Canvas camera={{ position: [0, 10, 12], fov: 60 }}><color attach="background" args={['#0d0d12']} /><fog attach="fog" args={['#0d0d12', 8, 30]} /><ambientLight intensity={0.2} /><directionalLight position={[5, 8, 4]} intensity={0.5} /><Scene /><OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI/2.2} minPolarAngle={Math.PI/4} /></Canvas><UI /></div>
}
