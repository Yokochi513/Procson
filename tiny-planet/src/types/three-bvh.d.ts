import type { MeshBVH, MeshBVHOptions } from 'three-mesh-bvh';

// three-mesh-bvh をプロトタイプ拡張で使うための型補完。
declare module 'three' {
  interface BufferGeometry {
    boundsTree?: MeshBVH;
    computeBoundsTree: (options?: MeshBVHOptions) => void;
    disposeBoundsTree: () => void;
  }

  interface Raycaster {
    firstHitOnly?: boolean;
  }
}
