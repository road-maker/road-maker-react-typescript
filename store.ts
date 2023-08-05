import {
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';
import { shallow } from 'zustand/shallow';
// import { create } from 'zustand';
import { createWithEqualityFn } from 'zustand/traditional';

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
};

const useStore = createWithEqualityFn<RFState>(
  // const useStore = create<RFState>(
  (set, get) => ({
    // const useStore = create<RFState>((set, get) => ({
    nodes: [
      {
        id: 'root',
        type: 'mindmap',
        data: { label: 'React Flow Mind Map' },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
  }),
  // Object.is,
  shallow,
);

export default useStore;
