/**
 * Dashboard Example - Demonstrates proper container layout with a chart widget
 * 
 * This example shows how to:
 * - Keep the background fixed and fill the viewport (no collapse)
 * - Stack widgets inside the container without breaking layout
 * - Use flexbox so widgets remain in normal flow
 * - Ensure container has min-height: 100vh and background styling intact
 */

import { useState } from 'react';

// Simple example chart component
const ExampleChart = () => {
  const chartData = [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 45 },
    { label: 'Mar', value: 35 },
    { label: 'Apr', value: 60 },
    { label: 'May', value: 50 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="chart-area">
      <div className="flex items-end justify-between h-full gap-2 px-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div 
              className="w-full bg-[#54bd95] rounded-t transition-all duration-300 hover:bg-[#48a883]"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-500 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardExample = () => {
  const [widgets] = useState([
    { id: 1, type: 'chart', title: 'Sales Chart' }
  ]);

  return (
    <div className="dashboard-example">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Dashboard with Chart Widget
      </h2>
      
      {/* Widget container - Uses flexbox to stack widgets properly */}
      <div className="widget-container">
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-wrapper">
            {/* Widget header */}
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-700">
                {widget.title}
              </h3>
            </div>
            
            {/* Chart widget content */}
            <ExampleChart />
          </div>
        ))}
      </div>

      {/* CSS Structure Explanation:
       * 
       * 1. dashboard-example - The outer container with:
       *    - min-height: 100vh (fills viewport)
       *    - background styling (gradient)
       *    - padding for spacing
       * 
       * 2. widget-container - The widget wrapper with:
       *    - background: white
       *    - border-radius, box-shadow
       *    - min-height: 300px
       *    - display: flex, flex-direction: column
       * 
       * 3. widget-wrapper - Ensures widget content doesn't collapse:
       *    - height: 100%
       *    - display: flex, flex-direction: column
       *    - min-height: 100%
       * 
       * 4. chart-area - The chart content area:
       *    - flex: 1 (fills available space)
       *    - min-height: 250px
       */}
    </div>
  );
};

export default DashboardExample;
