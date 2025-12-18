<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    // 初始化全局配置
    this.initApp()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    async initApp() {
      // 不在这里做登录检查，让各个页面自己处理
      await this.checkForUpdates()
    },
    async checkForUpdates() {
      try {
        const baseInfo = uni.getAppBaseInfo ? uni.getAppBaseInfo() : {}
        const versionCode = Number(baseInfo.appVersionCode || 0)

        const api = require('./utils/api.js').default
        const res = await api.checkAppVersion(versionCode)

        if (!res.isLatest && res.latestVersion) {
          uni.setStorageSync('pendingUpdate', res.latestVersion)
          uni.reLaunch({
            url: '/pages/update/update'
          })
        }
      } catch (error) {
        console.error('版本检查失败:', error)
      }
    }
  }
}
</script>

<style>
/* 全局样式 */
@import url('./static/css/common.css');
</style>
