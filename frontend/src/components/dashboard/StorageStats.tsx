import React from 'react';

const StorageStats: React.FC = () => {
  // Mock data
  const storageData = {
    total: 50, // GB
    used: 12.5, // GB
    percentUsed: 25, // %
    breakdown: [
      { type: 'Images', size: 5.2, color: 'bg-blue-500' },
      { type: 'Videos', size: 4.8, color: 'bg-purple-500' },
      { type: 'Audio', size: 1.2, color: 'bg-green-500' },
      { type: '3D Models', size: 0.8, color: 'bg-yellow-500' },
      { type: 'Other', size: 0.5, color: 'bg-gray-500' },
    ],
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Storage Overview</h3>
      </div>
      
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {storageData.used.toFixed(1)} GB
              <span className="ml-2 text-base font-normal text-slate-500 dark:text-slate-400">
                of {storageData.total} GB used
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {storageData.percentUsed}%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Used</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-8">
          <div
            className="h-3 bg-primary-500 rounded-full"
            style={{ width: `${storageData.percentUsed}%` }}
          ></div>
        </div>
        
        {/* Storage Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Storage Breakdown
          </h4>
          <div className="space-y-2">
            {storageData.breakdown.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                <div className="flex-1 text-sm text-slate-600 dark:text-slate-300">
                  {item.type}
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.size.toFixed(1)} GB
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageStats;
