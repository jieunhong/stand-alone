import React from "react";

interface AppIconProps {
    size?: number;
    className?: string;
}

export function AppIcon({
    size = 64,
    className = "",
}: AppIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient
                    id="bgGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#A8E6A3" />
                    <stop offset="100%" stopColor="#7DD87D" />
                </linearGradient>
            </defs>

            {/* Rounded Rectangle Background */}
            <rect
                x="4"
                y="4"
                width="92"
                height="92"
                rx="20"
                fill="url(#bgGradient)"
            />

            {/* Dandelion - round and fluffy */}
            <g transform="translate(50, 50)">
                {/* Stem - curved to the left cutely */}
                <path
                    d="M 2 23 Q 3 12, -2 5 Q -1 2, 0 0"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* Center */}
                <circle cx="0" cy="0" r="3" fill="white" />

                {/* Round dandelion seeds - arranged in a circle */}
                {/* Inner circle */}
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="-10"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="0" cy="-10" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="7"
                        y2="-7"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="7" cy="-7" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="10"
                        y2="0"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="10" cy="0" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="7"
                        y2="7"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="7" cy="7" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-7"
                        y2="-7"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="-7" cy="-7" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-10"
                        y2="0"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="-10" cy="0" r="1.8" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-7"
                        y2="7"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle cx="-7" cy="7" r="1.8" fill="white" />
                </g>

                {/* Outer circle - more seeds */}
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="3"
                        y2="-14"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="3" cy="-14" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="10"
                        y2="-10"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="10" cy="-10" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="14"
                        y2="-3"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="14" cy="-3" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="14"
                        y2="3"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="14" cy="3" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="10"
                        y2="10"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="10" cy="10" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="3"
                        y2="14"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="3" cy="14" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-3"
                        y2="14"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-3" cy="14" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-10"
                        y2="10"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-10" cy="10" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-14"
                        y2="3"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-14" cy="3" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-14"
                        y2="-3"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-14" cy="-3" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-10"
                        y2="-10"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-10" cy="-10" r="1.6" fill="white" />
                </g>
                <g>
                    <line
                        x1="0"
                        y1="0"
                        x2="-3"
                        y2="-14"
                        stroke="white"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                    />
                    <circle cx="-3" cy="-14" r="1.6" fill="white" />
                </g>

                {/* Flying away seeds - towards upper right */}
                <circle
                    cx="20"
                    cy="-18"
                    r="1.3"
                    fill="white"
                    opacity="0.8"
                />
                <circle
                    cx="25"
                    cy="-15"
                    r="1.2"
                    fill="white"
                    opacity="0.7"
                />
                <circle
                    cx="22"
                    cy="-2"
                    r="1.1"
                    fill="white"
                    opacity="0.65"
                />
                <circle
                    cx="28"
                    cy="-19"
                    r="1"
                    fill="white"
                    opacity="0.6"
                />
                <circle
                    cx="24"
                    cy="-12"
                    r="1.2"
                    fill="white"
                    opacity="0.7"
                />
            </g>
        </svg>
    );
}