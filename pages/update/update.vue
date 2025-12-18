<template>
  <view class="container">
    <view class="card">
      <view class="header">
        <view>
          <text class="title">发现新版本 {{ updateInfo.versionName }}</text>
          <text class="version">版本号：{{ updateInfo.versionCode }}</text>
        </view>
        <view class="badge">必更新</view>
      </view>

      <view class="section">
        <view class="section-title">更新内容</view>
        <view class="notes">{{ updateInfo.releaseNotes || '暂无更新说明' }}</view>
      </view>

      <view class="section stats">
        <view class="stat-item">
          <text class="stat-label">安装包大小</text>
          <text class="stat-value">{{ formatSize(updateInfo.packageSize) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">文件名</text>
          <text class="stat-value">{{ updateInfo.packageFileName || 'app-release.apk' }}</text>
        </view>
      </view>

      <view class="progress" v-if="downloading">
        <view class="progress-bar">
          <view class="progress-inner" :style="{ width: progress + '%' }"></view>
        </view>
        <view class="progress-info">
          <text>{{ progress.toFixed(0) }}%</text>
          <text>{{ formatSize(downloadedBytes) }} / {{ formatSize(totalBytes || updateInfo.packageSize) }}</text>
        </view>
      </view>

      <view class="actions">
        <button class="primary" type="primary" :loading="downloading" @click="startDownload" :disabled="downloading || !updateInfo.packageUrl">
          {{ downloading ? '正在下载...' : '立即更新并安装' }}
        </button>
      </view>

      <view class="tips">
        <text>为确保正常使用，请先完成最新版本安装。</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '../../utils/api.js'

export default {
  data() {
    return {
      updateInfo: {
        versionCode: '',
        versionName: '',
        releaseNotes: '',
        packageSize: 0,
        packageUrl: '',
        packageFileName: ''
      },
      downloading: false,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      downloadTask: null
    }
  },
  onShow() {
    this.loadUpdateInfo()
  },
  methods: {
    loadUpdateInfo() {
      const info = uni.getStorageSync('pendingUpdate')
      if (info && info.packageUrl) {
        this.updateInfo = info
      } else {
        this.fetchLatestVersion()
      }
    },
    async fetchLatestVersion() {
      try {
        const baseInfo = uni.getAppBaseInfo ? uni.getAppBaseInfo() : {}
        const currentVersionCode = Number(baseInfo.appVersionCode || 0)
        const res = await api.checkAppVersion(currentVersionCode)
        if (res.latestVersion) {
          this.updateInfo = res.latestVersion
          uni.setStorageSync('pendingUpdate', res.latestVersion)
        }
      } catch (error) {
        uni.showToast({ title: '检查更新失败，请重试', icon: 'none' })
      }
    },
    formatSize(size) {
      if (!size) return '未知'
      const units = ['B', 'KB', 'MB', 'GB']
      let index = 0
      let currentSize = size
      while (currentSize >= 1024 && index < units.length - 1) {
        currentSize /= 1024
        index++
      }
      return `${currentSize.toFixed(1)} ${units[index]}`
    },
    startDownload() {
      if (!this.updateInfo.packageUrl || this.downloading) return
      this.downloading = true
      this.progress = 0
      this.downloadedBytes = 0
      this.totalBytes = 0

      this.downloadTask = uni.downloadFile({
        url: this.updateInfo.packageUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            this.installPackage(res.tempFilePath)
          } else {
            uni.showToast({ title: '下载失败，请稍后重试', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '下载失败，请检查网络', icon: 'none' })
        },
        complete: () => {
          this.downloading = false
          this.downloadTask = null
        }
      })

      if (this.downloadTask && this.downloadTask.onProgressUpdate) {
        this.downloadTask.onProgressUpdate((res) => {
          this.progress = res.progress
          this.downloadedBytes = res.totalBytesWritten
          this.totalBytes = res.totalBytesExpectedToWrite
        })
      }
    },
    installPackage(filePath) {
      // #ifdef APP-PLUS
      plus.runtime.install(
        filePath,
        { force: true },
        () => {
          uni.showModal({
            title: '更新完成',
            content: '安装完成，应用将重启。',
            showCancel: false,
            success: () => {
              plus.runtime.restart()
            }
          })
        },
        (error) => {
          uni.showModal({
            title: '安装失败',
            content: `请手动安装，错误码：${error.code}`,
            showCancel: false
          })
        }
      )
      // #endif

      // #ifndef APP-PLUS
      uni.showToast({ title: '当前平台仅支持下载，请手动安装', icon: 'none' })
      // #endif
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 30rpx;
}

.card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
  margin-top: 30rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.version {
  display: block;
  margin-top: 8rpx;
  color: #888;
  font-size: 26rpx;
}

.badge {
  background-color: #f97316;
  color: #fff;
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.section {
  margin-top: 28rpx;
}

.section-title {
  color: #555;
  font-weight: 600;
  font-size: 28rpx;
  margin-bottom: 12rpx;
}

.notes {
  background-color: #f7f7fb;
  padding: 20rpx;
  border-radius: 16rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.stat-item {
  flex: 1;
  background-color: #f8fafc;
  padding: 20rpx;
  border-radius: 16rpx;
}

.stat-label {
  color: #888;
  font-size: 24rpx;
}

.stat-value {
  display: block;
  margin-top: 6rpx;
  color: #111;
  font-weight: 600;
}

.progress {
  margin-top: 24rpx;
}

.progress-bar {
  width: 100%;
  height: 16rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #5b8def);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
  color: #666;
  font-size: 24rpx;
}

.actions {
  margin-top: 28rpx;
}

.primary {
  background: linear-gradient(90deg, #667eea, #5b8def);
  border: none;
  color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 12rpx 24rpx rgba(102, 126, 234, 0.35);
}

.tips {
  margin-top: 16rpx;
  color: #999;
  font-size: 24rpx;
  text-align: center;
}
</style>
