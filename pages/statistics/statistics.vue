<!-- <template>
  <view class="container">
    <view class="card stats-overview">
      <text class="title">学习统计</text>
      <view class="stats-grid">
        <view class="stat-box">
          <text class="stat-value">{{ totalStats.total_exercises || 0 }}</text>
          <text class="stat-label">总练习题数</text>
        </view>
        <view class="stat-box">
          <text class="stat-value">{{ totalStats.correct_exercises || 0 }}</text>
          <text class="stat-label">答对题数</text>
        </view>
        <view class="stat-box">
          <text class="stat-value">{{ totalStats.practiced_verbs || 0 }}</text>
          <text class="stat-label">练习过的动词</text>
        </view>
        <view class="stat-box">
          <text class="stat-value">{{ totalStats.practice_days || 0 }}</text>
          <text class="stat-label">练习天数</text>
        </view>
      </view>
    </view>

    <view class="card accuracy-card">
      <text class="subtitle">正确率</text>
      <view class="accuracy-circle">
        <text class="accuracy-value">{{ accuracy }}%</text>
      </view>
    </view>

    <view class="card mastered-card">
      <text class="subtitle">已掌握动词</text>
      <view class="mastered-list">
        <view class="mastered-item" v-for="verb in masteredVerbs" :key="verb.id">
          <view class="verb-name">
            <text class="infinitive">{{ verb.infinitive }}</text>
            <text class="meaning">{{ verb.meaning }}</text>
          </view>
          <view class="mastery-level">
            <text>掌握度: {{ verb.mastery_level }}/5</text>
          </view>
        </view>
        <view class="empty-tip" v-if="masteredVerbs.length === 0">
          <text>还没有掌握的动词，加油练习吧！</text>
        </view>
      </view>
    </view>

    <view class="card recent-records">
      <text class="subtitle">最近练习记录</text>
      <view class="record-list">
        <view class="record-item" v-for="record in recentRecords.slice(0, 10)" :key="record.id">
          <view class="record-verb">
            <text class="verb-text">{{ record.infinitive }}</text>
            <text class="verb-meaning">{{ record.meaning }}</text>
          </view>
          <view class="record-detail">
            <text class="tense-text">{{ record.mood }} {{ record.tense }}</text>
            <text :class="['result-icon', record.is_correct ? 'correct' : 'wrong']">
              {{ record.is_correct ? '✓' : '✗' }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast } from '@/utils/common.js'

export default {
  data() {
    return {
      totalStats: {},
      masteredVerbs: [],
      recentRecords: []
    }
  },
  computed: {
    accuracy() {
      if (!this.totalStats.total_exercises) return 0
      return Math.round((this.totalStats.correct_exercises / this.totalStats.total_exercises) * 100)
    }
  },
  onShow() {
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        // 获取统计数据
        const statsRes = await api.getStatistics()
        if (statsRes.success) {
          this.totalStats = statsRes.statistics.total || {}
          this.masteredVerbs = statsRes.statistics.masteredVerbs || []
        }

        // 获取练习记录
        const recordsRes = await api.getStudyRecords()
        if (recordsRes.success) {
          this.recentRecords = recordsRes.records || []
        }
      } catch (error) {
        showToast('加载数据失败')
      }
    }
  }
}
</script>

<style scoped>
.stats-overview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-top: 20rpx;
}

.stat-box {
  text-align: center;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}

.accuracy-card {
  text-align: center;
}

.accuracy-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 10rpx solid #667eea;
  margin: 30rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accuracy-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
}

.mastered-list {
  margin-top: 20rpx;
}

.mastered-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.verb-name {
  flex: 1;
}

.infinitive {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.meaning {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
}

.mastery-level {
  font-size: 24rpx;
  color: #667eea;
}

.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: #999;
  font-size: 26rpx;
}

.record-list {
  margin-top: 20rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-verb {
  flex: 1;
}

.verb-text {
  display: block;
  font-size: 28rpx;
  color: #333;
}

.verb-meaning {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.record-detail {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.tense-text {
  font-size: 22rpx;
  color: #666;
}

.result-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.result-icon.correct {
  color: #52c41a;
}

.result-icon.wrong {
  color: #ff4d4f;
}
</style> -->





<template>
  <view class="container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">学习统计</text>
      <text class="page-subtitle">记录你的每一次进步</text>
    </view>

    <!-- 主要数据概览 -->
    <view class="overview-section">
      <view class="overview-card">
        <view class="overview-icon">📊</view>
        <text class="overview-number">{{ totalStats.total_exercises || 0 }}</text>
        <text class="overview-label">总练习量</text>
      </view>
      
      <view class="accuracy-card">
        <view class="accuracy-circle">
          <text class="accuracy-value">{{ accuracy }}%</text>
          <text class="accuracy-label">正确率</text>
        </view>
        <view class="accuracy-details">
          <text class="detail-item">答对: {{ totalStats.correct_exercises || 0 }}</text>
          <text class="detail-item">总数: {{ totalStats.total_exercises || 0 }}</text>
        </view>
      </view>
    </view>

    <!-- 详细数据 -->
    <view class="detailed-stats">
      <view class="stat-row">
        <view class="stat-item">
          <view class="stat-icon">📅</view>
          <text class="stat-value">{{ totalStats.practice_days || 0 }}</text>
          <text class="stat-name">练习天数</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon">📝</view>
          <text class="stat-value">{{ totalStats.practiced_verbs || 0 }}</text>
          <text class="stat-name">练习动词</text>
        </view>
        <view class="stat-item">
          <view class="stat-icon">⭐</view>
          <text class="stat-value">{{ totalStats.masteredVerbsCount || 0 }}</text>
          <text class="stat-name">已掌握</text>
        </view>
      </view>
    </view>

    <!-- 已掌握动词 -->
    <view class="mastered-section" v-if="masteredVerbs.length > 0">
      <view class="section-header">
        <text class="section-title">已掌握动词</text>
        <text class="section-count">{{ masteredVerbs.length }} 个</text>
      </view>
      <view class="verbs-grid">
        <view 
          class="verb-card" 
          v-for="verb in masteredVerbs" 
          :key="verb.id"
          :style="getVerbCardStyle(verb.mastery_level)"
        >
          <text class="verb-name">{{ verb.infinitive }}</text>
          <text class="verb-meaning">{{ verb.meaning }}</text>
          <view class="mastery-level">
            <text class="level-text">掌握度</text>
            <view class="level-stars">
              <text 
                v-for="star in 5" 
                :key="star"
                :class="['star', star <= verb.mastery_level ? 'active' : '']"
              >⭐</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近练习记录 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近练习</text>
        <text class="section-more" @click="viewAllRecords">查看全部</text>
      </view>
      <view class="records-list">
        <view 
          class="record-item" 
          v-for="record in recentRecords.slice(0, 5)" 
          :key="record.id"
        >
          <view class="record-main">
            <text class="verb-text">{{ record.infinitive }}</text>
            <text class="verb-tense">{{ record.mood }} {{ record.tense }}</text>
          </view>
          <view 
            :class="['record-status', record.is_correct ? 'correct' : 'wrong']"
          >
            <text class="status-icon">{{ record.is_correct ? '✓' : '✗' }}</text>
            <text class="status-text">{{ record.is_correct ? '正确' : '错误' }}</text>
          </view>
        </view>
        
        <view class="empty-records" v-if="recentRecords.length === 0">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无练习记录</text>
          <text class="empty-hint">开始你的第一次练习吧</text>
        </view>
      </view>
    </view>

    <!-- 学习激励 -->
    <view class="motivation-section">
      <view class="motivation-content">
        <text class="motivation-quote">"El que mucho abarca, poco aprieta."</text>
        <text class="motivation-translation">贪多嚼不烂 - 循序渐进才是关键</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast } from '@/utils/common.js'

export default {
  data() {
    return {
      totalStats: {},
      masteredVerbs: [],
      recentRecords: []
    }
  },
  computed: {
    accuracy() {
      if (!this.totalStats.total_exercises) return 0
      return Math.round((this.totalStats.correct_exercises / this.totalStats.total_exercises) * 100)
    }
  },
  onShow() {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const statsRes = await api.getStatistics()
        if (statsRes.success) {
          this.totalStats = statsRes.statistics.total || {}
          this.masteredVerbs = statsRes.statistics.masteredVerbs || []
        }

        const recordsRes = await api.getStudyRecords()
        if (recordsRes.success) {
          this.recentRecords = recordsRes.records || []
        }
      } catch (error) {
        showToast('加载数据失败')
      }
    },
    getVerbCardStyle(level) {
      const colors = [
        'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        'linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)',
        'linear-gradient(135deg, #54a0ff 0%, #2e86de 100%)',
        'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)',
        'linear-gradient(135deg, #1dd1a1 0%, #10ac84 100%)'
      ]
      return {
        background: colors[level - 1] || colors[0]
      }
    },
    viewAllRecords() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 30rpx;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 50rpx;
}

.page-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.page-subtitle {
  display: block;
  font-size: 26rpx;
  color: #666;
}

/* 概览区域 */
.overview-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.overview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.overview-icon {
  font-size: 48rpx;
  margin-bottom: 20rpx;
}

.overview-number {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.overview-label {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.accuracy-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.accuracy-circle {
  flex-shrink: 0;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 8rpx solid #667eea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.accuracy-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4rpx;
}

.accuracy-label {
  font-size: 22rpx;
  color: #999;
}

.accuracy-details {
  flex: 1;
}

.detail-item {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

/* 详细统计 */
.detailed-stats {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 16rpx;
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-name {
  display: block;
  font-size: 24rpx;
  color: #666;
}

/* 已掌握动词 */
.mastered-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-count {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.verbs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.verb-card {
  border-radius: 16rpx;
  padding: 30rpx 24rpx;
  color: #fff;
  text-align: center;
}

.verb-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.verb-meaning {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 16rpx;
}

.mastery-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.level-text {
  font-size: 20rpx;
  opacity: 0.8;
}

.level-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 20rpx;
  opacity: 0.3;
}

.star.active {
  opacity: 1;
}

/* 最近练习 */
.recent-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.section-more {
  font-size: 24rpx;
  color: #667eea;
}

.records-list {
  margin-top: 20rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-main {
  flex: 1;
}

.verb-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.verb-tense {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.record-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.record-status.correct {
  background: #f6ffed;
  color: #52c41a;
}

.record-status.wrong {
  background: #fff1f0;
  color: #ff4d4f;
}

.status-icon {
  font-size: 20rpx;
}

.empty-records {
  text-align: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.empty-hint {
  display: block;
  font-size: 24rpx;
  color: #ccc;
}

/* 学习激励 */
.motivation-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  color: #fff;
}

.motivation-quote {
  display: block;
  font-size: 28rpx;
  font-style: italic;
  margin-bottom: 12rpx;
  opacity: 0.9;
}

.motivation-translation {
  display: block;
  font-size: 24rpx;
  opacity: 0.8;
}
</style>