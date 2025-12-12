<template>
  <view class="search-container">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索单词原型或变位形式..."
          @input="onSearchInput"
          @confirm="performSearch"
          focus
        />
        <text v-if="searchKeyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索结果 -->
    <view v-if="showSearchResults" class="search-results">
      <!-- 精确匹配结果 -->
      <view v-if="searchResults.exactMatches.length > 0" class="results-section">
        <view class="section-title">精确匹配</view>
        <view 
          v-for="verb in searchResults.exactMatches" 
          :key="'exact-' + verb.id"
          class="result-item"
          @click="viewVerbDetail(verb.id)"
        >
          <view class="result-header">
            <text class="verb-infinitive">{{ verb.infinitive }}</text>
            <text v-if="verb.isIrregular" class="irregular-badge">不规则</text>
          </view>
          <text class="verb-meaning">{{ verb.meaning }}</text>
          <view class="verb-meta">
            <text class="meta-item">{{ verb.conjugationType }}</text>
          </view>
        </view>
      </view>

      <!-- 模糊匹配结果 -->
      <view v-if="searchResults.fuzzyMatches.length > 0" class="results-section">
        <view class="section-title">
          <text>你想检索的单词还可能是：</text>
        </view>
        <view 
          v-for="verb in searchResults.fuzzyMatches" 
          :key="'fuzzy-' + verb.id"
          class="result-item fuzzy-item"
          @click="viewVerbDetail(verb.id)"
        >
          <view class="result-header">
            <text class="verb-infinitive">{{ verb.infinitive }}</text>
            <text v-if="verb.isIrregular" class="irregular-badge">不规则</text>
          </view>
          <text class="verb-meaning">{{ verb.meaning }}</text>
          <view class="verb-meta">
            <text class="meta-item">{{ verb.conjugationType }}</text>
          </view>
        </view>
      </view>

      <!-- 无结果 -->
      <view v-if="searchResults.exactMatches.length === 0 && searchResults.fuzzyMatches.length === 0" class="no-results">
        <text class="no-results-icon">🔍</text>
        <text class="no-results-text">未找到匹配的单词</text>
        <text class="no-results-hint">试试其他关键词或检查拼写</text>
      </view>
    </view>

    <!-- 搜索提示 -->
    <view v-if="!showSearchResults && !searchKeyword" class="search-tips">
      <view class="tip-item">
        <text class="tip-icon">💡</text>
        <text class="tip-text">输入动词原型，如 "hablar"</text>
      </view>
      <view class="tip-item">
        <text class="tip-icon">💡</text>
        <text class="tip-text">输入变位形式，如 "hablé"</text>
      </view>
      <view class="tip-item">
        <text class="tip-icon">💡</text>
        <text class="tip-text">支持模糊搜索和拼写容错</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'
import { showToast } from '@/utils/common'

export default {
  data() {
    return {
      searchKeyword: '',
      showSearchResults: false,
      searchResults: {
        exactMatches: [],
        fuzzyMatches: []
      },
      searchTimer: null
    }
  },

  methods: {
    // 搜索输入处理（带防抖）
    onSearchInput() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      
      if (!this.searchKeyword || this.searchKeyword.trim().length < 2) {
        this.showSearchResults = false
        return
      }
      
      this.searchTimer = setTimeout(() => {
        this.performSearch()
      }, 300)
    },

    // 执行搜索
    async performSearch() {
      const keyword = this.searchKeyword.trim()
      
      if (keyword.length < 2) {
        showToast('请输入至少2个字符', 'none')
        return
      }

      try {
        const res = await api.searchVerbs(keyword)
        if (res.success) {
          this.searchResults = {
            exactMatches: res.exactMatches || [],
            fuzzyMatches: res.fuzzyMatches || []
          }
          this.showSearchResults = true
        }
      } catch (error) {
        console.error('搜索失败:', error)
        showToast('搜索失败', 'none')
      }
    },

    // 清空搜索
    clearSearch() {
      this.searchKeyword = ''
      this.showSearchResults = false
      this.searchResults = {
        exactMatches: [],
        fuzzyMatches: []
      }
    },

    // 查看动词详情
    viewVerbDetail(verbId) {
      uni.navigateTo({
        url: `/pages/conjugation-detail/conjugation-detail?verbId=${verbId}`
      })
    },

    // 返回
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.search-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: white;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  margin-right: 20rpx;
  transition: all 0.3s;
}

.search-box:focus-within {
  background: white;
  box-shadow: 0 0 0 2rpx #667eea;
}

.search-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  padding: 10rpx;
  color: #999;
  font-size: 32rpx;
  font-weight: bold;
}

.cancel-btn {
  font-size: 28rpx;
  color: #667eea;
  padding: 10rpx 20rpx;
}

/* 搜索结果 */
.search-results {
  padding: 20rpx 0;
}

.results-section {
  background: white;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 25rpx;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.result-item {
  padding: 30rpx 20rpx;
  background: #f9fafb;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item:active {
  background: #f0f2f5;
  transform: scale(0.98);
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.verb-infinitive {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-right: 15rpx;
}

.irregular-badge {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  font-size: 20rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.verb-meaning {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  display: block;
}

.verb-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
  background: white;
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
}

.fuzzy-item {
  opacity: 0.9;
}

/* 无结果 */
.no-results {
  text-align: center;
  padding: 100rpx 60rpx;
}

.no-results-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.no-results-text {
  font-size: 32rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.no-results-hint {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 搜索提示 */
.search-tips {
  padding: 60rpx 50rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tip-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.tip-text {
  font-size: 28rpx;
  color: #666;
}
</style>
