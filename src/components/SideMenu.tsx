'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiBook, 
  FiUsers, 
  FiMessageSquare, 
  FiAward,
  FiEdit3
} from 'react-icons/fi';

const menuItems = [
  { 
    icon: FiBook, 
    label: 'Library', 
    href: '/library',
    color: 'text-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600'
  },
  { 
    icon: FiUsers, 
    label: 'Learning', 
    href: '/learning',
    color: 'text-emerald-500',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-emerald-600'
  },
  { 
    icon: FiMessageSquare, 
    label: 'Q&A', 
    href: '/qna',
    color: 'text-violet-500',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-violet-600'
  },
  // { 
  //   icon: FiGlobe, 
  //   label: 'Dialogue', 
  //   href: '/dialogue',
  //   color: 'text-rose-500',
  //   gradientFrom: 'from-rose-500',
  //   gradientTo: 'to-rose-600'
  // },
  { 
    icon: FiEdit3, 
    label: 'Research', 
    href: '/opinions',
    color: 'text-amber-500',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-amber-600'
  },
  { 
    icon: FiAward, 
    label: 'Expert', 
    href: '/expert',
    color: 'text-indigo-500',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-indigo-600'
  }
];

export default function SideMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Menu Container */}
      <div className={`
        relative
        flex items-center
        bg-slate-900/90 backdrop-blur-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.25)]
        rounded-2xl
        border border-white/10
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-56 p-3' : 'w-16 p-2'}
      `}>
        <div className="flex flex-col w-full gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  relative flex items-center
                  px-2 py-2.5 gap-3
                  rounded-xl
                  transition-all duration-300
                  group/item
                  hover:bg-white/10
                  ${isActive ? 'bg-gradient-to-r ' + item.gradientFrom + ' ' + item.gradientTo : ''}
                `}
              >
                {/* Icon Container */}
                <div className={`
                  relative
                  w-8 h-8 rounded-lg
                  flex items-center justify-center
                  transition-all duration-300
                  ${isActive ? 'bg-white/20' : 'bg-white/10'}
                  group-hover/item:bg-white/20
                `}>
                  <Icon className={`
                    w-[20px] h-[20px]
                    transition-all duration-300
                    ${isActive ? 'text-white' : 'text-white/70'}
                    group-hover/item:text-white
                  `} />
                </div>

                {/* Label */}
                <span className={`
                  whitespace-nowrap font-medium text-sm
                  transition-all duration-300
                  ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 hidden'}
                  ${isActive ? 'text-white' : 'text-white/70'}
                  group-hover/item:text-white
                `}>
                  {item.label}
                </span>

                {/* Glow Effect */}
                {isActive && (
                  <div className={`
                    absolute inset-0 rounded-xl
                    ${item.gradientFrom} ${item.gradientTo}
                    opacity-20 blur-lg
                    transition-opacity duration-300
                  `} />
                )}

                {/* Active Indicator */}
                {isActive && !isExpanded && (
                  <div className={`
                    absolute right-2 w-1 h-1
                    rounded-full bg-white
                  `} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 