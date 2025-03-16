import React from 'react';
import Link from 'next/link';

const CreditUsage: React.FC = () => {
  // Mock data
  const creditData = {
    total: 100,
    used: 63,
    remaining: 37,
    historyData: [
      { day: 'Mon', value: 8 },
      { day: 'Tue', value: 12 },
      { day: 'Wed', value: 7 },
      { day: 'Thu', value: 9 },
      { day: 'Fri', value: 15 },
      { day: 'Sat', value: 6 },
      { day: 'Sun', value: 6 },
    ],
    expirationDate: '2023-11-30',
  };

  // Calculate progress percentage
  const progressPercentage = (creditData.used / creditData.total) * 100;

  // Find max value for chart scaling
  const maxChartValue = Math.max(...creditData.historyData.map(item => item.value));

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Credit Usage</h3>
        <Link href="/dashboard/billing" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          Buy Credits
        </Link>
      </div>
      
      <div className="p-5">
        {/* Credit Summary */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {creditData.remaining}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Credits Remaining
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-slate-900 dark:text-white">
              {creditData.total}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Total Credits
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-2">
          <div
            className="h-3 bg-primary-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Expires on {formatDate(creditData.expirationDate)}
        </div>
        
        {/* Weekly Usage Chart */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            This Week's Usage
          </h4>
          
          <div className="flex items-end justify-between h-32 mb-1">
            {creditData.historyData.map((day, index) => (
              <div key={index} className="w-8 flex flex-col items-center">
                <div 
                  className="w-5 bg-primary-100 dark:bg-primary-900/30 rounded-t"
                  style={{ 
                    height: `${(day.value / maxChartValue) * 100}%`,
                    minHeight: '4px'
                  }}
                >
                  <div 
                    className="w-full bg-primary-500 h-full rounded-t"
                    style={{ 
                      opacity: 0.7 + (index / creditData.historyData.length) * 0.3
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {day.day}
                </div>
              </div>
            ))}
          </div>
          
          {/* Total for week */}
          <div className="mt-4 text-center">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {creditData.historyData.reduce((acc, day) => acc + day.value, 0)} credits
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              used this week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditUsage;
