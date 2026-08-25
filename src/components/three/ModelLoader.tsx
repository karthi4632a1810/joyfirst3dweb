"use client";

import { useGLTF } from "@react-three/drei";
import { Component, Suspense, useMemo } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

import { ArchitectureModel } from "./ArchitectureModel";

/* -------------------------------------------------------------------------- */
/* Error boundary                                                             */
/* -------------------------------------------------------------------------- */

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Catches a failed GLB load — missing file, 404, corrupt asset, unsupported
 * extension — and renders the fallback subject instead. Without this the whole
 * Canvas unmounts and the visitor is left with an empty black rectangle.
 */
class ModelErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[JOYFIRST] 3D model failed to load, using the built-in scene:", error);
    }
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* -------------------------------------------------------------------------- */
/* GLB subject                                                                */
/* -------------------------------------------------------------------------- */

interface GltfModelProps {
  src: string;
  scale: number;
  position: [number, number, number];
  castShadows: boolean;
}

function GltfModel({ src, scale, position, castShadows }: GltfModelProps) {
  // The second argument is the Draco decoder path. It is local, so a
  // Draco-compressed GLB needs the decoder copied into `public/draco/`.
  const { scene } = useGLTF(src, "/draco/");

  // The cached scene is shared, so it is cloned before being mutated — two
  // instances of the same model would otherwise fight over shadow flags.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadows;
        child.receiveShadow = castShadows;
        child.frustumCulled = true;
      }
    });
    return clone;
  }, [scene, castShadows]);

  return <primitive object={model} scale={scale} position={position} />;
}

/* -------------------------------------------------------------------------- */
/* Public component                                                           */
/* -------------------------------------------------------------------------- */

interface ModelLoaderProps {
  /** Path to a GLB. When omitted, the built-in procedural villa is used. */
  src?: string;
  detail?: "high" | "low";
  pointer?: React.RefObject<{ x: number; y: number }>;
  reducedMotion?: boolean;
  castShadows?: boolean;
  scale?: number;
  position?: [number, number, number];
}

/**
 * Resolves the scene's subject.
 *
 *   src given + loads    → the GLB
 *   src given + fails    → the procedural villa
 *   no src               → the procedural villa
 *
 * In every branch something architectural is on screen. The image fallback
 * (<ModelFallback />) sits one level up and covers the case where WebGL itself
 * is unavailable.
 */
export function ModelLoader({
  src,
  detail = "high",
  pointer,
  reducedMotion = false,
  castShadows = true,
  scale = 1,
  position = [0, 0, 0],
}: ModelLoaderProps) {
  const procedural = (
    <ArchitectureModel
      detail={detail}
      pointer={pointer}
      reducedMotion={reducedMotion}
      castShadows={castShadows}
    />
  );

  if (!src) return procedural;

  return (
    <ModelErrorBoundary fallback={procedural}>
      <Suspense fallback={procedural}>
        <GltfModel src={src} scale={scale} position={position} castShadows={castShadows} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
