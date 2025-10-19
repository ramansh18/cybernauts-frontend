import React from 'react';
import { motion } from 'framer-motion';
import type { NodeProps } from 'reactflow';
import type { User } from '../../../types';
import { Handle, Position } from 'reactflow';
import { Star, User as UserIcon } from 'lucide-react';

interface HighScoreNodeData {
  user: User;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const HighScoreNode: React.FC<NodeProps<HighScoreNodeData>> = ({ data }) => {
  const { user, onDrop, onDragOver } = data;

  return (
    <motion.div
      className="relative rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white p-5 cursor-pointer shadow-lg flex flex-col items-center justify-center select-none min-w-[180px]"
      onDrop={onDrop}
      onDragOver={onDragOver}
      layout
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: '0 20px 40px rgba(251, 146, 60, 0.4)',
        transition: { duration: 0.2 }
      }}
      style={{
        border: '2px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        id="input" 
        className="!bg-white !w-3 !h-3 !border-2 !border-orange-500"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="output" 
        className="!bg-white !w-3 !h-3 !border-2 !border-orange-500"
      />

      {/* Badge */}
      <div className="absolute -top-3 -right-3 bg-yellow-400 text-orange-900 rounded-full w-10 h-10 flex items-center justify-center shadow-md border-2 border-white">
        <Star className="w-5 h-5 fill-orange-900" />
      </div>

      {/* User Icon */}
      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 border-2 border-white/40">
        <UserIcon className="w-7 h-7 text-white" />
      </div>

      {/* User Info */}
      <div className="text-center space-y-1">
        <div className="font-bold text-lg tracking-wide">{user.username}</div>
        <div className="text-sm text-white/90 font-medium">Age: {user.age}</div>
        <div className="flex items-center justify-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full mt-2 backdrop-blur-sm">
          <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
          <span className="font-semibold">Score: {user.popularityScore}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HighScoreNode;