import Phaser from "phaser"
import { ballConfig, audioConfig } from "./gameConfig.json"

export class Ball extends Phaser.Physics.Arcade.Sprite {
  private bounceSound!: Phaser.Sound.BaseSound
  private goalPostSound!: Phaser.Sound.BaseSound
  private standardSize = 25 // Standard ball size (reduced from 30)
  private targetBodyRadius: number = 25

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "soccer_ball")
    
    // Add to scene
    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Set depth to appear above goals (-3) and same level as players (1)
    this.setDepth(2)
    
    this.setupPhysics()
    this.setupSounds()
    this.setupBallSize()
  }

  private setupPhysics(): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    // **ENHANCED GRAVITY** - simulate football physics realistically
    body.setGravityY(600) // Increases downward pull for realistic ball arc
    
    // **REALISTIC BOUNCE** - higher horizontal bounce, lower vertical
    body.setBounce(0.65, 0.45) // More realistic soccer ball bounce
    
    // Enable world bounds collision
    body.setCollideWorldBounds(true)
    body.setBounceOnWorldBounds(true)
    
    // **ZERO DRAG** - ensure clean ball physics
    body.setDrag(0, 0)
    body.setFriction(0, 0)
    body.setAngularDrag(0)
    
    // Set circular collision body
    body.setCircle(this.standardSize)
    
    // **DYNAMIC VELOCITY LIMITS** - higher for gameplay excitement
    body.setMaxVelocity(1200, 1000)
    
    // **BALL PHYSICS PROPERTIES**
    body.setImmovable(false)
    body.pushable = true
    
    console.log(`⚽ Ball physics initialized with enhanced gravity and bounce`)
  }

  private setupBallSize(): void {
    // Scale ball to smaller size (50px diameter, reduced from 60px)
    const ballDiameter = 50
    const originalSize = Math.min(this.width, this.height)
    const scale = ballDiameter / originalSize
    
    this.setScale(scale)
    this.setOrigin(0.5, 0.5)
    
    // Store the target physics size as instance variable
    this.targetBodyRadius = 25 // Reduced from 30 to match new diameter
    
    // Force physics body to exact size we want (will be enforced in update)
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.setCircle(this.targetBodyRadius)
      console.log(`Ball body set to: ${body.width}x${body.height}`)
    }
  }

  private setupSounds(): void {
    this.bounceSound = this.scene.sound.add("ball_bounce", { 
      volume: audioConfig.sfxVolume.value 
    })
    this.goalPostSound = this.scene.sound.add("goal_post_hit", { 
      volume: audioConfig.sfxVolume.value 
    })
  }

  public kick(force: Phaser.Math.Vector2, playerHeight: number, kickType: "normal" | "slide" | "jump" = "normal", distance: number = 100): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    
    let finalForce = force.clone()
    
    // **ENHANCED KICK PHYSICS** - realistic ball movement based on kick type
    switch (kickType) {
      case "slide":
        // **SLIDE TACKLE** - powerful, low, and unpredictable
        finalForce.scale(2.0) // Very powerful
        finalForce.y = Math.abs(finalForce.y) * 0.2 // Keep very low
        
        // Add slight spin for realistic effect
        this.setAngularVelocity(Math.random() > 0.5 ? 8 : -8)
        console.log(`🏃⚽ SLIDE KICK - Low powerful trajectory`)
        break
        
      case "jump":
        // **JUMP KICK** - high arc, good for scoring
        const upwardMultiplier = Math.abs(finalForce.y) > 0 ? 2.5 : 3.0
        finalForce.y = -Math.abs(finalForce.y) * upwardMultiplier // Strong upward arc
        finalForce.x *= 0.9 // Slightly reduced horizontal
        
        // Stronger spin effect for header
        this.setAngularVelocity(finalForce.x > 0 ? 6 : -6)
        console.log(`🚀⚽ JUMP KICK - High arc trajectory for scoring`)
        break
        
      case "normal":
      default:
        // **NORMAL KICK** - balanced trajectory based on kick force
        const speedMultiplier = Math.min(Math.abs(finalForce.x) / 300, 1.5) // Up to 1.5x
        finalForce.scale(0.85 + speedMultiplier * 0.3) // Adaptive scaling
        
        // **REALISTIC ARC** - always move upward initially for nice parabola 
        // unless already moving downward significantly
        if (finalForce.y > -100) {
          finalForce.y = -Math.max(150, distance * 1.2) // Proportional upward force
        }
        
        // Normal spin effect
        const spinMultiplier = 0.015
        this.setAngularVelocity((finalForce.x * spinMultiplier))
        console.log(`⚽ NORMAL KICK - Balanced parabolic trajectory`)
        break
    }
    
    // **ENFORCE MAXIMUM SPEED** - but allow momentary overspeed
    const magnitude = finalForce.length()
    const maxAllowed = ballConfig.maxSpeed.value * 1.3 // Allow 30% overspeed initially
    if (magnitude > maxAllowed) {
      finalForce.normalize()
      finalForce.scale(maxAllowed)
      console.log(`⚠️ KICK SPEED CAPPED at ${maxAllowed} pixels/frame`)
    }
    
    body.setVelocity(finalForce.x, finalForce.y)
    console.log(`🎯 Ball velocity: (${finalForce.x.toFixed(0)}, ${finalForce.y.toFixed(0)}) - type: ${kickType}`)
  }

  public onBounce(): void {
    // Play bounce sound with pitch variation
    if (this.body) {
      const velocity = (this.body as Phaser.Physics.Arcade.Body).velocity
      const impactStrength = Math.min(velocity.length() / 200, 1)
      
      if (impactStrength > 0.3) {
        this.bounceSound.play({
          volume: audioConfig.sfxVolume.value * impactStrength,
          rate: 0.8 + impactStrength * 0.4
        })
      }
    }
  }

  public onGoalPostHit(): void {
    this.goalPostSound.play()
    
    // Add screen shake effect through scene
    if (this.scene.cameras && this.scene.cameras.main) {
      this.scene.cameras.main.shake(200, 0.01)
    }
    
    // Add exaggerated bounce for goal posts
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      const currentVelocity = body.velocity
      
      // Exaggerate the bounce
      body.setVelocity(
        -currentVelocity.x * 1.2,
        -Math.abs(currentVelocity.y) * 0.8
      )
    }
  }

  public resetPosition(x: number, y: number): void {
    console.log(`⚽ BALL RESET TO KICKOFF: (${x}, ${y})`)
    
    this.setPosition(x, y)
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body
      body.setVelocity(0, 0)
      this.setAngularVelocity(0)
    }
    
    // Reset visual properties and stop animations
    this.clearTint()
    this.setAlpha(1)
    this.setRotation(0) // Reset rotation
    
    // **KEEP CORRECT BALL SIZE** - restore proper scale from setupBallSize
    const ballDiameter = 50
    const originalSize = Math.min(this.texture.source[0].width, this.texture.source[0].height)
    const correctScale = ballDiameter / originalSize
    this.setScale(correctScale)
    
    // Stop all tweens on the ball
    this.scene.tweens.killTweensOf(this)
    
    // Reset to original texture if needed
    this.setTexture("soccer_ball")
    
    console.log(`✅ BALL KICKOFF RESET COMPLETE: (${this.x}, ${this.y}) with correct scale: ${correctScale}`)
  }

  public update(): void {
    if (!this.body) return
    
    const body = this.body as Phaser.Physics.Arcade.Body
    const velocity = body.velocity
    
    // MANUAL BOUNDARY CHECK - prevent going off screen
    const margin = 25 // Ball radius
    if (this.x < margin) {
      this.x = margin
      body.setVelocityX(-velocity.x * 0.8) // Bounce back
    } else if (this.x > 1152 - margin) {
      this.x = 1152 - margin
      body.setVelocityX(-velocity.x * 0.8) // Bounce back
    }
    
    if (this.y < margin) {
      this.y = margin
      body.setVelocityY(-velocity.y * 0.8) // Bounce back
    }
    
    // STABILITY CHECK: Force stop micro-movements when ball is essentially stationary
    if (velocity.length() < 3) {
      body.setVelocity(0, 0)
      this.setAngularVelocity(0)
    }
  }

  public isMoving(): boolean {
    if (!this.body) return false
    const body = this.body as Phaser.Physics.Arcade.Body
    return body.velocity.length() > 20
  }

  public getVelocity(): Phaser.Math.Vector2 {
    if (!this.body) return new Phaser.Math.Vector2(0, 0)
    const body = this.body as Phaser.Physics.Arcade.Body
    return new Phaser.Math.Vector2(body.velocity.x, body.velocity.y)
  }
}