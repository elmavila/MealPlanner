import { useState } from "react";

interface RecipeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

function RecipeImage({
  src,
  alt,
  className,
  loading = "lazy",
}: RecipeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) return <div className={className} aria-hidden="true" />;

  if (hasError) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center bg-[#d8dfbd] px-4 text-center text-sm text-[#71834e]`}
      >
        Image could not be loaded
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export default RecipeImage;
