import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" fill="#09090b" />
        <path
          d="M9.5 10.5H18.25C20.5972 10.5 22.5 12.4028 22.5 14.75V21.5H13.75C11.4028 21.5 9.5 19.5972 9.5 17.25V10.5Z"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M14.25 13.25L19.25 16L14.25 18.75V13.25Z" fill="#ffffff" />
      </svg>
    ),
    size,
  );
}
