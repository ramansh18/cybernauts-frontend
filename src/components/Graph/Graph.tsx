import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type Node,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';
import HighScoreNode from './nodes/HighScoreNode';
import LowScoreNode from './nodes/LowScoreNode';
import type { User, Hobby } from '../../types';
import { notifySuccess, notifyError } from '../UI/Toast';
import { useGraphContext } from '../../context/GraphContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const nodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
};

interface GraphProps {
  users: User[];
  friendships: { user1_id: string; user2_id: string }[];
  onFriendshipChange: () => Promise<void>;
}

const Graph: React.FC<GraphProps> = ({ users, friendships, onFriendshipChange }) => {
  const { fetchUsers } = useGraphContext(); // 🔥 Get fetchUsers from context
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [edgeToDelete, setEdgeToDelete] = useState<{ id: string; user1: string; user2: string } | null>(null);

  // Build nodes & edges
  useEffect(() => {
    const mappedNodes: Node[] = users.map((user, i) => ({
      id: user.id,
      type: user.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode',
      position: { x: 200 + (i % 3) * 400, y: 150 + Math.floor(i / 3) * 320 },
      data: { user },
    }));

    const mappedEdges: Edge[] = friendships
      .filter(
        f =>
          users.some(u => u.id === f.user1_id) &&
          users.some(u => u.id === f.user2_id)
      )
      .map(f => ({
        id: `${f.user1_id}___${f.user2_id}`,
        source: f.user1_id,
        target: f.user2_id,
        type: 'smoothstep',
        animated: true,
        style: { 
          stroke: '#94A3B8', 
          strokeWidth: 2.5 
        },
        label: (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: 'white',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
            }}
          >
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              color: '#64748B' 
            }}>
              Friends
            </span>
          </div>
        ),
        labelStyle: { fill: '#64748B', fontWeight: 600 },
      }));

    setNodes(mappedNodes);
    setEdges(mappedEdges);
  }, [users, friendships, setNodes, setEdges]);

  const onConnect = useCallback(
    async (connection: Connection) => {
      const { source, target } = connection;
      if (!source || !target) return;

      // Prevent self-linking
      if (source === target) {
        notifyError('Cannot create friendship with yourself!');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/api/users/${source}/link`, { friendId: target });
        setEdges(eds => addEdge({ 
          ...connection, 
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#94A3B8', 
            strokeWidth: 2.5 
          }
        }, eds));
        notifySuccess('Friendship created!');
        
        // 🔥 Refresh user data to update friend counts and popularity scores
        await onFriendshipChange();
      } catch (err) {
        console.error('Error linking users:', err);
        notifyError('Failed to create friendship');
      }
    },
    [setEdges, onFriendshipChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent, nodeId: string) => {
      event.preventDefault();
      const hobbyData = event.dataTransfer.getData('application/hobby');
      if (!hobbyData) return;

      const hobby: Hobby = JSON.parse(hobbyData);
      try {
        await axios.post(`${API_BASE_URL}/api/hobbies/${nodeId}`, { hobbyId: hobby.id });
        notifySuccess(`Hobby "${hobby.name}" added to user`);
        
        // 🔥 Refresh users to update popularity scores in real-time
        await fetchUsers(true); // silent mode to avoid loading spinner
      } catch (err: any) {
        if (err.response?.status === 409) {
          notifyError(`${hobby.name} is already added for this user`);
        } else {
          console.error('Error adding hobby:', err);
          notifyError(`Failed to add hobby "${hobby.name}"`);
        }
      }
    },
    [fetchUsers]
  );

  const memoizedNodes = useMemo(
    () =>
      nodes.map(node => ({
        ...node,
        draggable: true,
        data: {
          ...node.data,
          onDrop: (e: React.DragEvent) => onDrop(e, node.id),
          onDragOver,
        },
      })),
    [nodes, onDrop, onDragOver]
  );

  const styledEdges = useMemo(
    () =>
      edges.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: edge.id === selectedEdgeId ? '#8B5CF6' : edge.style?.stroke || '#94A3B8',
          strokeWidth: edge.id === selectedEdgeId ? 3.5 : 2.5,
        },
      })),
    [edges, selectedEdgeId]
  );

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    const [user1, user2] = edge.id.split('___');
    setEdgeToDelete({ id: edge.id, user1, user2 });
  }, []);

  const handleDeleteEdge = async () => {
    if (!edgeToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/users/${edgeToDelete.user1}/unlink`, {
        data: { friendId: edgeToDelete.user2 },
      });
      setEdges(currEdges => currEdges.filter(edge => edge.id !== edgeToDelete.id));
      notifySuccess('Friendship removed successfully!');
      setShowDeleteModal(false);
      setSelectedEdgeId(null);
      setEdgeToDelete(null);
      
      // 🔥 Refresh user data to update friend counts and popularity scores
      await onFriendshipChange();
    } catch (err) {
      console.error('Error removing friendship:', err);
      notifyError('Failed to remove friendship');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedEdgeId(null);
    setEdgeToDelete(null);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden" style={{ height: '100vh' }}>
      <div className="w-full h-full pb-24">
        <ReactFlow
          nodes={memoizedNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          style={{ background: 'transparent' }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background 
            color="#E2E8F0" 
            gap={16} 
            size={1}
            style={{ opacity: 0.4 }}
          />
          <Controls 
            className="bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              button: {
                backgroundColor: 'white',
                borderBottom: '1px solid #E5E7EB',
                color: '#6B7280'
              }
            }}
          />
          <MiniMap
            nodeColor={node => node.type === 'highScoreNode' ? '#F97316' : '#3B82F6'}
            className="bg-white border border-gray-300 rounded-lg shadow-lg"
            maskColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>
      </div>

      {/* Delete Edge Button - Appears when edge is selected */}
      {selectedEdgeId && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white border border-gray-300 rounded-lg shadow-xl px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Friendship Selected
            </span>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Remove Friendship
            </button>
            <button
              onClick={handleCancelDelete}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#DC2626" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Friendship</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove this friendship connection? The users will no longer be connected in the graph.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteEdge}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Yes, Remove
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graph;