import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Trophy, Sparkles, Star, Flame } from 'lucide-react';

interface CelebrationDialogProps {
    open: boolean;
    onClose: () => void;
    achievement: {
        title: string;
        description: string;
        icon: string;
    } | null;
}

export function CelebrationDialog({ open, onClose, achievement }: CelebrationDialogProps) {
    if (!achievement) return null;

    const getIconComponent = (iconName: string) => {
        const icons: Record<string, any> = {
            flame: Flame,
            star: Star,
            trophy: Trophy,
            sparkles: Sparkles,
        };
        return icons[iconName] || Trophy;
    };

    const IconComponent = getIconComponent(achievement.icon);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm bg-gradient-to-br from-white to-[#F0FFF0] border-2 border-[#7DD87D]/30 rounded-[32px] overflow-hidden p-0">
                <style jsx global>{`
                    [data-slot="dialog-content"] > button {
                        display: none;
                    }
                `}</style>
                <div className="p-8">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-gray-800">
                            축하합니다! 🎉
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center py-6">
                        {/* Animated Badge */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] rounded-full p-8 shadow-2xl">
                                <IconComponent className="w-16 h-16 text-white" />
                            </div>
                        </div>

                        {/* Achievement Info */}
                        <div className="text-center space-y-2 mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{achievement.title}</h3>
                            <p className="text-gray-600">{achievement.description}</p>
                        </div>

                        {/* Encouragement */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#E0E0E0]/50 w-full">
                            <p className="text-sm text-gray-700 text-center leading-relaxed">
                                멋진 성취예요! 이런 작은 성공들이 모여서 큰 변화를 만들어요. 계속 응원할게요! 💚
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="mt-6 w-full bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D] text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
