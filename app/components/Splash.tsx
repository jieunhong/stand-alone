import React, { useEffect, useState } from 'react';
import { AppIcon } from './AppIcon';

export function Splash() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F5] via-[#F8F9FA] to-[#E8F5E9] animate-in fade-in duration-500">
            <div className="relative flex flex-col items-center">
                {/* Icon with scaling animation */}
                <div className="animate-in zoom-in-50 duration-1000 ease-out fill-mode-forwards">
                    <div className="relative shadow-2xl rounded-[32px] overflow-hidden animate-bounce-slow">
                        <AppIcon size={120} />
                    </div>
                </div>

                {/* Text content with delayed entry */}
                <div className="mt-10 text-center animate-in slide-in-from-bottom-5 fade-in duration-700 delay-500 fill-mode-forwards opacity-0">
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-[#2D4A2D] to-[#5A9E5A] bg-clip-text text-transparent mb-3">
                        Stand-Alone
                    </h1>
                    <p className="text-sm font-medium text-[#74A174] tracking-widest uppercase opacity-80">
                        당신의 온전한 홀로서기를 위하여
                    </p>
                </div>

                {/* Loading Indicator */}
                <div className="absolute -bottom-24 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#A8E6A3] animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#A8E6A3] animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#A8E6A3] animate-bounce"></div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .fill-mode-forwards {
          animation-fill-mode: forwards;
        }
      `}</style>
        </div>
    );
}
