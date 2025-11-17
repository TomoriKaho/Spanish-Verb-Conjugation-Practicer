<template>
  <view class="container">
    <view class="practice-header">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progress + '%' }"></view>
      </view>
      <text class="progress-text">{{ currentIndex + 1 }} / {{ exercises.length }}</text>
    </view>

    <view class="card exercise-card" v-if="currentExercise">
      <view class="exercise-type-tag">
        <text>{{ exerciseTypeText }}</text>
      </view>

      <view class="verb-info">
        <text class="infinitive">{{ currentExercise.infinitive }}</text>
        <text class="meaning">{{ currentExercise.meaning }}</text>
      </view>

      <view class="question-section">
        <text class="tense-info">{{ currentExercise.mood }} - {{ currentExercise.tense }}</text>
        <text class="person-info">{{ currentExercise.person }}</text>
      </view>

      <!-- 选择题 -->
      <view v-if="exerciseType === 'choice'" class="options-container">
        <view
          v-for="(option, index) in currentExercise.options"
          :key="index"
          :class="['option-item', selectedAnswer === option ? 'selected' : '']"
          @click="selectOption(option)"
        >
          <text>{{ option }}</text>
        </view>
      </view>

      <!-- 例句填空题 -->
      <view v-else-if="exerciseType === 'sentence'" class="sentence-container">
        <view class="sentence-text">{{ currentExercise.sentence }}</view>
        <view class="translation" v-if="currentExercise.translation">
          <text>翻译：{{ currentExercise.translation }}</text>
        </view>
        <view class="hint-box" v-if="currentExercise.hint">
          <text class="hint-label">💡 提示：</text>
          <text class="hint-text">{{ currentExercise.hint }}</text>
        </view>
        <input
          class="answer-input"
          v-model="userAnswer"
          placeholder="请填入正确的动词变位"
          :focus="true"
        />
      </view>

      <!-- 填空题和变位题 -->
      <view v-else class="input-container">
        <view class="question-text" v-if="currentExercise.question">
          <text>{{ currentExercise.question }}</text>
        </view>
        <view class="example-text" v-if="currentExercise.example">
          <text>例句：{{ currentExercise.example }}</text>
        </view>
        <view class="hint-box" v-if="currentExercise.hint">
          <text class="hint-label">💡 提示：</text>
          <text class="hint-text">{{ currentExercise.hint }}</text>
        </view>
        <input
          class="answer-input"
          v-model="userAnswer"
          placeholder="请输入变位形式"
          :focus="true"
        />
      </view>

      <button class="btn-primary mt-20" @click="submitAnswer">提交答案</button>
    </view>

    <!-- 答案反馈 -->
    <view class="modal" v-if="showFeedback" @click="nextExercise">
      <view class="modal-content" :class="isCorrect ? 'correct' : 'wrong'" @click.stop>
        <view class="feedback-icon">{{ isCorrect ? '✓' : '✗' }}</view>
        <text class="feedback-title">{{ isCorrect ? '回答正确！' : '回答错误' }}</text>
        <view class="feedback-detail" v-if="!isCorrect">
          <text class="label">正确答案：</text>
          <text class="answer">{{ currentExercise.correctAnswer }}</text>
        </view>
        <button class="btn-secondary mt-20" @click="nextExercise">下一题</button>
      </view>
    </view>

    <!-- 完成练习 -->
    <view class="modal" v-if="showResult" @click="finishPractice">
      <view class="modal-content result" @click.stop>
        <text class="result-title">练习完成！</text>
        <view class="result-stats">
          <view class="result-item">
            <text class="result-number">{{ correctCount }}</text>
            <text class="result-label">答对</text>
          </view>
          <view class="result-item">
            <text class="result-number">{{ exercises.length }}</text>
            <text class="result-label">总题数</text>
          </view>
          <view class="result-item">
            <text class="result-number">{{ accuracy }}%</text>
            <text class="result-label">正确率</text>
          </view>
        </view>
        <button class="btn-primary mt-20" @click="finishPractice">完成</button>
        <button class="btn-secondary mt-20" @click="restartPractice">再来一次</button>
      </view>
    </view>

    <!-- 配置面板 -->
    <view class="settings-card card" v-if="!hasStarted">
      <text class="title">练习设置</text>
      
      <view class="form-item">
        <text class="label">练习类型</text>
        <picker @change="onExerciseTypeChange" :value="exerciseTypeIndex" :range="exerciseTypes" range-key="label">
          <view class="picker">{{ exerciseTypes[exerciseTypeIndex].label }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">题目数量</text>
        <slider @change="onCountChange" :value="exerciseCount" min="5" max="30" show-value />
      </view>

      <view class="form-item">
        <view class="ai-switch-container">
          <text class="label">AI 智能出题</text>
          <switch :checked="useAI" @change="onAISwitchChange" color="#667eea" />
        </view>
        <text class="ai-description">开启后使用 AI 生成更高质量、更具针对性的练习题</text>
      </view>

      <button class="btn-primary mt-20" @click="startPractice">开始练习</button>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast, showLoading, hideLoading } from '@/utils/common.js'

export default {
  data() {
    return {
      hasStarted: false,
      exerciseTypes: [
        { value: 'choice', label: '选择题' },
        { value: 'fill', label: '填空题' },
        { value: 'conjugate', label: '变位练习' },
        { value: 'sentence', label: '例句填空' }
      ],
      exerciseTypeIndex: 0,
      exerciseType: 'choice',
      exerciseCount: 10,
      useAI: true,
      exercises: [],
      currentIndex: 0,
      userAnswer: '',
      selectedAnswer: '',
      showFeedback: false,
      showResult: false,
      isCorrect: false,
      correctCount: 0
    }
  },
  computed: {
    currentExercise() {
      return this.exercises[this.currentIndex]
    },
    progress() {
      return this.exercises.length ? ((this.currentIndex + 1) / this.exercises.length) * 100 : 0
    },
    accuracy() {
      return this.exercises.length ? Math.round((this.correctCount / this.exercises.length) * 100) : 0
    },
    exerciseTypeText() {
      const types = { choice: '选择题', fill: '填空题', conjugate: '变位练习' }
      return types[this.exerciseType] || ''
    }
  },
  methods: {
    onExerciseTypeChange(e) {
      this.exerciseTypeIndex = e.detail.value
      this.exerciseType = this.exerciseTypes[e.detail.value].value
    },
    onCountChange(e) {
      this.exerciseCount = e.detail.value
    },
    onAISwitchChange(e) {
      this.useAI = e.detail.value
    },
    async startPractice() {
      const loadingText = this.useAI ? '正在使用 AI 生成练习题...' : '生成练习题...'
      showLoading(loadingText)

      try {
        const res = await api.getExercise({
          exerciseType: this.exerciseType,
          count: this.exerciseCount,
          useAI: this.useAI
        })

        hideLoading()

        if (res.success && res.exercises.length > 0) {
          this.exercises = res.exercises
          this.hasStarted = true
          this.currentIndex = 0
          this.correctCount = 0
          
          if (res.aiEnhanced) {
            showToast('AI 智能出题已启用', 'success')
          }
        } else {
          showToast('获取练习题失败')
        }
      } catch (error) {
        hideLoading()
        showToast('网络错误')
      }
    },
    selectOption(option) {
      this.selectedAnswer = option
    },
    async submitAnswer() {
      const answer = this.exerciseType === 'choice' ? this.selectedAnswer : this.userAnswer

      if (!answer) {
        showToast('请先作答')
        return
      }

      try {
        const res = await api.submitAnswer({
          verbId: this.currentExercise.verbId,
          exerciseType: this.exerciseType,
          answer: answer,
          correctAnswer: this.currentExercise.correctAnswer,
          tense: this.currentExercise.tense,
          mood: this.currentExercise.mood,
          person: this.currentExercise.person
        })

        if (res.success) {
          this.isCorrect = res.isCorrect
          if (res.isCorrect) {
            this.correctCount++
          }
          this.showFeedback = true
        }
      } catch (error) {
        showToast('提交失败')
      }
    },
    nextExercise() {
      this.showFeedback = false
      this.userAnswer = ''
      this.selectedAnswer = ''

      if (this.currentIndex < this.exercises.length - 1) {
        this.currentIndex++
      } else {
        this.showResult = true
      }
    },
    finishPractice() {
      this.showResult = false
      this.hasStarted = false
      this.exercises = []
      this.currentIndex = 0
      this.correctCount = 0
    },
    restartPractice() {
      this.showResult = false
      this.currentIndex = 0
      this.correctCount = 0
    }
  }
}
</script>

<style scoped>
.practice-header {
  padding: 20rpx;
  background: #fff;
}

.progress-bar {
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 15rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.progress-text {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.exercise-card {
  margin-top: 20rpx;
}

.exercise-type-tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #666;
}

.verb-info {
  text-align: center;
  margin: 30rpx 0;
}

.infinitive {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.meaning {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.question-section {
  background: #f5f5f5;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.tense-info {
  display: block;
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.person-info {
  display: block;
  font-size: 28rpx;
  color: #667eea;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.option-item {
  background: #f5f5f5;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  border: 2rpx solid transparent;
}

.option-item.selected {
  background: #e6f7ff;
  border-color: #667eea;
  color: #667eea;
}

.input-container {
  padding: 20rpx 0;
}

.answer-input {
  width: 100%;
  height: 100rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  text-align: center;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  width: 80%;
  max-width: 600rpx;
}

.modal-content.correct {
  border-top: 8rpx solid #52c41a;
}

.modal-content.wrong {
  border-top: 8rpx solid #ff4d4f;
}

.feedback-icon {
  text-align: center;
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.modal-content.correct .feedback-icon {
  color: #52c41a;
}

.modal-content.wrong .feedback-icon {
  color: #ff4d4f;
}

.feedback-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.feedback-detail {
  background: #f5f5f5;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
}

.feedback-detail .label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.feedback-detail .answer {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.result-title {
  display: block;
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.result-item {
  text-align: center;
}

.result-number {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
}

.result-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.settings-card {
  margin-top: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

/* AI 增强样式 */
.ai-info-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  margin: 15rpx 0;
  font-size: 26rpx;
  line-height: 1.6;
}

.ai-translation {
  background: #f0f4ff;
  color: #667eea;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  margin-top: 15rpx;
  font-size: 24rpx;
  border-left: 4rpx solid #667eea;
}

.ai-hint {
  background: #fff8e1;
  color: #f57c00;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  margin-top: 15rpx;
  font-size: 24rpx;
  border-left: 4rpx solid #f57c00;
}

.ai-example {
  background: #f1f8e9;
  color: #558b2f;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
  margin-top: 15rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.picker {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  line-height: 80rpx;
  font-size: 28rpx;
}
</style>
