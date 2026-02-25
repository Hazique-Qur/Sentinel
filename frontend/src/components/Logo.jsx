import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 32, className = "", hideText = false }) => {
    return (
        <div
            className={`relative flex items-center justify-center overflow-visible ${className}`}
            style={{
                width: hideText ? size : size * 5,
                height: size,
                willChange: 'transform'
            }}
        >
            <svg
                width={hideText ? size : size * 5}
                height={size}
                viewBox={hideText ? "5 0 30 40" : "0 0 240 40"}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* Shield Base - Centered at x=52.5 */}
                <motion.path
                    d="M42.5 5L52.5 2L62.5 5V15C62.5 22.5 52.5 28 52.5 28C52.5 28 42.5 22.5 42.5 15V5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="text-blue-500"
                />

                {/* Internal Pulse/Eye - Centered at x=52.5 */}
                <motion.circle
                    cx="52.5"
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
                        {/* Radar Ring - Centered at x=52.5 */}
                        <motion.circle
                            cx="52.5"
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

                        {/* Text: SENTINEL - Positioned to balance with shield */}
                        <text
                            x="77.5"
                            y="27"
                            className="fill-white font-black"
                            style={{
                                fontSize: '22px',
                                fontFamily: 'Outfit, sans-serif'
                            }}
                        >
                            SENTINEL
                        </text>

                        {/* Underline/Accent - Calculated for symmetry */}
                        <motion.path
                            d="M77.5 33H197.5"
                            stroke="url(#gradient-line)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />

                        <defs>
                            <linearGradient id="gradient-line" x1="77.5" y1="33" x2="197.5" y2="33" gradientUnits="userSpaceOnUse">
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
