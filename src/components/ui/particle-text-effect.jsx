import { useEffect, useRef } from "react"

class Particle {
  constructor() {
    this.pos = { x: 0, y: 0 }
    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.target = { x: 0, y: 0 }

    this.closeEnoughTarget = 100
    this.maxSpeed = 1.0
    this.maxForce = 0.1
    this.particleSize = 10
    this.isKilled = false

    this.startColor = { r: 0, g: 0, b: 0 }
    this.targetColor = { r: 0, g: 0, b: 0 }
    this.colorWeight = 0
    this.colorBlendRate = 0.01
  }

  move() {
    let proximityMult = 1
    const distance = Math.sqrt(
      Math.pow(this.pos.x - this.target.x, 2) +
        Math.pow(this.pos.y - this.target.y, 2)
    )
    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const towardsTarget = {
      x: this.target.x - this.pos.x,
      y: this.target.y - this.pos.y,
    }
    const magnitude = Math.sqrt(
      towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y
    )
    if (magnitude > 0) {
      towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult
      towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult
    }

    const steer = {
      x: towardsTarget.x - this.vel.x,
      y: towardsTarget.y - this.vel.y,
    }
    const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y)
    if (steerMagnitude > 0) {
      steer.x = (steer.x / steerMagnitude) * this.maxForce
      steer.y = (steer.y / steerMagnitude) * this.maxForce
    }

    this.acc.x += steer.x
    this.acc.y += steer.y
    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx, drawAsPoints) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }
    const r = Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight)
    const g = Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight)
    const b = Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight)

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
    if (drawAsPoints) {
      ctx.fillRect(this.pos.x, this.pos.y, 2, 2)
    } else {
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  kill(width, height) {
    if (!this.isKilled) {
      const randomPos = this._generateRandomPos(width / 2, height / 2, (width + height) / 2)
      this.target.x = randomPos.x
      this.target.y = randomPos.y

      this.startColor = {
        r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
        g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
        b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
      }
      this.targetColor = { r: 0, g: 0, b: 0 }
      this.colorWeight = 0
      this.isKilled = true
    }
  }

  _generateRandomPos(x, y, mag) {
    const randomX = Math.random() * window.innerWidth
    const randomY = Math.random() * window.innerHeight
    const direction = { x: randomX - x, y: randomY - y }
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }
    return { x: x + direction.x, y: y + direction.y }
  }
}

const DEFAULT_WORDS = ["MechE-SA", "IIT INDORE", "INNOVATE", "ENGINEER", "INSPIRE"]

export function ParticleTextEffect({ words = DEFAULT_WORDS }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const frameCountRef = useRef(0)
  const wordIndexRef = useRef(0)
  // isPressed = left mouse button held
  const mouseRef = useRef({ x: 0, y: 0, isPressed: false })

  const pixelSteps = 6
  const drawAsPoints = true

  // --- helpers (stable, don't depend on canvas size) ---

  const generateRandomPos = (x, y, mag, w, h) => {
    const randomX = Math.random() * w
    const randomY = Math.random() * h
    const direction = { x: randomX - x, y: randomY - y }
    const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y)
    if (magnitude > 0) {
      direction.x = (direction.x / magnitude) * mag
      direction.y = (direction.y / magnitude) * mag
    }
    return { x: x + direction.x, y: y + direction.y }
  }

  const nextWord = (word, canvas) => {
    const offscreen = document.createElement("canvas")
    offscreen.width = canvas.width
    offscreen.height = canvas.height
    const offCtx = offscreen.getContext("2d")

    // Scale font relative to canvas width
    const fontSize = Math.max(48, Math.min(120, Math.floor(canvas.width / 8)))
    offCtx.fillStyle = "white"
    offCtx.font = `bold ${fontSize}px Arial`
    offCtx.textAlign = "center"
    offCtx.textBaseline = "middle"
    offCtx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data

    const newColor = {
      r: Math.random() * 255,
      g: Math.random() * 255,
      b: Math.random() * 255,
    }

    const particles = particlesRef.current
    let particleIndex = 0

    const coordsIndexes = []
    for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
      coordsIndexes.push(i)
    }
    // Shuffle for fluid motion
    for (let i = coordsIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]]
    }

    for (const coordIndex of coordsIndexes) {
      const alpha = pixels[coordIndex + 3]
      if (alpha > 0) {
        const x = (coordIndex / 4) % canvas.width
        const y = Math.floor(coordIndex / 4 / canvas.width)

        let particle
        if (particleIndex < particles.length) {
          particle = particles[particleIndex]
          particle.isKilled = false
          particleIndex++
        } else {
          particle = new Particle()
          const rp = generateRandomPos(
            canvas.width / 2, canvas.height / 2,
            (canvas.width + canvas.height) / 2,
            canvas.width, canvas.height
          )
          particle.pos.x = rp.x
          particle.pos.y = rp.y
          particle.maxSpeed = Math.random() * 6 + 4
          particle.maxForce = particle.maxSpeed * 0.05
          particle.particleSize = Math.random() * 6 + 6
          particle.colorBlendRate = Math.random() * 0.0275 + 0.0025
          particles.push(particle)
        }

        particle.startColor = {
          r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
          g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
          b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
        }
        particle.targetColor = newColor
        particle.colorWeight = 0
        particle.target.x = x
        particle.target.y = y
      }
    }

    for (let i = particleIndex; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const particles = particlesRef.current

    // Motion-blur background fill
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.move()
      p.draw(ctx, drawAsPoints)

      if (p.isKilled) {
        if (p.pos.x < 0 || p.pos.x > canvas.width || p.pos.y < 0 || p.pos.y > canvas.height) {
          particles.splice(i, 1)
        }
      }
    }

    // LEFT-CLICK scatter: kill particles near cursor while mouse is held
    if (mouseRef.current.isPressed) {
      const { x: mx, y: my } = mouseRef.current
      particles.forEach((p) => {
        const dx = p.pos.x - mx
        const dy = p.pos.y - my
        if (Math.sqrt(dx * dx + dy * dy) < 60) {
          p.kill(canvas.width, canvas.height)
        }
      })
    }

    // Auto-advance words every 240 frames (~4 s at 60 fps)
    frameCountRef.current++
    if (frameCountRef.current % 240 === 0) {
      wordIndexRef.current = (wordIndexRef.current + 1) % words.length
      nextWord(words[wordIndexRef.current], canvas)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Size canvas to full viewport
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-render current word after resize
      nextWord(words[wordIndexRef.current], canvas)
    }

    resize()
    animate()

    const handleMouseDown = (e) => {
      if (e.button === 0) {          // left click only
        mouseRef.current.isPressed = true
      }
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }
    const handleMouseUp = () => {
      mouseRef.current.isPressed = false
    }
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("resize", resize)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      canvas.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100vw",
        height: "100vh",
        cursor: "crosshair",
      }}
    />
  )
}
