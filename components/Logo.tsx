export default function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="120"
        height="60"
        viewBox="0 0 120 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark Teal Green capsule (left) */}
        <rect
          x="0"
          y="20"
          width="40"
          height="20"
          rx="10"
          fill="#146152"
          transform="rotate(-15 20 30)"
        />
        {/* Forest Green capsule (middle-left) */}
        <rect
          x="25"
          y="25"
          width="40"
          height="20"
          rx="10"
          fill="#288020"
          transform="rotate(-15 45 35)"
        />
        {/* Chartreuse Green capsule (middle-right) */}
        <rect
          x="50"
          y="30"
          width="40"
          height="20"
          rx="10"
          fill="#B9EF2C"
          transform="rotate(-15 70 40)"
        />
        {/* Bright Yellow capsule (right) */}
        <rect
          x="75"
          y="35"
          width="30"
          height="20"
          rx="10"
          fill="#FFEA35"
          transform="rotate(-15 90 45)"
        />
        {/* Vibrant Orange circle */}
        <circle cx="105" cy="45" r="12" fill="#FF4F22" />
      </svg>
    </div>
  );
}

