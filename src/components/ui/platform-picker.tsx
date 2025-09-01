'use client';

import { useState } from 'react';
import { Badge } from './badge';
import { PLATFORMS, Platform } from './platform-icons';

interface PlatformPickerProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  maxSelection?: number;
  className?: string;
  disabled?: boolean;
}

export function PlatformPicker({
  selectedPlatforms,
  onPlatformsChange,
  maxSelection = 5,
  className = '',
  disabled = false
}: PlatformPickerProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const togglePlatform = (platformValue: string) => {
    if (disabled) return;
    
    const isSelected = selectedPlatforms.includes(platformValue);
    
    if (isSelected) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platformValue));
    } else {
      if (selectedPlatforms.length < maxSelection) {
        onPlatformsChange([...selectedPlatforms, platformValue]);
      }
    }
  };

  const isPlatformSelected = (platformValue: string) => {
    return selectedPlatforms.includes(platformValue);
  };

  const canSelectMore = selectedPlatforms.length < maxSelection;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Platforms *
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedPlatforms.length}/{maxSelection} selected
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {PLATFORMS.map((platform) => {
          const isSelected = isPlatformSelected(platform.value);
          const Icon = platform.icon;
          
          return (
            <button
              key={platform.value}
              type="button"
              onClick={() => togglePlatform(platform.value)}
              disabled={disabled || (!isSelected && !canSelectMore)}
              onMouseEnter={() => setHoveredPlatform(platform.value)}
              onMouseLeave={() => setHoveredPlatform(null)}
              className={`
                relative group p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? `${platform.bgColor} border-transparent text-white shadow-md scale-105` 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }
                ${disabled || (!isSelected && !canSelectMore) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:shadow-md'
                }
                ${hoveredPlatform === platform.value && !isSelected 
                  ? 'border-gray-400 dark:border-gray-400' 
                  : ''
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Platform icon and label */}
              <div className="flex flex-col items-center space-y-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isSelected 
                    ? 'bg-white/20' 
                    : platform.bgColor
                  }
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <span className={`
                  text-xs font-medium text-center
                  ${isSelected 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}>
                  {platform.label}
                </span>
              </div>
              
              {/* Hover effect */}
              {hoveredPlatform === platform.value && !isSelected && (
                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-50" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Help text */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {selectedPlatforms.length === 0 && (
          <span className="text-amber-600 dark:text-amber-400">
            Please select at least one platform
          </span>
        )}
        {selectedPlatforms.length > 0 && (
          <span>
            Selected: {selectedPlatforms.map(p => {
              const platform = PLATFORMS.find(pl => pl.value === p);
              return platform?.label || p;
            }).join(', ')}
          </span>
        )}
      </div>
      
      {/* Max selection warning */}
      {selectedPlatforms.length >= maxSelection && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          Maximum {maxSelection} platforms can be selected
        </div>
      )}
    </div>
  );
}
