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

// 搜索动词（支持精确搜索和模糊搜索）
// 注意：此路由必须放在 /:id 之前，否则 /search/xxx 会被当作 /:id 处理
router.get('/search/:keyword', authMiddleware, (req, res) => {
  try {
    const keyword = req.params.keyword.toLowerCase().trim()
    
    if (!keyword || keyword.length < 2) {
      return res.json({
        success: true,
        exactMatches: [],
        fuzzyMatches: []
      })
    }

    const { vocabularyDb } = require('../database/db')
    
    // 1. 精确搜索：原形动词包含关键词，或者变位形式完全匹配
    const exactQuery = `
      SELECT DISTINCT v.id, v.infinitive, v.meaning, v.conjugation_type, v.is_irregular
      FROM verbs v
      LEFT JOIN conjugations c ON v.id = c.verb_id
      WHERE LOWER(v.infinitive) LIKE ? OR LOWER(c.conjugated_form) = ?
      ORDER BY 
        CASE 
          WHEN LOWER(v.infinitive) = ? THEN 1
          WHEN LOWER(v.infinitive) LIKE ? THEN 2
          ELSE 3
        END,
        v.infinitive
      LIMIT 10
    `
    
    const exactMatches = vocabularyDb.prepare(exactQuery).all(
      `%${keyword}%`,
      keyword,
      keyword,
      `${keyword}%`
    )

    // 2. 模糊搜索：使用编辑距离算法（简化版）
    // 查找所有动词，然后在应用层过滤
    const allVerbsQuery = `
      SELECT DISTINCT v.id, v.infinitive, v.meaning, v.conjugation_type, v.is_irregular
      FROM verbs v
      WHERE v.id NOT IN (${exactMatches.map(v => v.id).join(',') || '0'})
    `
    
    const allVerbs = vocabularyDb.prepare(allVerbsQuery).all()
    
    // 简单的模糊匹配：检查是否包含关键词的大部分字符
    const fuzzyMatches = allVerbs.filter(verb => {
      const infinitive = verb.infinitive.toLowerCase()
      
      // 方法1：检查关键词的每个字符是否按顺序出现在单词中
      let keywordIndex = 0
      for (let i = 0; i < infinitive.length && keywordIndex < keyword.length; i++) {
        if (infinitive[i] === keyword[keywordIndex]) {
          keywordIndex++
        }
      }
      const sequentialMatch = keywordIndex >= Math.ceil(keyword.length * 0.7) // 至少70%字符按顺序匹配
      
      // 方法2：检查关键词的字符是否大部分出现在单词中（不考虑顺序）
      const keywordChars = keyword.split('')
      const infinitiveChars = infinitive.split('')
      let matchCount = 0
      keywordChars.forEach(char => {
        if (infinitiveChars.includes(char)) {
          matchCount++
        }
      })
      const charMatch = matchCount >= Math.ceil(keyword.length * 0.7) // 至少70%字符存在
      
      return sequentialMatch || charMatch
    }).slice(0, 5) // 最多返回5个模糊匹配

    // 格式化结果
    const conjugationTypeMap = {
      1: '第一变位',
      2: '第二变位',
      3: '第三变位'
    }

    const formatVerb = (verb) => ({
      id: verb.id,
      infinitive: verb.infinitive,
      meaning: verb.meaning,
      conjugationType: conjugationTypeMap[verb.conjugation_type] || '未知',
      isIrregular: verb.is_irregular === 1
    })

    res.json({
      success: true,
      exactMatches: exactMatches.map(formatVerb),
      fuzzyMatches: fuzzyMatches.map(formatVerb)
    })
  } catch (error) {
    console.error('搜索动词错误:', error)
    res.status(500).json({ error: '搜索失败' })
  }
})

// 获取动词详情和完整变位
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const verbId = parseInt(req.params.id)
    
    const verb = Verb.findById(verbId)
    if (!verb) {
      return res.status(404).json({ error: '动词不存在' })
    }

    const conjugations = Conjugation.getByVerbId(verbId)

    // 格式化动词信息
    const conjugationTypeMap = {
      1: '第一变位',
      2: '第二变位',
      3: '第三变位'
    }

    const formattedVerb = {
      id: verb.id,
      infinitive: verb.infinitive,
      meaning: verb.meaning,
      conjugationType: conjugationTypeMap[verb.conjugation_type] || '未知',
      isIrregular: verb.is_irregular === 1
    }

    res.json({
      success: true,
      verb: formattedVerb,
      conjugations
    })
  } catch (error) {
    console.error('获取动词详情错误:', error)
    res.status(500).json({ error: '获取动词详情失败' })
  }
})

module.exports = router
