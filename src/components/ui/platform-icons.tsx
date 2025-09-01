import { Smartphone, Monitor, Gamepad2, Tablet, Laptop, Apple, Smartphone as Android } from 'lucide-react';
import { Badge } from './badge';

export interface Platform {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const PLATFORMS: Platform[] = [
  { 
    value: 'ios', 
    label: 'iOS', 
    icon: Apple, 
    color: 'text-white',
    bgColor: 'bg-black'
  },
  { 
    value: 'android', 
    label: 'Android', 
    icon: Android, 
    color: 'text-white',
    bgColor: 'bg-green-600'
  },
  { 
    value: 'web', 
    label: 'Web', 
    icon: Monitor, 
    color: 'text-white',
    bgColor: 'bg-blue-600'
  },
  { 
    value: 'windows', 
    label: 'Windows', 
    icon: Laptop, 
    color: 'text-white',
    bgColor: 'bg-blue-700'
  },
  { 
    value: 'mac', 
    label: 'macOS', 
    icon: Laptop, 
    color: 'text-white',
    bgColor: 'bg-gray-800'
  },
  { 
    value: 'switch', 
    label: 'Nintendo Switch', 
    icon: Gamepad2, 
    color: 'text-white',
    bgColor: 'bg-red-600'
  },
  { 
    value: 'ps5', 
    label: 'PlayStation 5', 
    icon: Gamepad2, 
    color: 'text-white',
    bgColor: 'bg-blue-500'
  },
  { 
    value: 'xbox', 
    label: 'Xbox', 
    icon: Gamepad2, 
    color: 'text-white',
    bgColor: 'bg-green-700'
  },
  { 
    value: 'tablet', 
    label: 'Tablet', 
    icon: Tablet, 
    color: 'text-white',
    bgColor: 'bg-purple-600'
  }
];

interface PlatformIconsProps {
  platforms: string[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function PlatformIcons({ 
  platforms, 
  size = 'md', 
  showLabels = false, 
  className = '' 
}: PlatformIconsProps) {
  if (!platforms || platforms.length === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Badge variant="outline" className="text-xs">
          <Monitor className="w-3 h-3 mr-1" />
          Unknown
        </Badge>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {platforms.map((platformValue, index) => {
        const platform = PLATFORMS.find(p => p.value === platformValue.toLowerCase());
        
        if (!platform) {
          return (
            <Badge key={`${platformValue}-${index}`} variant="outline" className={sizeClasses[size]}>
              <Monitor className={`${iconSizeClasses[size]} mr-1`} />
              {platformValue}
            </Badge>
          );
        }

        const Icon = platform.icon;
        
        return (
          <Badge 
            key={`${platform.value}-${index}`}
            className={`${sizeClasses[size]} ${platform.bgColor} ${platform.color} border-0`}
          >
            <Icon className={`${iconSizeClasses[size]} mr-1`} />
            {showLabels ? platform.label : platform.value.toUpperCase()}
          </Badge>
        );
      })}
    </div>
  );
}

// Compact version for small spaces
export function PlatformIconsCompact({ 
  platforms, 
  className = '' 
}: Omit<PlatformIconsProps, 'size' | 'showLabels'>) {
  if (!platforms || platforms.length === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
          <Monitor className="w-2 h-2 text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {platforms.slice(0, 3).map((platformValue) => {
        const platform = PLATFORMS.find(p => p.value === platformValue.toLowerCase());
        
        if (!platform) {
          return (
            <div key={platformValue} className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
              <Monitor className="w-2 h-2 text-gray-600" />
            </div>
          );
        }

        const Icon = platform.icon;
        
        return (
          <div 
            key={platform.value}
            className={`w-4 h-4 ${platform.bgColor} rounded-full flex items-center justify-center`}
            title={platform.label}
          >
            <Icon className="w-2 h-2 text-white" />
          </div>
        );
      })}
      {platforms.length > 3 && (
        <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-medium">+{platforms.length - 3}</span>
        </div>
      )}
    </div>
  );
}
