const express = require('express')
const fs = require('fs')
const path = require('path')

const router = express.Router()

const VERSION_FILE = path.join(__dirname, '..', 'data', 'version.json')
const UPDATE_DIR = path.join(__dirname, '..', 'updates')

const loadVersionInfo = () => {
  const fileContent = fs.readFileSync(VERSION_FILE, 'utf-8')
  return JSON.parse(fileContent)
}

const getPackageInfo = (fileName) => {
  if (!fileName) return { filePath: null, size: 0 }

  const filePath = path.join(UPDATE_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    return { filePath: null, size: 0 }
  }

  const stats = fs.statSync(filePath)
  return { filePath, size: stats.size }
}

router.get('/check', (req, res) => {
  try {
    const clientVersion = Number(req.query.versionCode || 0)
    if (!clientVersion) {
      return res.status(400).json({ error: '缺少 versionCode 参数' })
    }

    const versionInfo = loadVersionInfo()
    const { filePath, size } = getPackageInfo(versionInfo.packageFileName)

    const isLatest = clientVersion >= Number(versionInfo.versionCode)
    const baseUrl = `${req.protocol}://${req.get('host')}`
    const packageUrl = versionInfo.downloadUrl || `${baseUrl}/api/version/download`

    res.json({
      isLatest,
      updateRequired: !isLatest,
      latestVersion: {
        versionCode: Number(versionInfo.versionCode),
        versionName: versionInfo.versionName,
        releaseNotes: versionInfo.releaseNotes || '',
        packageFileName: versionInfo.packageFileName,
        packageUrl,
        packageSize: size,
        packageAvailable: Boolean(filePath)
      }
    })
  } catch (error) {
    console.error('版本检查失败:', error)
    res.status(500).json({ error: '版本检查失败' })
  }
})

router.get('/download', (req, res) => {
  try {
    const versionInfo = loadVersionInfo()
    const { filePath } = getPackageInfo(versionInfo.packageFileName)

    if (!filePath) {
      return res.status(404).json({ error: '安装包不存在，请联系管理员' })
    }

    res.download(filePath, versionInfo.packageFileName)
  } catch (error) {
    console.error('下载失败:', error)
    res.status(500).json({ error: '下载失败，请稍后重试' })
  }
})

module.exports = router
