import {motion} from "framer-motion";
import React from "react";

interface MotionFadeProps {
    children: React.ReactNode;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
    once?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const MotionFade: React.FC<MotionFadeProps> = ({
                                                   children,
                                                   direction = "up",
                                                   delay = 0,
                                                   duration = 0.5,
                                                   once = true,
                                                   className,
                                                   style
                                               }) => {
    const getInitialPosition = () => {
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
            opacity: 0,
            ...getInitialPosition()
        },
        animate: {
            opacity: 1,
            y: 0,
            x: 0,
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
            viewport={{once, amount: 0.2}}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
};

export default MotionFade;
