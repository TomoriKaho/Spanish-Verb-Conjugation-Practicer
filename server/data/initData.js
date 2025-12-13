const { vocabularyDb: db } = require('../database/db')
const fs = require('fs')
const path = require('path')

// 初始化示例数据
function initSampleData() {
  // 检查是否已有数据
  const stmt = db.prepare('SELECT COUNT(*) as count FROM verbs')
  const result = stmt.get()
  
  if (result.count > 0) {
    console.log('   ℹ️  词库已有数据，跳过初始化\n')
    return
  }

  console.log('\n📚 开始初始化词库数据...')
  
  // 从 verbs.json 导入完整词库
  const verbsJsonPath = path.join(__dirname, '../verbs.json')
  if (!fs.existsSync(verbsJsonPath)) {
    console.error('\x1b[31m   ✗ 找不到 verbs.json 文件\x1b[0m')
    return
  }

  try {
    importFromVerbsJson(verbsJsonPath)
  } catch (error) {
    console.error('\x1b[31m   ✗ verbs.json 导入失败:\x1b[0m', error.message)
  }
}

// 从 verbs.json 导入完整词库
function importFromVerbsJson(filePath) {
  console.log('   📥 从 verbs.json 导入词库...')
  
  const verbsData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  
  // 时态映射
  const tenseMapping = {
    'present': '现在时',
    'imperfect': '未完成过去时',
    'preterite': '简单过去时',
    'future': '将来时',
    'conditional': '条件式'
  }

  // 语气映射
  const moodMapping = {
    'indicative': '陈述式',
    'subjunctive': '虚拟式',
    'imperative': '命令式'
  }

  // 人称映射
  const personMapping = {
    'first_singular': 'yo',
    'second_singular': 'tú',
    'third_singular': 'él/ella/usted',
    'first_plural': 'nosotros',
    'second_plural': 'vosotros',
    'third_plural': 'ellos/ellas/ustedes'
  }

  // 常用动词中文释义
  const verbMeanings = {
    'ser': '是', 'estar': '在/是', 'tener': '有', 'hacer': '做', 'poder': '能够',
    'decir': '说', 'ir': '去', 'ver': '看', 'dar': '给', 'saber': '知道',
    'querer': '想要', 'llegar': '到达', 'pasar': '经过/发生', 'deber': '应该', 'poner': '放',
    'parecer': '似乎', 'quedar': '留下', 'creer': '相信', 'hablar': '说话', 'llevar': '带',
    'dejar': '让/留下', 'seguir': '跟随/继续', 'encontrar': '找到', 'llamar': '叫', 'venir': '来',
    'pensar': '想/认为', 'salir': '出去', 'volver': '回来', 'tomar': '拿/喝', 'conocer': '认识',
    'vivir': '住/生活', 'sentir': '感觉', 'tratar': '尝试/对待', 'mirar': '看', 'contar': '数/讲述',
    'empezar': '开始', 'esperar': '等待/希望', 'buscar': '找', 'entrar': '进入', 'trabajar': '工作',
    'escribir': '写', 'perder': '失去', 'entender': '理解', 'pedir': '要求', 'recibir': '收到',
    'recordar': '记得', 'terminar': '结束', 'estudiar': '学习', 'comer': '吃', 'beber': '喝',
    'leer': '读', 'aprender': '学会', 'comprar': '买', 'abrir': '打开', 'cerrar': '关闭',
    'escuchar': '听', 'preguntar': '问', 'responder': '回答', 'enseñar': '教', 'presentar': '介绍',
    'llamarse': '叫做', 'levantarse': '起床', 'sentarse': '坐下', 'lavarse': '洗', 'bañarse': '洗澡',
    'peinarse': '梳头', 'cepillarse': '刷', 'acostarse': '睡觉', 'despertarse': '醒来'
  }

  const highFrequencyVerbs = [
    'ser', 'estar', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber',
    'querer', 'llegar', 'pasar', 'deber', 'poner', 'hablar', 'conocer', 'vivir', 'trabajar', 'estudiar'
  ]

  let verbCount = 0
  let conjugationCount = 0

  const insertVerb = db.prepare(`
    INSERT INTO verbs (infinitive, meaning, conjugation_type, is_irregular, frequency_level)
    VALUES (?, ?, ?, ?, ?)
  `)

  const insertConjugation = db.prepare(`
    INSERT INTO conjugations (verb_id, tense, mood, person, conjugated_form, is_irregular)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    for (const verbData of verbsData) {
      const infinitive = verbData.infinitive
      const baseInfinitive = infinitive.replace(/se$/, '')
      const meaning = verbMeanings[infinitive] || verbMeanings[baseInfinitive] || infinitive
      
      // 判断变位类型
      let conjugationType = 1
      if (baseInfinitive.endsWith('er')) conjugationType = 2
      else if (baseInfinitive.endsWith('ir')) conjugationType = 3
      
      // 判断是否不规则
      let isIrregular = 0
      if (verbData.indicative) {
        for (const tense in verbData.indicative) {
          if (verbData.indicative[tense]?.regular === false) {
            isIrregular = 1
            break
          }
        }
      }
      
      const frequency = highFrequencyVerbs.includes(infinitive) || highFrequencyVerbs.includes(baseInfinitive) ? 1 : 2

      // 插入动词
      const result = insertVerb.run(infinitive, meaning, conjugationType, isIrregular, frequency)
      const verbId = result.lastInsertRowid
      verbCount++

      // 插入变位 - 陈述式（indicative）
      if (verbData.indicative) {
        const indicative = verbData.indicative
        for (const tenseKey in indicative) {
          if (!tenseMapping[tenseKey]) continue
          
          const tenseData = indicative[tenseKey]
          if (!tenseData) continue

          const tenseName = tenseMapping[tenseKey]
          const isIrregularTense = tenseData.regular === false ? 1 : 0

          for (const personKey in personMapping) {
            const personName = personMapping[personKey]
            const forms = tenseData[personKey]
            
            if (forms && Array.isArray(forms) && forms[0]) {
              insertConjugation.run(verbId, tenseName, '陈述式', personName, forms[0], isIrregularTense)
              conjugationCount++
            }
          }
        }
      }

      // 插入变位 - 虚拟式（subjunctive）
      if (verbData.subjunctive) {
        const subjunctive = verbData.subjunctive
        for (const tenseKey in subjunctive) {
          if (!tenseMapping[tenseKey]) continue
          
          const tenseData = subjunctive[tenseKey]
          if (!tenseData) continue

          const tenseName = tenseMapping[tenseKey]
          const isIrregularTense = tenseData.regular === false ? 1 : 0

          for (const personKey in personMapping) {
            const personName = personMapping[personKey]
            const forms = tenseData[personKey]
            
            if (forms && Array.isArray(forms) && forms[0]) {
              insertConjugation.run(verbId, tenseName, '虚拟式', personName, forms[0], isIrregularTense)
              conjugationCount++
            }
          }
        }
      }

      // 插入变位 - 命令式（imperative）
      if (verbData.imperative) {
        const imperative = verbData.imperative
        // 肯定命令式
        if (imperative.affirmative) {
          const isIrregularTense = imperative.affirmative.regular === false ? 1 : 0
          for (const personKey in personMapping) {
            const personName = personMapping[personKey]
            const forms = imperative.affirmative[personKey]
            
            if (forms && Array.isArray(forms) && forms[0] && forms[0].length > 0) {
              insertConjugation.run(verbId, '肯定命令式', '命令式', personName, forms[0], isIrregularTense)
              conjugationCount++
            }
          }
        }
        // 否定命令式
        if (imperative.negative) {
          const isIrregularTense = imperative.negative.regular === false ? 1 : 0
          for (const personKey in personMapping) {
            const personName = personMapping[personKey]
            const forms = imperative.negative[personKey]
            
            if (forms && Array.isArray(forms) && forms[0] && forms[0].length > 0) {
              insertConjugation.run(verbId, '否定命令式', '命令式', personName, forms[0], isIrregularTense)
              conjugationCount++
            }
          }
        }
      }
    }
  })

  transaction()

  console.log(`\x1b[32m   ✓ 词库数据初始化完成\x1b[0m，共导入 \x1b[33m${verbCount}\x1b[0m 个动词，\x1b[33m${conjugationCount}\x1b[0m 个变位\n`)
}

module.exports = {
  initSampleData
}
