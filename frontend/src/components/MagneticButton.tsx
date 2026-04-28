import { motion, useMotionValue, useSpring } from "framer-motion";
import { ReactNode, useRef, ButtonHTMLAttributes } from "react";

interface MagneticButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  children: ReactNode;
  className?: string;
}

const MagneticButton = ({ children, className = "", ...props }: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
