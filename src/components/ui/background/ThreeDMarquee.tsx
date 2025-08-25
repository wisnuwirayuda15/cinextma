// https://ui.aceternity.com/components/3d-marquee

"use client";

import { cn } from "@/utils/helpers";
import { motion } from "framer-motion";

export interface ThreeDMarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  aspect?: "video" | "poster";
}

const ThreeDMarquee: React.FC<ThreeDMarqueeProps> = ({ images, className, aspect, ...props }) => {
  const chunkSize = Math.ceil(images.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return images.slice(start, start + chunkSize);
  });

  return (
    <div {...props} className={cn("mx-auto block size-full overflow-hidden", className)}>
      <div className="flex size-full items-center justify-center">
        <div className="size-[1400px] shrink-0 -translate-x-32 scale-75 md:scale-100">
          <div
            className="relative right-[50%] top-96 grid size-full origin-top-left grid-cols-4 gap-8"
            style={{
              transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-8"
                animate={{ y: colIndex % 2 === 0 ? 500 : -500 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: colIndex % 2 === 0 ? 10 : 15,
                }}
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((image, imageIndex) => (
                  <div className="relative" key={imageIndex + image}>
                    <GridLineHorizontal className="-top-4" offset="20px" />
                    <motion.img
                      src={image}
                      key={imageIndex + image}
                      alt={`Image ${imageIndex + 1}`}
                      width={aspect === "video" ? 970 : 600}
                      height={aspect === "video" ? 700 : 400}
                      whileHover={{
                        y: -40,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "rounded-lg object-cover ring ring-gray-950/5 hover:shadow-2xl",
                        {
                          "aspect-video": aspect === "video",
                          "aspect-[2/3]": aspect === "poster",
                        },
                      )}
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GridLineHorizontal = ({ className, offset }: { className?: string; offset?: string }) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "1px",
          "--width": "5px",
          "--fade-stop": "90%",
          "--offset": offset || "200px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]",
        "bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

const GridLineVertical = ({ className, offset }: { className?: string; offset?: string }) => {
  return (
    <div
      style={
        {
          "--background": "#ffffff",
          "--color": "rgba(0, 0, 0, 0.2)",
          "--height": "5px",
          "--width": "1px",
          "--fade-stop": "90%",
          "--offset": offset || "150px", //-100px if you want to keep the line inside
          "--color-dark": "rgba(255, 255, 255, 0.2)",
          maskComposite: "exclude",
        } as React.CSSProperties
      }
      className={cn(
        "absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]",
        "bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]",
        "[background-size:var(--width)_var(--height)]",
        "[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]",
        "[mask-composite:exclude]",
        "z-30",
        "dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]",
        className,
      )}
    ></div>
  );
};

export default ThreeDMarquee;
