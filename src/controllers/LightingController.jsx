import React, { useEffect, useState } from 'react';
import { ROOMS, assetUrl } from '../core/rooms.js';

export function RoomBackdrop({ roomId, lighting = 1, assetBase = '/assets/', children, className, onAlignmentWarning }) {
  const room = ROOMS.find(item => item.id === roomId);
  const [failedSunset, setFailedSunset] = useState(null);
  const [failedBright, setFailedBright] = useState(null);
  const warning = room && !room.verified ? room.notes || 'This image pair is not aligned; sunset blending is disabled.' : null;
  useEffect(() => { if (warning) onAlignmentWarning?.(warning); }, [warning, onAlignmentWarning]);
  if (!room) return <div className={className} role="alert">Room image is unavailable.</div>;
  const opacity = Number.isFinite(lighting) ? 1 - Math.min(1, Math.max(0, lighting)) : 0;
  const brightUrl = assetUrl(room.bright, assetBase);
  const sunsetUrl = assetUrl(room.sunset, assetBase);
  const imageStyle = { position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none' };
  return <div className={className} data-room={room.id}>
    <div style={{ position:'relative', width:'100%', aspectRatio:`${room.width} / ${room.height}`, overflow:'hidden', isolation:'isolate' }}>
      <img src={brightUrl} alt={room.label} style={imageStyle} onError={() => setFailedBright(brightUrl)} />
      {room.verified && failedSunset !== sunsetUrl && <img src={sunsetUrl} alt="" aria-hidden="true" style={{ ...imageStyle, opacity }} onError={() => setFailedSunset(sunsetUrl)} />}
      {children}
    </div>
    {warning && <p role="note">{warning}</p>}
    {failedBright === brightUrl && <p role="alert">Room image could not be loaded.</p>}
    {failedSunset === sunsetUrl && <p role="note">Sunset image could not be loaded. Bright view remains available.</p>}
  </div>;
}
