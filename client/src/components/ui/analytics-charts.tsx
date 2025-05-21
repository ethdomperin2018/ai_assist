import React from "react";

// Simple Chart Components for Analytics Dashboard
// Note: In a production environment, you would use a proper charting library like Chart.js or Recharts

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

export function PieChart({ data }: { data: ChartData }) {
  // Calculate total for percentages
  const total = data.datasets[0].data.reduce((acc, value) => acc + value, 0);
  
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="relative w-40 h-40">
        {/* We're using a simplified pie chart for demo purposes */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.datasets[0].data.map((value, index) => {
            const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
              ? data.datasets[0].backgroundColor[index] 
              : data.datasets[0].backgroundColor || "#3b82f6";
            
            // Calculate percentage and angle for pie segments
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const startAngle = index > 0 
              ? data.datasets[0].data.slice(0, index).reduce((acc, val) => acc + (val / total) * 360, 0) 
              : 0;
            const endAngle = startAngle + (value / total) * 360;
            
            // Calculate SVG arc path
            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            
            // Only render if we have data
            if (percentage > 0) {
              return (
                <path 
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={backgroundColor}
                />
              );
            }
            return null;
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="ml-4 flex flex-col">
        {data.labels.map((label, index) => (
          <div key={index} className="flex items-center mb-2">
            <div 
              className="w-3 h-3 mr-2 rounded-sm" 
              style={{ 
                backgroundColor: Array.isArray(data.datasets[0].backgroundColor) 
                  ? data.datasets[0].backgroundColor[index] 
                  : data.datasets[0].backgroundColor || "#3b82f6"
              }}
            ></div>
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data }: { data: ChartData }) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="w-full h-64">
      <div className="w-full h-full flex items-end">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const backgroundColor = Array.isArray(data.datasets[0].backgroundColor) 
            ? data.datasets[0].backgroundColor[index] 
            : data.datasets[0].backgroundColor || "#3b82f6";
          
          // Calculate height percentage based on the maximum value
          const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full px-1">
                <div 
                  className="w-full rounded-t-md"
                  style={{ 
                    height: `${heightPercentage}%`, 
                    backgroundColor,
                    minHeight: value > 0 ? '4px' : '0'
                  }}
                ></div>
              </div>
              <div className="text-xs mt-2 text-center">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LineChart({ data }: { data: ChartData }) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data.datasets[0].data);
  
  // Generate points for the line
  const points = data.datasets[0].data.map((value, index) => {
    const x = (index / (data.labels.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
        
        {/* The line chart */}
        <polyline
          fill="none"
          stroke={data.datasets[0].borderColor || "#3b82f6"}
          strokeWidth="2"
          points={points}
        />
        
        {/* Data points */}
        {data.datasets[0].data.map((value, index) => {
          const x = (index / (data.labels.length - 1)) * 100;
          const y = 100 - (value / maxValue) * 100;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={data.datasets[0].borderColor || "#3b82f6"}
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.labels.map((label, index) => (
          <div key={index} className="text-xs text-gray-500">{label}</div>
        ))}
      </div>
    </div>
  );
}