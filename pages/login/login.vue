<!-- <template>
  <view class="container">
    <view class="login-header">
      <text class="logo">西语动词变位</text>
      <text class="slogan">让学习变得更简单</text>
    </view>

    <view class="card login-card">
      <view class="tab-header">
        <view :class="['tab-item', isLogin ? 'active' : '']" @click="switchTab(true)">
          <text>登录</text>
        </view>
        <view :class="['tab-item', !isLogin ? 'active' : '']" @click="switchTab(false)">
          <text>注册</text>
        </view>
      </view>

      <view class="form-container">
        <view class="form-item">
          <text class="label">用户名</text>
          <input class="input" v-model="formData.username" placeholder="请输入用户名" />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input class="input" type="password" v-model="formData.password" placeholder="请输入密码" />
        </view>

        <view v-if="!isLogin">
          <view class="form-item">
            <text class="label">邮箱</text>
            <input class="input" v-model="formData.email" placeholder="请输入邮箱（选填）" />
          </view>

          <view class="form-item">
            <text class="label">学校</text>
            <input class="input" v-model="formData.school" placeholder="请输入学校（选填）" />
          </view>

          <view class="form-item">
            <text class="label">入学年份</text>
            <input class="input" type="number" v-model="formData.enrollmentYear" placeholder="请输入入学年份（选填）" />
          </view>

          <view class="form-item">
            <text class="label">用户类型</text>
            <picker @change="onUserTypeChange" :value="userTypeIndex" :range="userTypes" range-key="label">
              <view class="picker">
                {{ userTypes[userTypeIndex].label }}
              </view>
            </picker>
          </view>
        </view>

        <button class="btn-primary mt-20" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </button>

        <view class="tips mt-20">
          <text class="tip-text" v-if="isLogin">学生用户免费使用教材内容</text>
          <text class="tip-text" v-else>社会人士 ¥38/年，享受全部功能</text>
        </view>
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
      isLogin: true,
      formData: {
        username: '',
        password: '',
        email: '',
        school: '',
        enrollmentYear: '',
        userType: 'student'
      },
      userTypes: [
        { value: 'student', label: '学生' },
        { value: 'public', label: '社会人士' }
      ],
      userTypeIndex: 0
    }
  },
  methods: {
    switchTab(isLogin) {
      this.isLogin = isLogin
      this.formData = {
        username: '',
        password: '',
        email: '',
        school: '',
        enrollmentYear: '',
        userType: 'student'
      }
    },
    onUserTypeChange(e) {
      this.userTypeIndex = e.detail.value
      this.formData.userType = this.userTypes[e.detail.value].value
    },
    async handleSubmit() {
      if (!this.formData.username || !this.formData.password) {
        showToast('请填写用户名和密码')
        return
      }

      showLoading(this.isLogin ? '登录中...' : '注册中...')

      try {
        const apiMethod = this.isLogin ? api.login : api.register
        const res = await apiMethod(this.formData)

        hideLoading()

        if (res.success) {
          // 保存token和用户信息
          uni.setStorageSync('token', res.token)
          uni.setStorageSync('userInfo', res.user)

          showToast(this.isLogin ? '登录成功' : '注册成功', 'success')

          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1000)
        } else {
          showToast(res.error || '操作失败')
        }
      } catch (error) {
        hideLoading()
        showToast(error.error || '网络错误')
      }
    }
  }
}
</script>

<style scoped>
.login-header {
  text-align: center;
  padding: 100rpx 0 60rpx;
}

.logo {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20rpx;
}

.slogan {
  display: block;
  font-size: 28rpx;
  color: #999;
}

.login-card {
  padding: 0;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 32rpx;
  color: #999;
  position: relative;
}

.tab-item.active {
  color: #667eea;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

.form-container {
  padding: 30rpx;
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

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker {
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  line-height: 80rpx;
  font-size: 28rpx;
}

.tips {
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
}
</style> -->




<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
    </view>

    <!-- 主要内容 -->
    <view class="main-content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <view class="logo">
          <text class="logo-icon">📚</text>
        </view>
        <text class="app-name">西语动词变位</text>
        <text class="app-tagline">开启你的西语学习之旅</text>
      </view>

      <!-- 登录卡片 -->
      <view class="auth-card">
        <!-- Tab切换 -->
        <view class="tab-container">
          <view 
            v-for="tab in tabs" 
            :key="tab.value"
            :class="['tab-item', activeTab === tab.value ? 'active' : '']"
            @click="switchTab(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
            <view class="tab-indicator"></view>
          </view>
        </view>

        <!-- 表单区域 -->
        <view class="form-section">
          <view class="input-group">
            <view class="input-item">
              <view class="input-icon">👤</view>
              <input 
                class="form-input" 
                v-model="formData.username" 
                placeholder="请输入用户名"
                placeholder-class="placeholder"
              />
            </view>

            <view class="input-item">
              <view class="input-icon">🔒</view>
              <input 
                class="form-input" 
                type="password" 
                v-model="formData.password" 
                placeholder="请输入密码"
                placeholder-class="placeholder"
              />
            </view>

            <!-- 注册额外字段 -->
            <view v-if="!isLogin" class="extra-fields">
              <view class="input-item">
                <view class="input-icon">📧</view>
                <input 
                  class="form-input" 
                  v-model="formData.email" 
                  placeholder="邮箱（选填）"
                  placeholder-class="placeholder"
                />
              </view>

              <view class="input-item">
                <view class="input-icon">🏫</view>
                <input 
                  class="form-input" 
                  v-model="formData.school" 
                  placeholder="学校（选填）"
                  placeholder-class="placeholder"
                />
              </view>

              <view class="input-row">
                <view class="input-item" style="flex: 1;">
                  <view class="input-icon">🎓</view>
                  <input 
                    class="form-input" 
                    type="number" 
                    v-model="formData.enrollmentYear" 
                    placeholder="入学年份"
                    placeholder-class="placeholder"
                  />
                </view>
                
                <view class="input-item picker-item">
                  <picker 
                    @change="onUserTypeChange" 
                    :value="userTypeIndex" 
                    :range="userTypes" 
                    range-key="label"
                  >
                    <view class="picker-content">
                      <text class="picker-text">{{ userTypes[userTypeIndex].label }}</text>
                      <text class="picker-arrow">▼</text>
                    </view>
                  </picker>
                </view>
              </view>
            </view>
          </view>

          <!-- 提交按钮 -->
          <button class="submit-btn" @click="handleSubmit">
            <text class="btn-text">{{ isLogin ? '登录' : '注册' }}</text>
            <text class="btn-arrow">→</text>
          </button>

          <!-- 提示信息 -->
          <view class="tips-section">
            <text class="tip-text">
              {{ isLogin ? '学生用户免费使用全部功能' : '社会用户享专属高级功能' }}
            </text>
          </view>
        </view>
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
      isLogin: true,
      activeTab: 'login',
      tabs: [
        { value: 'login', label: '登录' },
        { value: 'register', label: '注册' }
      ],
      formData: {
        username: '',
        password: '',
        email: '',
        school: '',
        enrollmentYear: '',
        userType: 'student'
      },
      userTypes: [
        { value: 'student', label: '学生' },
        { value: 'public', label: '社会人士' }
      ],
      userTypeIndex: 0
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.isLogin = tab === 'login'
      this.formData = {
        username: '',
        password: '',
        email: '',
        school: '',
        enrollmentYear: '',
        userType: 'student'
      }
      this.userTypeIndex = 0
    },
    onUserTypeChange(e) {
      this.userTypeIndex = e.detail.value
      this.formData.userType = this.userTypes[e.detail.value].value
    },
    async handleSubmit() {
      if (!this.formData.username || !this.formData.password) {
        showToast('请填写用户名和密码')
        return
      }

      showLoading(this.isLogin ? '登录中...' : '注册中...')

      try {
        const apiMethod = this.isLogin ? api.login : api.register
        const res = await apiMethod(this.formData)

        hideLoading()

        if (res.success) {
          uni.setStorageSync('token', res.token)
          uni.setStorageSync('userInfo', res.user)

          showToast(this.isLogin ? '登录成功' : '注册成功', 'success')

          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          showToast(res.error || '操作失败')
        }
      } catch (error) {
        hideLoading()
        showToast(error.error || '网络错误')
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -150rpx;
  right: -150rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  bottom: -100rpx;
  left: -100rpx;
}

/* 主要内容 */
.main-content {
  position: relative;
  z-index: 2;
  padding: 60rpx 40rpx;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30rpx;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 56rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.app-tagline {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 认证卡片 */
.auth-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
}

/* Tab切换 */
.tab-container {
  display: flex;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 50rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #667eea;
}

.tab-text {
  font-size: 32rpx;
  font-weight: 600;
  position: relative;
  z-index: 2;
}

.tab-indicator {
  position: absolute;
  top: 8rpx;
  left: 8rpx;
  right: 8rpx;
  bottom: 8rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s;
}

.tab-item.active .tab-indicator {
  opacity: 1;
}

/* 表单区域 */
.input-group {
  margin-bottom: 60rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 24rpx;
  height: 100rpx;
  transition: all 0.3s;
}

.input-item:focus-within {
  background: #fff;
  box-shadow: 0 0 0 2rpx #667eea;
}

.input-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #666;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.input-row {
  display: flex;
  gap: 20rpx;
}

.picker-item {
  flex: 0.8;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-arrow {
  color: #999;
  font-size: 24rpx;
}

/* 提交按钮 */
.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
}

.btn-text {
  flex: 1;
  text-align: center;
}

.btn-arrow {
  font-size: 28rpx;
}

/* 提示区域 */
.tips-section {
  margin-top: 40rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
</style>