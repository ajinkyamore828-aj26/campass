import * as React from 'react';
import { useAnimation, type SVGMotionProps } from 'motion/react';

type AnimationControlsType = ReturnType<typeof useAnimation>;

export interface IconProps<TAnimation extends string = string> extends Omit<SVGMotionProps<SVGSVGElement>, 'onMouseEnter' | 'onMouseLeave'> {
  size?: number | string;
  animation?: TAnimation;
  animate?: boolean | string | AnimationControlsType;
  animateOnHover?: boolean;
  onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
  onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
}

interface AnimateIconContextType {
  controls: AnimationControlsType | string;
  animation?: string;
}

const AnimateIconContext = React.createContext<AnimateIconContextType>({
  controls: 'initial',
});

export const useAnimateIconContext = () => React.useContext(AnimateIconContext);

export interface IconWrapperProps<TAnimation extends string = string> extends IconProps<TAnimation> {
  icon: React.ComponentType<IconProps<TAnimation>>;
}

export function IconWrapper<TAnimation extends string = string>({
  icon: Icon,
  size = 24,
  animation = 'default' as TAnimation,
  animate,
  animateOnHover = false,
  onMouseEnter,
  onMouseLeave,
  ...props
}: IconWrapperProps<TAnimation>) {
  const controls = useAnimation();

  React.useEffect(() => {
    if (typeof animate === 'boolean') {
      controls.start(animate ? 'animate' : 'initial');
    } else if (typeof animate === 'string') {
      controls.start(animate);
    }
  }, [animate, controls]);

  const handleMouseEnter = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animateOnHover && animate === undefined) {
      controls.start('animate');
    }
    if (onMouseEnter) {
      onMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<SVGSVGElement>) => {
    if (animateOnHover && animate === undefined) {
      controls.start('initial');
    }
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  return (
    <AnimateIconContext.Provider value={{ controls: (animate && typeof animate !== 'boolean') ? animate : controls, animation }}>
      <Icon
        size={size}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    </AnimateIconContext.Provider>
  );
}

export function getVariants<T extends Record<string, any>>(animations: T, key: keyof T = 'default' as keyof T) {
  return animations[key] ?? animations['default' as keyof T];
}
