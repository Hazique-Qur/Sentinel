import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 32, className = "", hideText = false }) => {
    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{
                width: hideText ? size : size * 3.5,
                height: size,
                willChange: 'transform'
            }}
        >
            <svg
                width={hideText ? size : size * 3.5}
                height={size}
                viewBox={hideText ? "5 0 30 40" : "0 0 140 40"}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow(0 0 4px rgba(59,130,246,0.3))"
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

                {/* Internal Pulse/Eye */}
                <motion.circle
                    cx="20"
                    cy="12"
                    r="4"
                    initial={{ scale: 0.8, opacity: 0.3 }}
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
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

                        {/* Text: SENTINEL */}
                        <text
                            x="38"
                            y="25"
                            className="fill-white font-black tracking-tighter"
                            style={{ fontSize: '18px', fontFamily: 'Outfit, sans-serif' }}
                        >
                            SENTINEL
                        </text>

                        {/* Underline/Accent */}
                        <motion.path
                            d="M38 30H140"
                            stroke="url(#gradient-line)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />

                        <defs>
                            <linearGradient id="gradient-line" x1="38" y1="30" x2="140" y2="30" gradientUnits="userSpaceOnUse">
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
