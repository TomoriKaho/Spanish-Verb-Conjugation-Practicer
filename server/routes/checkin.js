const express = require('express')
const router = express.Router()
const CheckIn = require('../models/CheckIn')
const { authMiddleware } = require('../middleware/auth')

// 打卡
router.post('/', authMiddleware, (req, res) => {
  try {
    const success = CheckIn.create(req.userId)
    
    if (!success) {
      return res.json({
        success: true,
        message: '今天已经打卡过了',
        alreadyCheckedIn: true
      })
    }

    const streakDays = CheckIn.getStreakDays(req.userId)

    res.json({
      success: true,
      message: '打卡成功',
      streakDays
    })
  } catch (error) {
    console.error('打卡错误:', error)
    res.status(500).json({ error: '打卡失败' })
  }
})

// 获取打卡历史
router.get('/history', authMiddleware, (req, res) => {
  try {
    const history = CheckIn.getByUserId(req.userId)
    const streakDays = CheckIn.getStreakDays(req.userId)
    const hasCheckedInToday = CheckIn.hasCheckedInToday(req.userId)

    res.json({
      success: true,
      history,
      streakDays,
      hasCheckedInToday
    })
  } catch (error) {
    console.error('获取打卡历史错误:', error)
    res.status(500).json({ error: '获取打卡历史失败' })
  }
})

module.exports = router
