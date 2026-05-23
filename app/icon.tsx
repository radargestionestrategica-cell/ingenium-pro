import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#020609',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: '#E8A020',
            fontWeight: 900,
            lineHeight: 1,
            display: 'flex',
          }}
        >
          Ω
        </div>
      </div>
    ),
    { ...size },
  );
}
