import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 64,
  height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1B3026',
          borderRadius: '14px',
          position: 'relative',
        }}
      >
        {/* Outer Square Bracket */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderLeft: '6px solid #76B38B',
            borderBottom: '6px solid #76B38B',
            borderRight: '6px solid #76B38B',
            borderTop: '6px solid #76B38B',
            borderTopRightRadius: '0px',
            position: 'absolute',
            top: '14px',
            left: '14px',
          }}
        />
        {/* Top-Right Gap Cover */}
        <div
          style={{
            width: '14px',
            height: '14px',
            background: '#1B3026',
            position: 'absolute',
            top: '11px',
            right: '11px',
          }}
        />
        {/* Dot in upper-right corner */}
        <div
          style={{
            width: '8px',
            height: '8px',
            background: '#76B38B',
            borderRadius: '50%',
            position: 'absolute',
            top: '12px',
            right: '12px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
