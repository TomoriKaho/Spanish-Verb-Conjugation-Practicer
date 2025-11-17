const express = require('express')
const router = express.Router()
const CheckIn = require('../models/CheckIn')
const { authMiddleware } = require('../middleware/auth')

// 获取排行榜
router.get('/:type', authMiddleware, (req, res) => {
  try {
    const { type } = req.params // week, month, all
    const limit = parseInt(req.query.limit) || 50

    const leaderboard = CheckIn.getLeaderboard(type, limit)

    res.json({
      success: true,
      type,
      leaderboard
    })
  } catch (error) {
    console.error('获取排行榜错误:', error)
    res.status(500).json({ error: '获取排行榜失败' })
  }
})

module.exports = router
