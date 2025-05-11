import {motion} from "framer-motion";
import React from "react";

interface MotionScaleProps {
    children: React.ReactNode;
    /**
     * Initial scale (default: 0.95)
     */
    initialScale?: number;
    /**
     * Animation duration in seconds (default: 0.3)
     */
    duration?: number;
    /**
     * Delay before animation starts in seconds (default: 0)
     */
    delay?: number;
    /**
     * Should animation only happen once (default: true)
     */
    once?: boolean;
    /**
     * Custom className
     */
    className?: string;
    /**
     * Custom style
     */
    style?: React.CSSProperties;
    /**
     * Overshoot scale during animation (default: 1.05)
     */
    bounceScale?: number;
}

const MotionScale: React.FC<MotionScaleProps> = ({
                                                     children,
                                                     initialScale = 0.95,
                                                     duration = 0.3,
                                                     delay = 0,
                                                     once = true,
                                                     className,
                                                     style,
                                                     bounceScale = 1.05
                                                 }) => {
    const variants = {
        initial: {
            scale: initialScale,
            opacity: 0
        },
        animate: {
            scale: [initialScale, bounceScale, 1],
            opacity: 1,
            transition: {
                duration,
                delay,
                times: [0, 0.8, 1],
                ease: "anticipate"
            }
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={variants}
            viewport={{once}}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export default MotionScale;