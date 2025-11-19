<!-- <template>
  <view class="container">
    <view class="header">
      <text class="title">西班牙语动词变位</text>
      <text class="subtitle">每天练习，轻松掌握</text>
    </view>

    <view class="card welcome-card" v-if="userInfo">
      <view class="flex-between">
        <view>
          <text class="welcome-text">欢迎回来, {{ userInfo.username }}</text>
          <text class="study-days">已学习 {{ studyDays }} 天</text>
        </view>
        <view class="streak-badge">
          <text class="streak-number">{{ streakDays }}</text>
          <text class="streak-label">连续打卡</text>
        </view>
      </view>
    </view>

    <view class="card stats-card">
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-number">{{ todayStats.total }}</text>
          <text class="stat-label">今日练习</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ todayStats.correct }}</text>
          <text class="stat-label">答对题目</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ totalStats.masteredVerbsCount || 0 }}</text>
          <text class="stat-label">已掌握</text>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <button class="btn-primary" @click="startPractice">开始练习</button>
      <button class="btn-secondary mt-20" @click="checkIn" v-if="!hasCheckedInToday">每日打卡</button>
      <view class="checked-in-tip mt-20" v-else>
        <text>✓ 今日已打卡</text>
      </view>
    </view>

    <view class="quick-access mt-20">
      <view class="quick-item" @click="goToLeaderboard">
        <text class="quick-icon">🏆</text>
        <text class="quick-label">排行榜</text>
      </view>
      <view class="quick-item" @click="goToStatistics">
        <text class="quick-icon">📊</text>
        <text class="quick-label">学习统计</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { formatDate, showToast } from '@/utils/common.js'

export default {
  data() {
    return {
      userInfo: null,
      todayStats: {
        total: 0,
        correct: 0
      },
      totalStats: {},
      streakDays: 0,
      studyDays: 0,
      hasCheckedInToday: false
    }
  },
  onLoad() {
    this.checkLogin()
  },
  onShow() {
    if (this.userInfo) {
      this.loadData()
    }
  },
  methods: {
    checkLogin() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.userInfo = userInfo
        this.loadData()
      } else {
        // 未登录，跳转到登录页（使用 reLaunch 避免 tabBar 冲突）
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },
    async loadData() {
      try {
        // 获取统计数据
        const statsRes = await api.getStatistics()
        if (statsRes.success) {
          this.todayStats = statsRes.statistics.today || { total: 0, correct: 0 }
          this.totalStats = statsRes.statistics || {}
        }

        // 获取打卡信息
        const checkInRes = await api.getCheckInHistory()
        if (checkInRes.success) {
          this.streakDays = checkInRes.streakDays || 0
          this.hasCheckedInToday = checkInRes.hasCheckedInToday
        }

        // 计算学习天数
        if (this.userInfo.created_at) {
          const start = new Date(this.userInfo.created_at)
          const now = new Date()
          this.studyDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    startPractice() {
      uni.navigateTo({
        url: '/pages/practice/practice'
      })
    },
    async checkIn() {
      try {
        const res = await api.checkIn()
        if (res.success) {
          showToast(res.message || '打卡成功', 'success')
          this.hasCheckedInToday = true
          this.streakDays = res.streakDays || this.streakDays + 1
        }
      } catch (error) {
        showToast('打卡失败')
      }
    },
    goToLeaderboard() {
      uni.switchTab({
        url: '/pages/leaderboard/leaderboard'
      })
    },
    goToStatistics() {
      uni.switchTab({
        url: '/pages/statistics/statistics'
      })
    }
  }
}
</script>

<style scoped>
.header {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.welcome-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.study-days {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}

.streak-badge {
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 20rpx 30rpx;
  border-radius: 12rpx;
}

.streak-number {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
}

.streak-label {
  display: block;
  font-size: 22rpx;
  margin-top: 5rpx;
}

.stats-card {
  margin-top: 20rpx;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.action-buttons {
  padding: 20rpx 0;
}

.checked-in-tip {
  text-align: center;
  color: #52c41a;
  font-size: 28rpx;
}

.quick-access {
  display: flex;
  gap: 20rpx;
}

.quick-item {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.quick-icon {
  display: block;
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.quick-label {
  display: block;
  font-size: 26rpx;
  color: #666;
}
</style> -->




<template>
  <view class="container">
    <!-- 顶部横幅 -->
    <view class="hero-banner">
      <view class="hero-content">
        <text class="hero-title">西班牙语动词变位</text>
        <text class="hero-subtitle">每天进步一点点，轻松掌握西语动词</text>
      </view>
      <view class="hero-decoration">
        <text class="decoration-text">¡Hola!</text>
      </view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-card" v-if="userInfo">
      <view class="user-header">
        <view class="user-avatar">
          <text class="avatar-text">{{ userInfo.username.charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-info">
          <text class="username">¡Hola, {{ userInfo.username }}!</text>
          <text class="study-progress">已学习 {{ studyDays }} 天</text>
        </view>
        <view class="streak-badge">
          <view class="streak-icon">🔥</view>
          <text class="streak-days">{{ streakDays }}</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-grid">
      <view class="stat-card">
        <view class="stat-icon">📚</view>
        <text class="stat-number">{{ todayStats.total || 0 }}</text>
        <text class="stat-label">今日练习</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon">✅</view>
        <text class="stat-number">{{ todayStats.correct || 0 }}</text>
        <text class="stat-label">答对题目</text>
      </view>
      <view class="stat-card">
        <view class="stat-icon">⭐</view>
        <text class="stat-number">{{ totalStats.masteredVerbsCount || 0 }}</text>
        <text class="stat-label">已掌握</text>
      </view>
    </view>

    <!-- 主要操作 -->
    <view class="action-section">
      <button class="primary-btn large-btn" @click="startPractice">
        <text class="btn-icon">🎯</text>
        <text>开始练习</text>
      </button>
      
      <view class="checkin-wrapper" v-if="!hasCheckedInToday">
        <button class="secondary-btn" @click="checkIn">
          <text class="btn-icon">📅</text>
          <text>每日打卡</text>
        </button>
      </view>
      <view class="checked-in-badge" v-else>
        <text class="checked-icon">✓</text>
        <text>今日已打卡</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-nav">
      <view class="nav-item" @click="goToStatistics">
        <view class="nav-icon">📊</view>
        <text class="nav-label">学习统计</text>
      </view>
      <view class="nav-item" @click="goToLeaderboard">
        <view class="nav-icon">🏆</view>
        <text class="nav-label">排行榜</text>
      </view>
      <view class="nav-item" @click="goToProfile">
        <view class="nav-icon">👤</view>
        <text class="nav-label">个人中心</text>
      </view>
    </view>

    <!-- 学习提示 -->
    <view class="study-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">每天坚持练习15分钟，效果更佳</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { formatDate, showToast } from '@/utils/common.js'

export default {
  data() {
    return {
      userInfo: null,
      todayStats: {
        total: 0,
        correct: 0
      },
      totalStats: {},
      streakDays: 0,
      studyDays: 0,
      hasCheckedInToday: false
    }
  },
  onLoad() {
    this.checkLogin()
  },
  onShow() {
    if (this.userInfo) {
      this.loadData()
    }
  },
  methods: {
    checkLogin() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.userInfo = userInfo
        this.loadData()
      } else {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    },
    async loadData() {
      try {
        const statsRes = await api.getStatistics()
        if (statsRes.success) {
          this.todayStats = statsRes.statistics.today || { total: 0, correct: 0 }
          this.totalStats = statsRes.statistics || {}
        }

        const checkInRes = await api.getCheckInHistory()
        if (checkInRes.success) {
          this.streakDays = checkInRes.streakDays || 0
          this.hasCheckedInToday = checkInRes.hasCheckedInToday
        }

        if (this.userInfo.created_at) {
          const start = new Date(this.userInfo.created_at)
          const now = new Date()
          this.studyDays = Math.floor((now - start) / (1000 * 60 * 60 * 24))
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    startPractice() {
      uni.switchTab({
        url: '/pages/practice/practice'
      })
    },
    async checkIn() {
      try {
        const res = await api.checkIn()
        if (res.success) {
          showToast('打卡成功！', 'success')
          this.hasCheckedInToday = true
          this.streakDays = res.streakDays || this.streakDays + 1
        }
      } catch (error) {
        showToast('打卡失败')
      }
    },
    goToLeaderboard() {
      uni.switchTab({
        url: '/pages/leaderboard/leaderboard'
      })
    },
    goToStatistics() {
      uni.switchTab({
        url: '/pages/statistics/statistics'
      })
    },
    goToProfile() {
      uni.switchTab({
        url: '/pages/profile/profile'
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

/* 顶部横幅 */
.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  position: relative;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.hero-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.hero-decoration {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
}

.decoration-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* 用户卡片 */
.user-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.study-progress {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.streak-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  padding: 16rpx 24rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.streak-icon {
  font-size: 24rpx;
}

.streak-days {
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
}

/* 数据统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.stat-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.stat-card:active {
  transform: scale(0.98);
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
}

.stat-number {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: #666;
}

/* 操作区域 */
.action-section {
  margin-bottom: 40rpx;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.large-btn {
  padding: 32rpx;
  font-size: 34rpx;
}

.secondary-btn {
  background: #fff;
  color: #667eea;
  border: 2rpx solid #667eea;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.checkin-wrapper {
  margin-top: 20rpx;
}

.checked-in-badge {
  background: #f0f9ff;
  border: 2rpx solid #bae7ff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: #1890ff;
  font-size: 28rpx;
}

.checked-icon {
  font-weight: bold;
}

/* 快捷导航 */
.quick-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.nav-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.nav-item:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 44rpx;
  margin-bottom: 12rpx;
}

.nav-label {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 学习提示 */
.study-tip {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.tip-icon {
  font-size: 28rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  flex: 1;
}
</style>