
import { useEffect, useState } from "react";

export const useDelayedMount = (active: boolean, delay: number = 300) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    
    if (active && !mounted) {
      setMounted(true);
    } else if (!active && mounted) {
      timeoutId = window.setTimeout(() => {
        setMounted(false);
      }, delay);
    }
    
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [active, delay, mounted]);
  
  return mounted;
};

export const useFadeAnimation = (
  condition: boolean,
  inAnimation: string = "animate-fade-in",
  outAnimation: string = "animate-fade-out"
) => {
  const [animation, setAnimation] = useState("");
  
  useEffect(() => {
    if (condition) {
      setAnimation(inAnimation);
    } else {
      setAnimation(outAnimation);
    }
  }, [condition, inAnimation, outAnimation]);
  
  return animation;
};

export function getStaggeredDelay(index: number, baseDelay: number = 50): string {
  const delay = index * baseDelay;
  return `${delay}ms`;
}
