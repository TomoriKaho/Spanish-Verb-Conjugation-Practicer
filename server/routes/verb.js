const express = require('express')
const router = express.Router()
const Verb = require('../models/Verb')
const Conjugation = require('../models/Conjugation')
const { authMiddleware } = require('../middleware/auth')

// 获取动词列表
router.get('/list', authMiddleware, (req, res) => {
  try {
    const { lessonNumber, textbookVolume, conjugationType } = req.query

    const filters = {}
    if (lessonNumber) filters.lessonNumber = parseInt(lessonNumber)
    if (textbookVolume) filters.textbookVolume = parseInt(textbookVolume)
    if (conjugationType) filters.conjugationType = parseInt(conjugationType)

    const verbs = Verb.getAll(filters)

    res.json({
      success: true,
      verbs
    })
  } catch (error) {
    console.error('获取动词列表错误:', error)
    res.status(500).json({ error: '获取动词列表失败' })
  }
})

// 获取动词详情
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const verbId = parseInt(req.params.id)
    
    const verb = Verb.findById(verbId)
    if (!verb) {
      return res.status(404).json({ error: '动词不存在' })
    }

    const conjugations = Conjugation.getByVerbId(verbId)

    res.json({
      success: true,
      verb,
      conjugations
    })
  } catch (error) {
    console.error('获取动词详情错误:', error)
    res.status(500).json({ error: '获取动词详情失败' })
  }
})

module.exports = router
