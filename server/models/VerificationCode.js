const { userDb } = require('../database/db')

class VerificationCode {
  /**
   * 创建验证码记录
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @param {number} expiresIn - 过期时间（分钟）
   */
  static create(email, code, expiresIn = 2) {
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000).toISOString()
    
    const stmt = userDb.prepare(`
      INSERT INTO verification_codes (email, code, expires_at)
      VALUES (?, ?, ?)
    `)
    
    const result = stmt.run(email.toLowerCase(), code, expiresAt)
    return result.lastInsertRowid
  }

  /**
   * 验证验证码
   * @param {string} email - 邮箱
   * @param {string} code - 验证码
   * @returns {object} - { valid: boolean, message: string }
   */
  static verify(email, code) {
    const stmt = userDb.prepare(`
      SELECT * FROM verification_codes
      WHERE email = ? AND code = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `)
    
    const record = stmt.get(email.toLowerCase(), code)
    
    if (!record) {
      return { valid: false, message: '验证码不正确' }
    }

    // 检查是否过期
    const now = new Date()
    const expiresAt = new Date(record.expires_at)
    
    if (now > expiresAt) {
      return { valid: false, message: '验证码已过期，请重新获取' }
    }

    // 标记为已使用
    const updateStmt = userDb.prepare(`
      UPDATE verification_codes
      SET used = 1
      WHERE id = ?
    `)
    updateStmt.run(record.id)

    return { valid: true, message: '验证成功' }
  }

  /**
   * 获取最近的验证码发送时间
   * @param {string} email - 邮箱
   * @returns {Date|null}
   */
  static getLastSendTime(email) {
    const stmt = userDb.prepare(`
      SELECT created_at FROM verification_codes
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `)
    
    const record = stmt.get(email.toLowerCase())
    return record ? new Date(record.created_at) : null
  }

  /**
   * 检查是否可以发送验证码（防止频繁发送）
   * @param {string} email - 邮箱
   * @param {number} cooldownSeconds - 冷却时间（秒）
   * @returns {object} - { canSend: boolean, waitTime: number }
   */
  static canSend(email, cooldownSeconds = 60) {
    const lastSendTime = this.getLastSendTime(email)
    
    if (!lastSendTime) {
      return { canSend: true, waitTime: 0 }
    }

    const now = new Date()
    const timePassed = (now - lastSendTime) / 1000 // 秒
    
    if (timePassed < cooldownSeconds) {
      const waitTime = Math.ceil(cooldownSeconds - timePassed)
      return { canSend: false, waitTime }
    }

    return { canSend: true, waitTime: 0 }
  }

  /**
   * 清理过期的验证码记录
   */
  static cleanupExpired() {
    const stmt = userDb.prepare(`
      DELETE FROM verification_codes
      WHERE datetime(expires_at) < datetime('now')
      OR (used = 1 AND datetime(created_at) < datetime('now', '-1 day'))
    `)
    
    const result = stmt.run()
    return result.changes
  }
}

module.exports = VerificationCode
