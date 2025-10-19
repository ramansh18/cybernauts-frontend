import React from 'react';
import { motion } from 'framer-motion';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      {/* Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Inner spinning ring */}
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading text */}
      <motion.p
        className="text-sm font-medium text-gray-600"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default Spinner;