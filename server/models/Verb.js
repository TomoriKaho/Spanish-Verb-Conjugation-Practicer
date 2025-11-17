const { db } = require('../database/db')

class Verb {
  // 创建动词
  static create(verbData) {
    const { infinitive, meaning, conjugationType, isIrregular, lessonNumber, textbookVolume, frequencyLevel } = verbData
    
    const stmt = db.prepare(`
      INSERT INTO verbs (infinitive, meaning, conjugation_type, is_irregular, lesson_number, textbook_volume, frequency_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(infinitive, meaning, conjugationType, isIrregular || 0, lessonNumber, textbookVolume || 1, frequencyLevel || 1)
    return result.lastInsertRowid
  }

  // 获取所有动词
  static getAll(filters = {}) {
    let query = 'SELECT * FROM verbs WHERE 1=1'
    const params = []

    if (filters.lessonNumber) {
      query += ' AND lesson_number = ?'
      params.push(filters.lessonNumber)
    }

    if (filters.textbookVolume) {
      query += ' AND textbook_volume = ?'
      params.push(filters.textbookVolume)
    }

    if (filters.conjugationType) {
      query += ' AND conjugation_type = ?'
      params.push(filters.conjugationType)
    }

    query += ' ORDER BY lesson_number, id'

    const stmt = db.prepare(query)
    return stmt.all(...params)
  }

  // 根据ID获取动词
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM verbs WHERE id = ?')
    return stmt.get(id)
  }

  // 随机获取动词
  static getRandom(count = 1, filters = {}) {
    let query = 'SELECT * FROM verbs WHERE 1=1'
    const params = []

    if (filters.lessonNumber) {
      query += ' AND lesson_number <= ?'
      params.push(filters.lessonNumber)
    }

    if (filters.textbookVolume) {
      query += ' AND textbook_volume = ?'
      params.push(filters.textbookVolume)
    }

    query += ' ORDER BY RANDOM() LIMIT ?'
    params.push(count)

    const stmt = db.prepare(query)
    return stmt.all(...params)
  }

  // 获取用户未掌握的动词
  static getWeakVerbs(userId, count = 10) {
    const stmt = db.prepare(`
      SELECT v.* FROM verbs v
      LEFT JOIN user_progress up ON v.id = up.verb_id AND up.user_id = ?
      WHERE up.mastery_level IS NULL OR up.mastery_level < 3
      ORDER BY RANDOM()
      LIMIT ?
    `)
    return stmt.all(userId, count)
  }
}

module.exports = Verb
