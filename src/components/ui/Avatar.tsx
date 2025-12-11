import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className={cn(
          "rounded-full object-cover bg-gray-100",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-green-100 flex items-center justify-center font-medium text-green-700",
        sizes[size],
        className
      )}
    >
      {initials || <User className={iconSizes[size]} />}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string }>;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
}

export function AvatarGroup({ avatars, max = 4, size = "md" }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapSizes = {
    xs: "-ml-2",
    sm: "-ml-2",
    md: "-ml-3",
    lg: "-ml-4",
  };

  return (
    <div className="flex items-center">
      {displayed.map((avatar, i) => (
        <div
          key={i}
          className={cn(
            "ring-2 ring-white rounded-full",
            i > 0 && overlapSizes[size]
          )}
        >
          <Avatar src={avatar.src} name={avatar.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "ring-2 ring-white rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium",
            overlapSizes[size],
            size === "xs" && "w-6 h-6 text-xs",
            size === "sm" && "w-8 h-8 text-xs",
            size === "md" && "w-10 h-10 text-sm",
            size === "lg" && "w-12 h-12 text-sm"
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
