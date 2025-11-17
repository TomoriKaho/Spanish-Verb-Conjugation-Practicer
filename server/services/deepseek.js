const axios = require('axios')
require('dotenv').config()

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

class DeepSeekService {
  /**
   * 调用 DeepSeek API
   * @param {string} prompt - 提示词
   * @param {number} maxTokens - 最大token数
   * @returns {Promise<string>} AI 响应内容
   */
  static async chat(prompt, maxTokens = 1000) {
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一位专业的西班牙语教师，精通西班牙语动词变位和语法。你需要根据要求生成高质量的练习题，确保题目准确、有针对性，且只有唯一正确答案。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error.response?.data || error.message)
      throw new Error('AI 服务暂时不可用')
    }
  }

  /**
   * 生成针对性例句填空题
   * @param {object} verb - 动词对象
   * @param {object} conjugation - 变位对象
   * @returns {Promise<object>} 生成的题目
   */
  static async generateSentenceExercise(verb, conjugation) {
    const prompt = `
请为西班牙语动词 "${verb.infinitive}" (意思: ${verb.meaning}) 生成一道例句填空题。

要求:
1. 句子必须使用 ${conjugation.mood} ${conjugation.tense} 的 ${conjugation.person} 形式
2. 正确答案必须是: ${conjugation.conjugated_form}
3. 句子的语境要确保只有这个变位形式是唯一正确的答案（通过时间状语、语境等明确时态和人称）
4. 句子要自然、地道，符合日常使用场景
5. 难度适中，适合初学者

请严格按照以下JSON格式返回（不要包含任何markdown标记或额外说明）:
{
  "sentence": "完整的西班牙语句子，用 _____ 表示要填空的位置",
  "answer": "${conjugation.conjugated_form}",
  "translation": "句子的中文翻译",
  "hint": "简短的提示（如时态、人称等）"
}
`

    const response = await this.chat(prompt, 500)
    
    // 清理可能的 markdown 标记
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }
    
    return JSON.parse(cleanResponse)
  }

  /**
   * 生成干扰选项
   * @param {object} verb - 动词对象
   * @param {object} correctConjugation - 正确变位
   * @param {array} allConjugations - 所有变位
   * @returns {Promise<array>} 包含正确答案和干扰项的选项数组
   */
  static async generateChoiceOptions(verb, correctConjugation, allConjugations) {
    const prompt = `
针对西班牙语动词 "${verb.infinitive}" 的练习，正确答案是 ${correctConjugation.mood} ${correctConjugation.tense} 的 ${correctConjugation.person} 形式: ${correctConjugation.conjugated_form}

可用的其他变位形式: ${allConjugations.filter(c => c.conjugated_form !== correctConjugation.conjugated_form).map(c => c.conjugated_form).join(', ')}

请选择3个最容易混淆的干扰选项，这些选项应该是:
1. 同一个动词的其他变位形式
2. 与正确答案在拼写或形式上相似
3. 学生容易混淆的时态或人称

请严格按照以下JSON格式返回（不要包含任何markdown标记）:
{
  "options": ["干扰项1", "干扰项2", "干扰项3"]
}
`

    try {
      const response = await this.chat(prompt, 200)
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/g, '')
      }
      
      const result = JSON.parse(cleanResponse)
      const options = [correctConjugation.conjugated_form, ...result.options]
      
      // 打乱选项顺序
      return options.sort(() => Math.random() - 0.5)
    } catch (error) {
      // 如果 AI 生成失败，使用传统方法
      console.log('AI 生成选项失败，使用备选方法')
      const options = [correctConjugation.conjugated_form]
      const otherConjugations = allConjugations
        .filter(c => c.conjugated_form !== correctConjugation.conjugated_form)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      
      options.push(...otherConjugations.map(c => c.conjugated_form))
      return options.sort(() => Math.random() - 0.5)
    }
  }

  /**
   * 生成针对性填空题
   * @param {object} verb - 动词对象
   * @param {object} conjugation - 变位对象
   * @returns {Promise<object>} 生成的题目
   */
  static async generateFillBlankExercise(verb, conjugation) {
    const prompt = `
为西班牙语动词 "${verb.infinitive}" (${verb.meaning}) 生成一道填空练习题。

要求:
1. 要求学生填写 ${conjugation.mood} ${conjugation.tense} 的 ${conjugation.person} 形式
2. 正确答案: ${conjugation.conjugated_form}
3. 提供清晰的上下文说明
4. 可以包含例句帮助理解

请严格按照以下JSON格式返回（不要包含markdown标记）:
{
  "question": "题目描述（中文）",
  "example": "例句（如果有，西班牙语）",
  "hint": "提示信息",
  "answer": "${conjugation.conjugated_form}"
}
`

    const response = await this.chat(prompt, 400)
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/g, '')
    }
    
    return JSON.parse(cleanResponse)
  }

  /**
   * 批量生成练习题（优化性能）
   * @param {array} exercises - 练习题数组
   * @returns {Promise<array>} 增强后的练习题
   */
  static async batchEnhanceExercises(exercises) {
    // 限制并发数量，避免API限流
    const concurrency = 3
    const results = []
    
    for (let i = 0; i < exercises.length; i += concurrency) {
      const batch = exercises.slice(i, i + concurrency)
      const batchResults = await Promise.allSettled(
        batch.map(async (exercise) => {
          try {
            // 根据题型调用不同的AI增强方法
            if (exercise.useAI) {
              return await this.enhanceSingleExercise(exercise)
            }
            return exercise
          } catch (error) {
            console.error(`练习题 ${exercise.id} AI增强失败:`, error.message)
            return exercise // 返回原始题目
          }
        })
      )
      
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : r.reason))
    }
    
    return results
  }

  /**
   * 增强单个练习题
   */
  static async enhanceSingleExercise(exercise) {
    // 这里可以根据需要调用不同的AI方法
    return exercise
  }
}

module.exports = DeepSeekService
