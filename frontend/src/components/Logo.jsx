import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 32, className = "", hideText = false }) => {
    return (
        <div
            className={`relative flex items-center justify-start overflow-visible ${className}`}
            style={{
                width: hideText ? size : size * 8,
                height: size,
                willChange: 'transform'
            }}
        >
            <svg
                width={hideText ? size : size * 8}
                height={size}
                viewBox={hideText ? "5 0 30 40" : "0 0 320 40"}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* Shield Base */}
                <motion.path
                    d="M10 5L20 2L30 5V15C30 22.5 20 28 20 28C20 28 10 22.5 10 15V5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="text-blue-500"
                />

                {/* Internal Pulse/Eye - Simplified for Performance */}
                <motion.circle
                    cx="20"
                    cy="12"
                    r="4"
                    animate={{
                        opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    fill="currentColor"
                    className="text-blue-400"
                />

                {!hideText && (
                    <>
                        {/* Radar Ring */}
                        <motion.circle
                            cx="20"
                            cy="12"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="0.5"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{
                                scale: [0.5, 1.5],
                                opacity: [0.5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut"
                            }}
                            className="text-blue-500/50"
                        />

                        {/* Text: SENTINEL - Expanded space and fixed tracking */}
                        <text
                            x="42"
                            y="26"
                            className="fill-white font-black"
                            style={{
                                fontSize: '20px',
                                fontFamily: 'Outfit, sans-serif',
                                letterSpacing: '0.05em'
                            }}
                        >
                            SENTINEL
                        </text>

                        {/* Underline/Accent - Extended to full brand width */}
                        <motion.path
                            d="M40 33H160"
                            stroke="url(#gradient-line)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />

                        <defs>
                            <linearGradient id="gradient-line" x1="40" y1="33" x2="160" y2="33" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#3B82F6" />
                                <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </>
                )}
            </svg>
        </div>
    );
};

export default Logo;
