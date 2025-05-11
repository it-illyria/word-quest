import {motion} from "framer-motion";
import React from "react";

interface MotionCombinedProps {
    children: React.ReactNode;
    /**
     * Enable fade animation (default: true)
     */
    fade?: boolean;
    /**
     * Enable scale animation (default: false)
     */
    scale?: boolean;
    /**
     * Enable rotate animation (default: false)
     */
    rotate?: boolean;
    /**
     * Enable slide animation (default: false)
     */
    slide?: boolean;
    /**
     * Slide direction (default: 'up')
     */
    direction?: "up" | "down" | "left" | "right";
    /**
     * Animation duration in seconds (default: 0.5)
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
     * Initial opacity (default: 0)
     */
    initialOpacity?: number;
    /**
     * Overshoot scale during animation (default: 1.05)
     */
    bounceScale?: number;
    /**
     * Rotation degrees during animation (default: 5)
     */
    rotationDegrees?: number;
}

const MotionCombined: React.FC<MotionCombinedProps> = ({
                                                           children,
                                                           fade = true,
                                                           scale = false,
                                                           rotate = false,
                                                           slide = false,
                                                           direction = "up",
                                                           duration = 0.5,
                                                           delay = 0,
                                                           once = true,
                                                           className,
                                                           style,
                                                           initialOpacity = 0,
                                                           bounceScale = 1.05,
                                                           rotationDegrees = 5
                                                       }) => {
    const getSlideOffset = () => {
        switch (direction) {
            case "up":
                return {y: 20};
            case "down":
                return {y: -20};
            case "left":
                return {x: 20};
            case "right":
                return {x: -20};
            default:
                return {y: 20};
        }
    };

    const variants = {
        initial: {
            opacity: fade ? initialOpacity : 1,
            ...(scale && {scale: 0.95}),
            ...(rotate && {rotate: -rotationDegrees}),
            ...(slide && getSlideOffset())
        },
        animate: {
            opacity: 1,
            scale: scale ? [0.95, bounceScale, 1] : 1,
            rotate: rotate ? [rotationDegrees, -rotationDegrees / 2, 0] : 0,
            x: 0,
            y: 0,
            transition: {
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
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

export default MotionCombined;