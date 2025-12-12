const Verb = require('../models/Verb')
const Conjugation = require('../models/Conjugation')
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
  
  // 尝试从 verbs.json 导入完整词库
  const verbsJsonPath = path.join(__dirname, '../verbs.json')
  if (fs.existsSync(verbsJsonPath)) {
    try {
      importFromVerbsJson(verbsJsonPath)
      return
    } catch (error) {
      console.log('\x1b[33m   ⚠ verbs.json 导入失败，使用默认数据:\x1b[0m', error.message)
    }
  }

  // 如果 JSON 文件不存在或导入失败，使用默认示例数据
  initDefaultSampleData()
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

// 默认示例数据（保留原有逻辑作为备份）
function initDefaultSampleData() {

  // 第一课的动词示例
  const lesson1Verbs = [
    { infinitive: 'hablar', meaning: '说话', conjugationType: 1, lessonNumber: 1 },
    { infinitive: 'estudiar', meaning: '学习', conjugationType: 1, lessonNumber: 1 },
    { infinitive: 'trabajar', meaning: '工作', conjugationType: 1, lessonNumber: 1 },
    { infinitive: 'llamar', meaning: '叫', conjugationType: 1, lessonNumber: 1 },
    { infinitive: 'estar', meaning: '在/是', conjugationType: 1, lessonNumber: 1, isIrregular: 1 },
    { infinitive: 'ser', meaning: '是', conjugationType: 2, lessonNumber: 1, isIrregular: 1 },
    { infinitive: 'tener', meaning: '有', conjugationType: 2, lessonNumber: 1, isIrregular: 1 },
    { infinitive: 'comer', meaning: '吃', conjugationType: 2, lessonNumber: 1 },
    { infinitive: 'beber', meaning: '喝', conjugationType: 2, lessonNumber: 1 },
    { infinitive: 'vivir', meaning: '住/生活', conjugationType: 3, lessonNumber: 1 },
    { infinitive: 'escribir', meaning: '写', conjugationType: 3, lessonNumber: 1 },
    { infinitive: 'abrir', meaning: '打开', conjugationType: 3, lessonNumber: 1 }
  ]

  // 第二课的动词示例
  const lesson2Verbs = [
    { infinitive: 'mirar', meaning: '看', conjugationType: 1, lessonNumber: 2 },
    { infinitive: 'escuchar', meaning: '听', conjugationType: 1, lessonNumber: 2 },
    { infinitive: 'comprar', meaning: '买', conjugationType: 1, lessonNumber: 2 },
    { infinitive: 'buscar', meaning: '找', conjugationType: 1, lessonNumber: 2 },
    { infinitive: 'leer', meaning: '读', conjugationType: 2, lessonNumber: 2 },
    { infinitive: 'aprender', meaning: '学会', conjugationType: 2, lessonNumber: 2 },
    { infinitive: 'recibir', meaning: '收到', conjugationType: 3, lessonNumber: 2 },
    { infinitive: 'subir', meaning: '上升', conjugationType: 3, lessonNumber: 2 }
  ]

  const allVerbs = [...lesson1Verbs, ...lesson2Verbs]

  // 插入动词
  for (const verb of allVerbs) {
    const verbId = Verb.create(verb)
    
    // 为每个动词创建变位
    const conjugations = generateConjugations(verb, verbId)
    Conjugation.createBatch(verbId, conjugations)
  }

  console.log(`\x1b[32m   ✓ 词库数据初始化完成\x1b[0m，共插入 \x1b[33m${allVerbs.length}\x1b[0m 个动词\n`)
}

// 生成动词变位
function generateConjugations(verb, verbId) {
  const conjugations = []
  
  // 现在时陈述式
  const presentIndicative = generatePresentIndicative(verb)
  conjugations.push(...presentIndicative)

  // 过去时陈述式
  const preterite = generatePreterite(verb)
  conjugations.push(...preterite)

  // 将来时陈述式
  const future = generateFuture(verb)
  conjugations.push(...future)

  return conjugations
}

// 生成现在时陈述式变位
function generatePresentIndicative(verb) {
  const persons = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes']
  const stem = verb.infinitive.slice(0, -2) // 去掉-ar/-er/-ir
  
  let endings = []
  
  // 第一变位 -ar
  if (verb.conjugationType === 1) {
    endings = ['o', 'as', 'a', 'amos', 'áis', 'an']
  }
  // 第二变位 -er
  else if (verb.conjugationType === 2) {
    endings = ['o', 'es', 'e', 'emos', 'éis', 'en']
  }
  // 第三变位 -ir
  else if (verb.conjugationType === 3) {
    endings = ['o', 'es', 'e', 'imos', 'ís', 'en']
  }

  // 特殊处理不规则动词
  if (verb.infinitive === 'ser') {
    const forms = ['soy', 'eres', 'es', 'somos', 'sois', 'son']
    return persons.map((person, i) => ({
      tense: '现在时',
      mood: '陈述式',
      person,
      conjugatedForm: forms[i],
      isIrregular: 1
    }))
  }

  if (verb.infinitive === 'estar') {
    const forms = ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están']
    return persons.map((person, i) => ({
      tense: '现在时',
      mood: '陈述式',
      person,
      conjugatedForm: forms[i],
      isIrregular: 1
    }))
  }

  if (verb.infinitive === 'tener') {
    const forms = ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen']
    return persons.map((person, i) => ({
      tense: '现在时',
      mood: '陈述式',
      person,
      conjugatedForm: forms[i],
      isIrregular: 1
    }))
  }

  return persons.map((person, i) => ({
    tense: '现在时',
    mood: '陈述式',
    person,
    conjugatedForm: stem + endings[i],
    isIrregular: 0
  }))
}

// 生成简单过去时变位
function generatePreterite(verb) {
  const persons = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes']
  const stem = verb.infinitive.slice(0, -2)
  
  let endings = []
  
  if (verb.conjugationType === 1) {
    endings = ['é', 'aste', 'ó', 'amos', 'asteis', 'aron']
  } else if (verb.conjugationType === 2 || verb.conjugationType === 3) {
    endings = ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron']
  }

  return persons.map((person, i) => ({
    tense: '简单过去时',
    mood: '陈述式',
    person,
    conjugatedForm: stem + endings[i],
    isIrregular: 0
  }))
}

// 生成将来时变位
function generateFuture(verb) {
  const persons = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes']
  const endings = ['é', 'ás', 'á', 'emos', 'éis', 'án']

  return persons.map((person, i) => ({
    tense: '将来时',
    mood: '陈述式',
    person,
    conjugatedForm: verb.infinitive + endings[i],
    isIrregular: 0
  }))
}

module.exports = {
  initSampleData
}
