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
    
    // 1. 精确搜索：分两步进行，优先匹配原型
    
    // 1.1 先查询原型匹配的动词
    const infinitiveQuery = `
      SELECT 
        v.id, 
        v.infinitive, 
        v.meaning, 
        v.conjugation_type, 
        v.is_irregular,
        NULL as matched_form
      FROM verbs v
      WHERE LOWER(v.infinitive) LIKE ?
      ORDER BY 
        CASE 
          WHEN LOWER(v.infinitive) = ? THEN 1
          WHEN LOWER(v.infinitive) LIKE ? THEN 2
          ELSE 3
        END,
        v.infinitive
    `
    
    const infinitiveMatches = vocabularyDb.prepare(infinitiveQuery).all(
      `%${keyword}%`,
      keyword,
      `${keyword}%`
    )
    
    // 1.2 再查询变位形式匹配的动词（排除已经通过原型匹配的）
    const infinitiveVerbIds = infinitiveMatches.map(v => v.id)
    const conjugationQuery = `
      SELECT DISTINCT 
        v.id, 
        v.infinitive, 
        v.meaning, 
        v.conjugation_type, 
        v.is_irregular,
        c.conjugated_form as matched_form
      FROM verbs v
      INNER JOIN conjugations c ON v.id = c.verb_id
      WHERE LOWER(c.conjugated_form) = ?
        ${infinitiveVerbIds.length > 0 ? `AND v.id NOT IN (${infinitiveVerbIds.join(',')})` : ''}
      ORDER BY v.infinitive
    `
    
    const conjugationMatches = vocabularyDb.prepare(conjugationQuery).all(keyword)
    
    // 合并结果并去重
    const exactMatchesMap = new Map()
    
    // 先添加原型匹配（优先级更高）
    for (const result of infinitiveMatches) {
      exactMatchesMap.set(result.id, result)
    }
    
    // 再添加变位匹配（如果该动词还没有）
    for (const result of conjugationMatches) {
      if (!exactMatchesMap.has(result.id)) {
        exactMatchesMap.set(result.id, result)
      }
    }
    
    const exactMatches = Array.from(exactMatchesMap.values()).slice(0, 10)

    // 2. 模糊搜索：包含原型模糊匹配和变位形式模糊匹配
    // 先获取所有未在精确结果中的动词及其变位
    const exactVerbIds = exactMatches.map(v => v.id)
    const fuzzyQuery = `
      SELECT DISTINCT 
        v.id, 
        v.infinitive, 
        v.meaning, 
        v.conjugation_type, 
        v.is_irregular,
        GROUP_CONCAT(c.conjugated_form, '|') as all_forms
      FROM verbs v
      LEFT JOIN conjugations c ON v.id = c.verb_id
      WHERE v.id NOT IN (${exactVerbIds.length > 0 ? exactVerbIds.join(',') : '0'})
      GROUP BY v.id
    `
    
    const allVerbs = vocabularyDb.prepare(fuzzyQuery).all()
    
    // 模糊匹配：检查原型和所有变位形式
    const fuzzyMatches = []
    
    for (const verb of allVerbs) {
      const infinitive = verb.infinitive.toLowerCase()
      const allForms = verb.all_forms ? verb.all_forms.toLowerCase().split('|') : []
      
      let matchedForm = null
      let matchScore = 0
      
      // 检查原型匹配
      const infinitiveScore = calculateMatchScore(infinitive, keyword)
      if (infinitiveScore > matchScore) {
        matchScore = infinitiveScore
        matchedForm = null // 原型匹配，不需要标注
      }
      
      // 检查所有变位形式
      for (const form of allForms) {
        if (!form) continue
        const formScore = calculateMatchScore(form, keyword)
        if (formScore > matchScore) {
          matchScore = formScore
          matchedForm = form
        }
      }
      
      // 如果匹配分数 >= 0.7，加入结果
      if (matchScore >= 0.7) {
        fuzzyMatches.push({
          ...verb,
          matched_form: matchedForm,
          match_score: matchScore
        })
      }
    }
    
    // 按匹配分数排序，取前5个
    fuzzyMatches.sort((a, b) => b.match_score - a.match_score)
    fuzzyMatches.splice(5)

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
      isIrregular: verb.is_irregular === 1,
      matchedForm: verb.matched_form || null // 如果是通过变位形式匹配的，返回该形式
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

// 计算匹配分数的辅助函数
function calculateMatchScore(text, keyword) {
  // 方法1：顺序匹配
  let keywordIndex = 0
  for (let i = 0; i < text.length && keywordIndex < keyword.length; i++) {
    if (text[i] === keyword[keywordIndex]) {
      keywordIndex++
    }
  }
  const sequentialScore = keywordIndex / keyword.length
  
  // 方法2：字符存在匹配
  const keywordChars = keyword.split('')
  const textChars = text.split('')
  let matchCount = 0
  keywordChars.forEach(char => {
    if (textChars.includes(char)) {
      matchCount++
    }
  })
  const charScore = matchCount / keyword.length
  
  // 返回较高的分数
  return Math.max(sequentialScore, charScore)
}

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
