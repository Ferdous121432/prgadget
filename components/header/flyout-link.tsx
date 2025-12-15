// TODO: at renderFlyoutContent() add the correct component to render or changeit according to the flyoutContent prop
"use client";
import React, { useState } from "react";
import Projects from "./nav-page";
import { AnimatePresence, delay, motion, stagger } from "framer-motion";

const flyoutVariants = {
  hidden: {
    opacity: 0,
    zIndex: 0,
    y: -100,
    transition: {
      staggerChildren: 0.3,
      duration: 0.3,
      ease: "easeOut",
    },
  },
  enter: {
    opacity: 1,
    zIndex: 0,
    y: 0,
    transition: {
      staggerChildren: 0.5,
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

interface FlyoutLinkProps {
  children: React.ReactNode;
  flyoutContent: string;
  link: string;
  lastChild?: boolean;
}

export default function FlyoutLink({
  children,
  flyoutContent,
  link,
  lastChild,
}: FlyoutLinkProps) {
  const [open, setOpen] = useState(false);

  interface AnimationProps {
    initial: string;
    animate: string;
    exit: string;
    variants: typeof flyoutVariants;
  }

  const animation = (variants: typeof flyoutVariants): AnimationProps => {
    return {
      initial: "hidden",
      animate: open ? "enter" : "hidden",
      exit: "exit",
      variants,
    };
  };

  const showFlyout = open && flyoutContent;

  const renderFlyoutContent = () => {
    switch (flyoutContent) {
      case "sales":
        return <Projects />;
      case "new arrivals":
        return <Projects />;
      case "men":
        return <Projects />;
      case "women":
        return <Projects />;
      case "kids":
        return <Projects />;
      case "newborn":
        return <Projects />;
      case "accessories":
        return <Projects />;
      case "footwear":
        return <Projects />;

      default:
        return (
          <div>
            <Projects />
          </div>
        );
    }
  };

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="group z-20 h-fit w-full"
      style={{
        textAlign: lastChild ? "end" : "start",
      }}>
      <a href={link} className="relative">
        {children}

        <span
          style={{
            transform: open ? "scaleX(1)" : "scaleX(0)",
          }}
          className="roundedtrue absolute -bottom-2 -left-2 -right-2 h-1 origin-left bg-slate-900 transition-transform duration-300 ease-out"
        />
      </a>
      {/* <AnimatePresence>
        {showFlyout && (
          <motion.div
            // {...animation(flyoutVariants)}
            className="absolute left-0 top-14 w-screen bg-slate-200">
            <div className="absolute -top-4 left-0 h-12 w-full bg-transparent" />

            {showFlyout && renderFlyoutContent()}
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}
