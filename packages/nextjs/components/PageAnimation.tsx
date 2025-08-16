"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PageAnimationProps {
  children: React.ReactNode;
  className?: string;
}

export const PageAnimation = ({ children, className = "" }: PageAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
