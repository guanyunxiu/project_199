import * as TWEEN from '@tweenjs/tween.js'

export class Animator {
  constructor() {
    this.tweens = new Set()
  }

  update(deltaTime) {
    const time = performance.now()
    for (const tween of this.tweens) {
      if (tween.isPlaying()) {
        tween.update(time)
      }
    }
  }

  addAnimation(tween) {
    this.tweens.add(tween)
    tween.onComplete(() => {
      this.tweens.delete(tween)
    })
    tween.onStop(() => {
      this.tweens.delete(tween)
    })
    return tween
  }

  clear() {
    for (const tween of this.tweens) {
      tween.stop()
    }
    this.tweens.clear()
  }
}

export default Animator
