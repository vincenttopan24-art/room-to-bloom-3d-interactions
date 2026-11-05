import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, Matrix4 } from 'three';
import {findNode} from '../core/rigs.js';
import { calendarMonth } from '../core/study.js';
import { usePreparedModel, InteractiveGLB } from './InteractiveGLB.jsx';

const WIDTH = 1024, HEIGHT = 870;
export function calendarLayout(date = new Date()) {
  const month = calendarMonth(date);
  return { ...month, entries: month.days.flatMap((day, index) => day ? [{ ...day, column: index % 7, row: Math.floor(index / 7), x: 50 + (index % 7 + 0.5) * (WIDTH - 100) / 7, y: 265 + Math.floor(index / 7) * 96 }] : []) };
}
export function millisecondsUntilLocalMidnight(date = new Date()) {
  return Math.max(1, new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1) - date);
}
export function watchLocalDate(onDate, target = globalThis.document) {
  let timer, disposed = false;
  const update = () => {
    if (disposed) return;
    clearTimeout(timer);
    const now = new Date();
    onDate(now);
    timer = setTimeout(update, millisecondsUntilLocalMidnight(now));
  };
  const visible = () => { if (target?.visibilityState !== 'hidden') update(); };
  update();
  target?.addEventListener('visibilitychange', visible);
  return () => { disposed = true; clearTimeout(timer); target?.removeEventListener('visibilitychange', visible); };
}
export function drawCalendar(ctx, month, progress = 1) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#fffdf5';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#393b2f';
  ctx.font = 'bold 62px Georgia, serif';
  ctx.fillText(month.label, WIDTH / 2, 86);
  ctx.font = 'bold 31px sans-serif';
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((label, index) => {
    ctx.fillStyle = index >= 5 ? '#a04e38' : '#5b6352';
    ctx.fillText(label, 50 + (index + 0.5) * (WIDTH - 100) / 7, 177);
  });
  for (const day of month.entries) {
    if (day.isToday) {
      ctx.beginPath();
      ctx.ellipse(day.x, day.y, 44, 39, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe8cf';
      ctx.fill();
    }
    ctx.fillStyle = day.isToday ? '#a23127' : day.column >= 5 ? '#a04e38' : '#393b2f';
    ctx.font = `${day.isToday ? 'bold ' : ''}43px Georgia, serif`;
    ctx.fillText(String(day.day), day.x, day.y);
    if (day.isToday && progress > 0) {
      ctx.beginPath();
      ctx.ellipse(day.x, day.y, 48, 43, -0.08, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, Math.max(0, progress)));
      ctx.strokeStyle = '#ce3b32';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
}

export function calendarSurfaceHeight(scene){
  const art=findNode(scene,'Bertie Artwork and March Grid');
  if(!art?.geometry)return .13;
  art.geometry.computeBoundingBox();
  art.updateWorldMatrix(true,false);
  const relative=new Matrix4().copy(scene.matrixWorld).invert().multiply(art.matrixWorld);
  return art.geometry.boundingBox.clone().applyMatrix4(relative).max.y+.006;
}
export function Calendar({ assetBase }) {
  const model = usePreparedModel('calendar.glb', assetBase);
  const [date, setDate] = useState(() => new Date());
  const month = useMemo(() => calendarLayout(date), [date]);
  const progress = useRef(0);
  const surface = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const context = canvas.getContext('2d');
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return { context, texture };
  }, []);
  useEffect(() => watchLocalDate(next => setDate(previous => previous.toDateString() === next.toDateString() ? previous : next)), []);
  useEffect(() => {
    progress.current = 0;
    if (surface.context) drawCalendar(surface.context, month, 0);
    surface.texture.needsUpdate = true;
  }, [month, surface]);
  useEffect(() => () => surface.texture.dispose(), [surface]);
  useFrame((_, delta) => {
    if (progress.current >= 1 || !surface.context) return;
    progress.current = Math.min(1, progress.current + delta);
    drawCalendar(surface.context, month, progress.current);
    surface.texture.needsUpdate = true;
  });
  return <InteractiveGLB model={model} rotation={[Math.PI / 2, 0, 0]}>
    <mesh position={[0, calendarSurfaceHeight(model.scene), 1.66]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.68, 3.13]} />
      <meshBasicMaterial map={surface.texture} toneMapped={false} />
    </mesh>
  </InteractiveGLB>;
}
