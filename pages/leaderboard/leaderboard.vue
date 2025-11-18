<!-- <template>
  <view class="container">
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @click="switchTab(tab.value)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="card leaderboard-card">
      <view class="rank-list">
        <view class="rank-item" v-for="(user, index) in leaderboard" :key="user.id">
          <view class="rank-number" :class="getRankClass(index)">
            <text v-if="index < 3">{{ ['🥇', '🥈', '🥉'][index] }}</text>
            <text v-else>{{ index + 1 }}</text>
          </view>
          <view class="user-info">
            <text class="username">{{ user.username }}</text>
            <text class="school" v-if="user.school">{{ user.school }}</text>
          </view>
          <view class="user-stats">
            <text class="check-in-days">连续打卡 {{ user.check_in_days }} 天</text>
            <text class="exercise-count">练习 {{ user.total_exercises }} 题</text>
          </view>
        </view>

        <view class="empty-tip" v-if="leaderboard.length === 0">
          <text>暂无排行数据</text>
        </view>
      </view>
    </view>

    <view class="tips card">
      <text class="tip-title">💡 小提示</text>
      <text class="tip-content">每天坚持练习和打卡，可以提升排名哦！</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast, showLoading, hideLoading } from '@/utils/common.js'

export default {
  data() {
    return {
      tabs: [
        { value: 'week', label: '周榜' },
        { value: 'month', label: '月榜' },
        { value: 'all', label: '总榜' }
      ],
      activeTab: 'week',
      leaderboard: []
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
    this.loadLeaderboard()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.loadLeaderboard()
    },
    async loadLeaderboard() {
      showLoading('加载中...')

      try {
        const res = await api.getLeaderboard(this.activeTab)
        hideLoading()

        if (res.success) {
          this.leaderboard = res.leaderboard || []
        }
      } catch (error) {
        hideLoading()
        showToast('加载失败')
      }
    },
    getRankClass(index) {
      if (index === 0) return 'gold'
      if (index === 1) return 'silver'
      if (index === 2) return 'bronze'
      return ''
    }
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 10rpx;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.rank-list {
  margin-top: 20rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.rank-number {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  background: #f5f5f5;
  color: #999;
  margin-right: 20rpx;
}

.rank-number.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
}

.rank-number.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
}

.rank-number.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e8b880 100%);
  color: #fff;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.school {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.user-stats {
  text-align: right;
}

.check-in-days {
  display: block;
  font-size: 24rpx;
  color: #667eea;
  font-weight: bold;
}

.exercise-count {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 5rpx;
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 26rpx;
}

.tips {
  background: #fff9e6;
  border-left: 4rpx solid #faad14;
}

.tip-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.tip-content {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
</style> -->



<template>
  <view class="container">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">学习排行榜</text>
      <text class="page-subtitle">与同学们一起进步</text>
    </view>

    <!-- Tab切换 -->
    <view class="tab-section">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="['tab-item', activeTab === tab.value ? 'active' : '']"
        @click="switchTab(tab.value)"
      >
        <text class="tab-label">{{ tab.label }}</text>
        <view class="tab-underline"></view>
      </view>
    </view>

    <!-- 排行榜内容 -->
    <view class="leaderboard-content">
      <!-- 前三名奖台 -->
      <view class="podium-section" v-if="leaderboard.length >= 3">
        <view class="podium-item second">
          <view class="podium-rank">🥈</view>
          <view class="podium-avatar">
            <text>{{ getInitials(leaderboard[1].username) }}</text>
          </view>
          <text class="podium-name">{{ leaderboard[1].username }}</text>
          <text class="podium-score">{{ leaderboard[1].total_exercises }}题</text>
        </view>
        
        <view class="podium-item first">
          <view class="podium-rank">🥇</view>
          <view class="podium-avatar champion">
            <text>{{ getInitials(leaderboard[0].username) }}</text>
          </view>
          <text class="podium-name">{{ leaderboard[0].username }}</text>
          <text class="podium-score">{{ leaderboard[0].total_exercises }}题</text>
        </view>
        
        <view class="podium-item third">
          <view class="podium-rank">🥉</view>
          <view class="podium-avatar">
            <text>{{ getInitials(leaderboard[2].username) }}</text>
          </view>
          <text class="podium-name">{{ leaderboard[2].username }}</text>
          <text class="podium-score">{{ leaderboard[2].total_exercises }}题</text>
        </view>
      </view>

      <!-- 其他排名列表 -->
      <view class="rank-list">
        <view 
          class="rank-item" 
          v-for="(user, index) in (leaderboard.length >= 3 ? leaderboard.slice(3) : leaderboard)" 
          :key="user.id"
          :class="{'current-user': user.id === currentUserId}"
        >
          <view class="rank-number">
            <text>{{ index + (leaderboard.length >= 3 ? 4 : 1) }}</text>
          </view>
          
          <view class="user-avatar">
            <text>{{ getInitials(user.username) }}</text>
          </view>
          
          <view class="user-info">
            <text class="username">{{ user.username }}</text>
            <text class="school" v-if="user.school">{{ user.school }}</text>
          </view>
          
          <view class="user-stats">
            <view class="stat-badge">
              <text class="stat-icon">🔥</text>
              <text class="stat-value">{{ user.check_in_days || 0 }}天</text>
            </view>
            <view class="stat-badge">
              <text class="stat-icon">📚</text>
              <text class="stat-value">{{ user.total_exercises || 0 }}题</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="leaderboard.length === 0">
          <view class="empty-icon">📊</view>
          <text class="empty-text">暂无排行数据</text>
          <text class="empty-subtext">开始练习，登上排行榜吧！</text>
        </view>
      </view>
    </view>

    <!-- 激励提示 -->
    <view class="motivation-card">
      <view class="motivation-icon">💪</view>
      <view class="motivation-content">
        <text class="motivation-title">坚持就是胜利！</text>
        <text class="motivation-text">每天练习15分钟，你也能登上榜首</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast, showLoading, hideLoading } from '@/utils/common.js'

export default {
  data() {
    return {
      tabs: [
        { value: 'week', label: '周榜' },
        { value: 'month', label: '月榜' },
        { value: 'all', label: '总榜' }
      ],
      activeTab: 'week',
      leaderboard: [],
      currentUserId: null
    }
  },
  onShow() {
    const token = uni.getStorageSync('token')
    const userInfo = uni.getStorageSync('userInfo')
    
    if (!token) {
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    
    this.currentUserId = userInfo?.id
    this.loadLeaderboard()
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.loadLeaderboard()
    },
    async loadLeaderboard() {
      showLoading('加载中...')

      try {
        const res = await api.getLeaderboard(this.activeTab)
        hideLoading()

        if (res.success) {
          this.leaderboard = res.leaderboard || []
        }
      } catch (error) {
        hideLoading()
        showToast('加载失败')
      }
    },
    getInitials(username) {
      if (!username) return '?'
      return username.charAt(0).toUpperCase()
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

/* Tab切换 */
.tab-section {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  position: relative;
  transition: all 0.3s;
}

.tab-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active .tab-label {
  color: #667eea;
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
  transition: all 0.3s;
}

.tab-item.active .tab-underline {
  width: 60rpx;
}

/* 奖台区域 */
.podium-section {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 50rpx;
  padding: 0 20rpx;
}

.podium-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 20rpx;
  border-radius: 20rpx;
  position: relative;
}

.podium-item.first {
  background: linear-gradient(135deg, #ffd700 0%, #fbb034 100%);
  order: 2;
  margin-bottom: -20rpx;
}

.podium-item.second {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  order: 1;
}

.podium-item.third {
  background: linear-gradient(135deg, #cd7f32 0%, #e8b880 100%);
  order: 3;
}

.podium-rank {
  font-size: 40rpx;
  margin-bottom: 20rpx;
}

.podium-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.podium-avatar.champion {
  width: 140rpx;
  height: 140rpx;
}

.podium-avatar text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}

.podium-name {
  display: block;
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.podium-score {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 排名列表 */
.rank-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 30rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.3s;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item.current-user {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f3ff 100%);
  margin: 0 -30rpx;
  padding: 24rpx 30rpx;
  border-radius: 12rpx;
  border: 2rpx solid #bae7ff;
}

.rank-number {
  width: 60rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
  margin-right: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.user-avatar text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.school {
  display: block;
  font-size: 22rpx;
  color: #999;
}

.user-stats {
  display: flex;
  gap: 16rpx;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #f8f9fa;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.stat-icon {
  font-size: 20rpx;
}

.stat-value {
  font-size: 22rpx;
  color: #666;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  display: block;
  font-size: 32rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.empty-subtext {
  display: block;
  font-size: 26rpx;
  color: #ccc;
}

/* 激励卡片 */
.motivation-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  color: #fff;
}

.motivation-icon {
  font-size: 48rpx;
}

.motivation-content {
  flex: 1;
}

.motivation-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.motivation-text {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}
</style>