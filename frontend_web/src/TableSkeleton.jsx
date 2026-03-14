import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex gap-4 mb-8">
        {[...Array(cols)].map((_, i) => (
          <div key={`h-${i}`} className="h-4 bg-white/5 rounded-lg flex-1"></div>
        ))}
      </div>
      
      {/* Rows Skeleton */}
      {[...Array(rows)].map((_, i) => (
        <div 
          key={`r-${i}`} 
          className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10"
        >
          {[...Array(cols)].map((_, j) => (
            <div key={`c-${j}`} className="h-3 bg-white/10 rounded-full flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
