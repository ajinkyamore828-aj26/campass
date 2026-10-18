import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Interface for component props for type safety and reusability
export interface PlaceCardProps {
  images: string[];
  tags: string[];
  rating: number;
  title: string;
  dateRange: string;
  hostType: string;
  isTopRated?: boolean;
  description: string;
  pricePerNight: number;
  className?: string;
}

export const PlaceCard = ({
  images,
  tags,
  rating,
  title,
  dateRange,
  hostType,
  isTopRated = false,
  description,
  pricePerNight,
  className,
}: PlaceCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Carousel image change handler
  const changeImage = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return images.length - 1;
      if (nextIndex >= images.length) return 0;
      return nextIndex;
    });
  };

  // Animation variants for the carousel
  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Animation variants for staggering content
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      variants={contentVariants}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0px 10px 30px -5px rgba(0, 0, 0, 0.08)',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-md cursor-pointer transition-all',
        className
      )}
    >
      {/* Image Carousel Section */}
      <div className="relative group h-64 overflow-hidden bg-zinc-100">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || images[0]}
            alt={title}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute h-full w-full object-cover"
          />
        </AnimatePresence>
        
        {/* Carousel Navigation */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <Button
              type="button"
              variant="ghost" 
              size="icon" 
              className="pointer-events-auto rounded-full bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center border border-white/20" 
              onClick={(e) => {
                e.stopPropagation();
                changeImage(-1);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost" 
              size="icon" 
              className="pointer-events-auto rounded-full bg-black/40 hover:bg-black/60 text-white w-8 h-8 flex items-center justify-center border border-white/20" 
              onClick={(e) => {
                e.stopPropagation();
                changeImage(1);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Top Badges and Rating */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-white/80 backdrop-blur-md text-zinc-800 border border-zinc-200/60 shadow-xs font-semibold text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="flex items-center gap-1 bg-white/80 backdrop-blur-md text-zinc-800 border border-zinc-200/60 shadow-xs font-semibold text-xs">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> {rating}
          </Badge>
        </div>

        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  currentIndex === index ? 'w-4 bg-white' : 'bg-white/60'
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <motion.div variants={contentVariants} className="p-5 space-y-3.5 bg-white">
        <motion.div variants={itemVariants} className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold text-zinc-950 leading-snug tracking-tight line-clamp-1">{title}</h3>
          {isTopRated && <Badge variant="outline" className="text-zinc-700 border-zinc-300 shrink-0 text-[11px] font-medium">Top rated</Badge>}
        </motion.div>

        <motion.div variants={itemVariants} className="text-sm text-zinc-500 flex items-center gap-1.5">
          <span>{dateRange}</span> &bull; <span>{hostType}</span>
        </motion.div>

        <motion.p variants={itemVariants} className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
          {description}
        </motion.p>

        <motion.div variants={itemVariants} className="flex justify-between items-center pt-3 border-t border-zinc-100">
          <p className="font-bold text-zinc-950 text-base">
            ${pricePerNight}{' '}
            <span className="text-xs font-normal text-zinc-500">/ night</span>
          </p>
          <Button className="group bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl px-4 py-2 text-xs flex items-center shadow-xs">
            Book Now
            <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
