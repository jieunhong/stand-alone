"use client";

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
    title: string;
    description: string;
    target?: string; // CSS selector for highlighting
    position: 'top' | 'center' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
    {
        title: "환영합니다! 👋",
        description: "Stand-Alone과 함께 온전한 홀로서기를 시작해보세요. 간단한 가이드로 앱 사용법을 안내해드릴게요.",
        position: "center"
    },
    {
        title: "헤더 영역 📊",
        description: "현재 목표와 남은 기간을 한눈에 확인할 수 있어요. D-Day 카운터로 동기부여를 받아보세요!",
        target: "header",
        position: "top"
    },
    {
        title: "일일 체크 ✅",
        description: "매일 자신의 컨디션을 기록해보세요. 수면, 영양, 스트레스, 충동, 운동 5가지 항목을 체크합니다.",
        position: "center"
    },
    {
        title: "일기와 다짐 📝",
        description: "오늘의 일기를 작성하고, 내일의 다짐을 남겨보세요. 어제의 다짐은 오늘 자동으로 보여집니다.",
        position: "center"
    },
    {
        title: "캘린더 📅",
        description: "날짜별 기록을 달력에서 확인하고, 과거 기록을 언제든 수정할 수 있어요.",
        target: "nav",
        position: "bottom"
    },
    {
        title: "통계 📈",
        description: "나의 성장을 그래프와 통계로 확인하세요. 평균 점수와 항목별 추이를 분석할 수 있습니다.",
        target: "nav",
        position: "bottom"
    },
    {
        title: "준비됐나요? 🎉",
        description: "이제 Stand-Alone과 함께 당신의 여정을 시작할 준비가 끝났어요. 오늘부터 하루하루 기록해보세요!",
        position: "center"
    }
];

interface OnboardingTourProps {
    onComplete: () => void;
    onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = TOUR_STEPS[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === TOUR_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(onSkip, 300);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Spotlight effect for targeted elements */}
            {step.target && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                        borderRadius: '24px',
                        transition: 'all 0.3s ease-in-out'
                    }}
                />
            )}

            {/* Tour Card */}
            <div
                className={`absolute left-1/2 -translate-x-1/2 w-[90%] max-w-md transition-all duration-500 ease-out ${step.position === 'top' ? 'top-24' :
                        step.position === 'bottom' ? 'bottom-32' :
                            'top-1/2 -translate-y-1/2'
                    } ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border-2 border-white/50 p-6">
                    {/* Close Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-4">
                        {TOUR_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                        ? 'w-8 bg-gradient-to-r from-[#A8E6A3] to-[#7DD87D]'
                                        : index < currentStep
                                            ? 'w-2 bg-[#A8E6A3]/50'
                                            : 'w-2 bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            {step.title}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {step.description}
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        {!isFirstStep ? (
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="font-medium">이전</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="text-sm text-gray-400 font-medium">
                            {currentStep + 1} / {TOUR_STEPS.length}
                        </div>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#A8E6A3] to-[#7DD87D] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            <span>{isLastStep ? '시작하기' : '다음'}</span>
                            {!isLastStep && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Skip Button (only show on first steps) */}
                    {!isLastStep && (
                        <button
                            onClick={handleSkip}
                            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            건너뛰기
                        </button>
                    )}
                </div>
            </div>

            {/* Helper arrow for targeted elements */}
            {step.target && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 ${step.position === 'top' ? 'top-20' : 'bottom-28'
                        } animate-bounce`}
                >
                    <div className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent ${step.position === 'top'
                            ? 'border-b-[16px] border-b-white/95'
                            : 'border-t-[16px] border-t-white/95'
                        }`} />
                </div>
            )}
        </div>
    );
}
