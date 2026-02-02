import * as React from "react";
import { cn } from "@/lib/utils";

type DeferredImageProps = {
  src: string;
  alt: string;
  wrapperClassName?: string;
  imgClassName?: string;
  rootMargin?: string;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "className">;

export function DeferredImage({
  src,
  alt,
  wrapperClassName,
  imgClassName,
  rootMargin = "200px",
  ...imgProps
}: DeferredImageProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={cn("relative", wrapperClassName)}>
      {/* lightweight placeholder (keeps layout stable) */}
      {!loaded && (
        <div className="absolute inset-0 rounded-[inherit] bg-muted/40" aria-hidden="true" />
      )}

      {visible && (
        <img
          {...imgProps}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(e) => {
            setLoaded(true);
            imgProps.onLoad?.(e);
          }}
          className={cn(
            "h-full w-full rounded-[inherit] object-cover transition-opacity",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
