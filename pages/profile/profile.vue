<!-- <template>
  <view class="container">
    <view class="card profile-header">
      <view class="avatar">
        <text class="avatar-text">{{ avatarText }}</text>
      </view>
      <text class="username">{{ userInfo && userInfo.username }}</text>
      <text class="user-type">{{ userTypeText }}</text>
    </view>

    <view class="card user-info-card">
      <text class="subtitle">个人信息</text>
      <view class="info-list">
        <view class="info-item" v-if="userInfo && userInfo.email">
          <text class="info-label">邮箱</text>
          <text class="info-value">{{ userInfo.email }}</text>
        </view>
        <view class="info-item" v-if="userInfo && userInfo.school">
          <text class="info-label">学校</text>
          <text class="info-value">{{ userInfo.school }}</text>
        </view>
        <view class="info-item" v-if="userInfo && userInfo.enrollmentYear">
          <text class="info-label">入学年份</text>
          <text class="info-value">{{ userInfo.enrollmentYear }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">注册时间</text>
          <text class="info-value">{{ registerDate }}</text>
        </view>
      </view>
    </view>

    <view class="card subscription-card" v-if="userInfo && userInfo.userType === 'public'">
      <text class="subtitle">订阅信息</text>
      <view class="subscription-info">
        <text v-if="isSubscriptionValid" class="subscription-status valid">
          订阅有效期至：{{ subscriptionEndDate }}
        </text>
        <text v-else class="subscription-status invalid">
          订阅已过期，请续费
        </text>
        <button class="btn-primary mt-20" @click="renewSubscription">续费订阅 ¥38/年</button>
      </view>
    </view>

    <view class="card actions-card">
      <view class="action-item" @click="editProfile">
        <text class="action-label">编辑个人信息</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="aboutApp">
        <text class="action-label">关于应用</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="logout">
        <text class="action-label logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast, showConfirm, formatDate } from '@/utils/common.js'

export default {
  data() {
    return {
      userInfo: null
    }
  },
  computed: {
    avatarText() {
      if (!this.userInfo || !this.userInfo.username) return ''
      return this.userInfo.username.charAt(0).toUpperCase()
    },
    userTypeText() {
      if (!this.userInfo || !this.userInfo.userType) return ''
      return this.userInfo.userType === 'student' ? '学生用户（免费）' : '社会用户'
    },
    registerDate() {
      if (!this.userInfo || !this.userInfo.created_at) return ''
      return formatDate(this.userInfo.created_at, 'YYYY-MM-DD')
    },
    subscriptionEndDate() {
      if (!this.userInfo || !this.userInfo.subscriptionEndDate) return ''
      return formatDate(this.userInfo.subscriptionEndDate, 'YYYY-MM-DD')
    },
    isSubscriptionValid() {
      if (!this.userInfo || !this.userInfo.subscriptionEndDate) return false
      return new Date(this.userInfo.subscriptionEndDate) > new Date()
    }
  },
  onShow() {
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (!token) {
      // 未登录，跳转到登录页
      uni.reLaunch({
        url: '/pages/login/login'
      })
      return
    }
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      const localUserInfo = uni.getStorageSync('userInfo')
      if (localUserInfo) {
        this.userInfo = localUserInfo
      }

      try {
        const res = await api.getUserInfo()
        if (res.success) {
          this.userInfo = res.user
          uni.setStorageSync('userInfo', res.user)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    editProfile() {
      uni.showModal({
        title: '提示',
        content: '编辑功能开发中...',
        showCancel: false
      })
    },
    renewSubscription() {
      uni.showModal({
        title: '续费订阅',
        content: '支付功能开发中，敬请期待',
        showCancel: false
      })
    },
    aboutApp() {
      uni.showModal({
        title: '关于应用',
        content: '西班牙语动词变位练习APP v1.0.0\n\n帮助学生轻松掌握西班牙语动词变位',
        showCancel: false
      })
    },
    async logout() {
      try {
        await showConfirm('确定要退出登录吗？')
        
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        showToast('已退出登录', 'success')
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1000)
      } catch (error) {
        // 用户取消
      }
    }
  }
}
</script>

<style scoped>
.profile-header {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 60rpx 30rpx;
}

.avatar {
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

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
}

.username {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.user-type {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}

.info-list {
  margin-top: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #999;
}

.info-value {
  font-size: 28rpx;
  color: #333;
}

.subscription-info {
  margin-top: 20rpx;
}

.subscription-status {
  display: block;
  text-align: center;
  font-size: 28rpx;
  padding: 20rpx;
  border-radius: 12rpx;
}

.subscription-status.valid {
  background: #f6ffed;
  color: #52c41a;
}

.subscription-status.invalid {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.action-item:last-child {
  border-bottom: none;
}

.action-label {
  font-size: 28rpx;
  color: #333;
}

.logout-text {
  color: #ff4d4f;
}

.action-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style> -->








<template>
  <view class="container">
    <!-- 用户信息头部 -->
    <view class="profile-header">
      <view class="background-cover"></view>
      <view class="user-main">
        <view class="avatar-section">
          <view class="avatar-large">
            <text class="avatar-text">{{ avatarText }}</text>
          </view>
          <view class="user-badge" v-if="userInfo && userInfo.userType === 'student'">
            <text class="badge-text">学生认证</text>
          </view>
        </view>
        
        <view class="user-details">
          <text class="username">{{ userInfo && userInfo.username }}</text>
          <text class="user-type">{{ userTypeText }}</text>
          <text class="join-date">加入于 {{ registerDate }}</text>
        </view>
      </view>
    </view>

    <!-- 订阅信息 -->
    <view class="subscription-card" v-if="userInfo && userInfo.userType === 'public'">
      <view class="subscription-header">
        <text class="subscription-title">订阅状态</text>
        <view 
          :class="['status-badge', isSubscriptionValid ? 'active' : 'expired']"
        >
          <text>{{ isSubscriptionValid ? '有效' : '已过期' }}</text>
        </view>
      </view>
      
      <view class="subscription-content">
        <text class="subscription-text" v-if="isSubscriptionValid">
          有效期至 {{ subscriptionEndDate }}
        </text>
        <text class="subscription-text expired" v-else>
          订阅已过期
        </text>
        
        <button class="renew-btn" @click="renewSubscription">
          <text class="btn-icon">🔄</text>
          <text>续费订阅</text>
          <text class="price-tag">¥38/年</text>
        </button>
      </view>
    </view>

    <!-- 个人信息卡片 -->
    <view class="info-card">
      <view class="card-header">
        <text class="card-title">个人信息</text>
        <text class="edit-btn" @click="editProfile">编辑</text>
      </view>
      
      <view class="info-list">
        <view class="info-item" v-if="userInfo && userInfo.email">
          <view class="info-icon">📧</view>
          <view class="info-content">
            <text class="info-label">邮箱</text>
            <text class="info-value">{{ userInfo.email }}</text>
          </view>
        </view>
        
        <view class="info-item" v-if="userInfo && userInfo.school">
          <view class="info-icon">🏫</view>
          <view class="info-content">
            <text class="info-label">学校</text>
            <text class="info-value">{{ userInfo.school }}</text>
          </view>
        </view>
        
        <view class="info-item" v-if="userInfo && userInfo.enrollmentYear">
          <view class="info-icon">🎓</view>
          <view class="info-content">
            <text class="info-label">入学年份</text>
            <text class="info-value">{{ userInfo.enrollmentYear }}</text>
          </view>
        </view>
        
        <view class="info-item">
          <view class="info-icon">🆔</view>
          <view class="info-content">
            <text class="info-label">用户ID</text>
            <text class="info-value">{{ userInfo && userInfo.id }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-section">
        <text class="section-title">应用设置</text>
        
        <view class="menu-list">
          <view class="menu-item" @click="notificationSettings">
            <view class="menu-icon">🔔</view>
            <text class="menu-label">通知设置</text>
            <text class="menu-arrow">›</text>
          </view>
          
          <view class="menu-item" @click="privacySettings">
            <view class="menu-icon">🔒</view>
            <text class="menu-label">隐私设置</text>
            <text class="menu-arrow">›</text>
          </view>
          
          <view class="menu-item" @click="clearCache">
            <view class="menu-icon">🧹</view>
            <text class="menu-label">清理缓存</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
      
      <view class="menu-section">
        <text class="section-title">关于</text>
        
        <view class="menu-list">
          <view class="menu-item" @click="aboutApp">
            <view class="menu-icon">ℹ️</view>
            <text class="menu-label">关于应用</text>
            <text class="menu-arrow">›</text>
          </view>
          
          <view class="menu-item" @click="feedback">
            <view class="menu-icon">💬</view>
            <text class="menu-label">意见反馈</text>
            <text class="menu-arrow">›</text>
          </view>
          
          <view class="menu-item" @click="shareApp">
            <view class="menu-icon">📤</view>
            <text class="menu-label">分享应用</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="logout">
        <text class="logout-icon">🚪</text>
        <text>退出登录</text>
      </button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text class="version-text">西语动词变位 v1.0.0</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import { showToast, showConfirm, formatDate } from '@/utils/common.js'

export default {
  data() {
    return {
      userInfo: null
    }
  },
  computed: {
    avatarText() {
      if (!this.userInfo || !this.userInfo.username) return '?'
      return this.userInfo.username.charAt(0).toUpperCase()
    },
    userTypeText() {
      if (!this.userInfo || !this.userInfo.userType) return ''
      return this.userInfo.userType === 'student' ? '学生用户' : '社会用户'
    },
    registerDate() {
      if (!this.userInfo || !this.userInfo.created_at) return ''
      return formatDate(this.userInfo.created_at, 'YYYY-MM-DD')
    },
    subscriptionEndDate() {
      if (!this.userInfo || !this.userInfo.subscriptionEndDate) return ''
      return formatDate(this.userInfo.subscriptionEndDate, 'YYYY-MM-DD')
    },
    isSubscriptionValid() {
      if (!this.userInfo || !this.userInfo.subscriptionEndDate) return false
      return new Date(this.userInfo.subscriptionEndDate) > new Date()
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
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      const localUserInfo = uni.getStorageSync('userInfo')
      if (localUserInfo) {
        this.userInfo = localUserInfo
      }

      try {
        const res = await api.getUserInfo()
        if (res.success) {
          this.userInfo = res.user
          uni.setStorageSync('userInfo', res.user)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    editProfile() {
      uni.showModal({
        title: '编辑个人信息',
        content: '该功能正在开发中，敬请期待',
        showCancel: false
      })
    },
    renewSubscription() {
      uni.showModal({
        title: '续费订阅',
        content: '支付功能开发中，即将上线',
        showCancel: false
      })
    },
    notificationSettings() {
      uni.showToast({
        title: '通知设置',
        icon: 'none'
      })
    },
    privacySettings() {
      uni.showToast({
        title: '隐私设置',
        icon: 'none'
      })
    },
    clearCache() {
      uni.showModal({
        title: '清理缓存',
        content: '确定要清理缓存数据吗？',
        success: (res) => {
          if (res.confirm) {
            showToast('缓存清理完成', 'success')
          }
        }
      })
    },
    aboutApp() {
      uni.showModal({
        title: '关于应用',
        content: '西班牙语动词变位练习APP v1.0.0\n\n专为西语学习者设计，帮助您轻松掌握动词变位规则。',
        showCancel: false
      })
    },
    feedback() {
      uni.showModal({
        title: '意见反馈',
        content: '感谢您的反馈！请发送邮件至: support@spanishapp.com',
        showCancel: false
      })
    },
    shareApp() {
      uni.showToast({
        title: '分享功能',
        icon: 'none'
      })
    },
    async logout() {
      try {
        await showConfirm('确定要退出登录吗？')
        
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        
        showToast('已退出登录', 'success')
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }, 1000)
      } catch (error) {
        // 用户取消
      }
    }
  }
}
</script>

<style scoped>
.container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 用户信息头部 */
.profile-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80rpx 40rpx 60rpx;
  margin-bottom: 30rpx;
}

.background-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.user-main {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 30rpx;
}

.avatar-section {
  position: relative;
}

.avatar-large {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
}

.user-badge {
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #ffd700;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  white-space: nowrap;
}

.badge-text {
  font-size: 20rpx;
  color: #333;
  font-weight: 600;
}

.user-details {
  flex: 1;
  color: #fff;
}

.username {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.user-type {
  display: block;
  font-size: 26rpx;
  opacity: 0.9;
  margin-bottom: 12rpx;
}

.join-date {
  display: block;
  font-size: 22rpx;
  opacity: 0.7;
}

/* 订阅卡片 */
.subscription-card {
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.subscription-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge.active {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.expired {
  background: #fff1f0;
  color: #ff4d4f;
}

.subscription-content {
  text-align: center;
}

.subscription-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 30rpx;
}

.subscription-text.expired {
  color: #ff4d4f;
}

.renew-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.price-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
}

/* 信息卡片 */
.info-card {
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.info-list {
  gap: 0;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
  width: 40rpx;
  text-align: center;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 4rpx;
}

.info-value {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 菜单卡片 */
.menu-card {
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.menu-section {
  margin-bottom: 40rpx;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.menu-list {
  gap: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.menu-item:active {
  background: #f8f9fa;
  border-radius: 12rpx;
  margin: 0 -20rpx;
  padding: 28rpx 20rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
  width: 40rpx;
  text-align: center;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 退出登录 */
.logout-section {
  padding: 0 30rpx;
  margin-bottom: 40rpx;
}

.logout-btn {
  background: #fff;
  color: #ff4d4f;
  border: 2rpx solid #ff4d4f;
  border-radius: 16rpx;
  padding: 28rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.logout-icon {
  font-size: 24rpx;
}

/* 版本信息 */
.version-info {
  text-align: center;
}

.version-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>