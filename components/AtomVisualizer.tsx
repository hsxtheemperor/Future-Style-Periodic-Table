'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { Element } from '@/lib/types'

interface Props {
  element: Element
  size?: number
  className?: string
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
const ORBIT_COLORS = [
  'rgba(100,200,255,0.35)',
  'rgba(80,170,255,0.3)',
  'rgba(60,140,255,0.28)',
  'rgba(40,100,255,0.25)',
  'rgba(20,70,220,0.22)',
  'rgba(10,40,200,0.2)',
  'rgba(5,20,180,0.18)',
]
const ELECTRON_COLORS = [
  '#38bdf8',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#c084fc',
  '#e879f9',
  '#f472b6',
]

interface DragState {
  isDragging: boolean
  lastX: number
  lastY: number
  rotX: number
  rotY: number
}

export function AtomVisualizer({ element, size = 200, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const dragState = useRef<DragState>({ isDragging: false, lastX: 0, lastY: 0, rotX: 15, rotY: 0 })
  const timeRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2

    ctx.clearRect(0, 0, W, H)

    const shells = element.shells
    const numShells = shells.length
    const maxR = Math.min(W, H) * 0.44
    const shellStep = numShells > 0 ? maxR / numShells : maxR

    const { rotX, rotY } = dragState.current
    const time = timeRef.current

    // Draw orbits as ellipses (3D perspective tilt)
    for (let s = 0; s < numShells; s++) {
      const r = shellStep * (s + 1)
      const tiltAngle = (rotX * Math.PI) / 180
      const yScale = Math.cos(tiltAngle)
      const rotAngle = (rotY * Math.PI) / 180

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rotAngle + (s * Math.PI) / numShells)

      ctx.beginPath()
      ctx.ellipse(0, 0, r, r * Math.abs(yScale), 0, 0, Math.PI * 2)
      ctx.strokeStyle = ORBIT_COLORS[s % ORBIT_COLORS.length]
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()
    }

    // Draw electrons
    for (let s = 0; s < numShells; s++) {
      const r = shellStep * (s + 1)
      const count = shells[s]
      const tiltAngle = (rotX * Math.PI) / 180
      const yScale = Math.cos(tiltAngle)
      const rotAngle = (rotY * Math.PI) / 180
      const speed = 0.4 + s * 0.15
      const orbitTilt = (s * Math.PI) / numShells + rotAngle
      const isValence = s === numShells - 1

      for (let e = 0; e < count; e++) {
        const baseAngle = (e / count) * Math.PI * 2
        const angle = baseAngle + time * speed
        const ex = Math.cos(angle) * r
        const ey = Math.sin(angle) * r * Math.abs(yScale)

        const cosT = Math.cos(orbitTilt)
        const sinT = Math.sin(orbitTilt)
        const px = cx + ex * cosT - ey * sinT
        const py = cy + ex * sinT + ey * cosT

        const eColor = ELECTRON_COLORS[s % ELECTRON_COLORS.length]
        const eSize = isValence ? 4.5 : 3

        ctx.save()
        ctx.beginPath()
        ctx.arc(px, py, eSize, 0, Math.PI * 2)
        ctx.fillStyle = eColor
        ctx.shadowColor = eColor
        ctx.shadowBlur = isValence ? 12 : 6
        ctx.fill()
        ctx.restore()
      }
    }

    // Draw nucleus
    const nucleusSize = Math.max(5, Math.min(12, 4 + numShells * 1.2))
    const grad = ctx.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, nucleusSize * 2)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.4, '#00d4ff')
    grad.addColorStop(1, 'rgba(0,100,200,0.1)')

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, nucleusSize, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.shadowColor = '#00d4ff'
    ctx.shadowBlur = 20
    ctx.fill()
    ctx.restore()

    timeRef.current += 0.018
    animRef.current = requestAnimationFrame(draw)
  }, [element])

  useEffect(() => {
    timeRef.current = 0
    dragState.current.rotX = 20
    dragState.current.rotY = 0
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw, element])

  // Mouse drag
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onDown = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY
      dragState.current.isDragging = true
      dragState.current.lastX = x
      dragState.current.lastY = y
    }
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.current.isDragging) return
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY
      dragState.current.rotY += (x - dragState.current.lastX) * 0.5
      dragState.current.rotX += (y - dragState.current.lastY) * 0.5
      dragState.current.lastX = x
      dragState.current.lastY = y
    }
    const onUp = () => { dragState.current.isDragging = false }

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('touchstart', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)

    return () => {
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-grab active:cursor-grabbing"
        style={{ width: size, height: size }}
      />
      <p className="absolute top-2 right-2 text-[9px] text-white/25 pointer-events-none select-none">Drag to rotate</p>
    </div>
  )
}
