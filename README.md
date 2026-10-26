# OHMU Launcher v0.1 — 手機互動原型

這是供 iPhone Safari / 電腦瀏覽器預覽的靜態網頁，並非 Android TV APK。

## 使用方式
1. 解壓縮 ZIP，保留 index.html、style.css、app.js 與 assets 資料夾。
2. 可在電腦直接開啟 index.html。
3. iPhone Safari 最穩定的方式是將整個資料夾部署到 GitHub Pages、Netlify 或其他 HTTPS 靜態網站後開啟網址。單獨點開 iOS「檔案」App 裡的 HTML 可能無法正常載入相對路徑資源。
4. iPhone 橫向使用，點選底部 App，左右滑動可切換。
5. 電腦鍵盤左右鍵切換，Enter 模擬啟動，Esc 進入沉浸模式。
6. 點右上角齒輪調整眼睛光效、霧氣及沉浸模式；可開啟「調整眼睛位置」，拖曳 12 個光點與底圖對齊。眼睛座標保存在目前瀏覽器的 localStorage。

## 已知限制
- 底圖來自已確認的王蟲腐海合成圖，原圖本身包含底部 App Dock；本版以深色漸層及互動 Dock 覆蓋，正式版需輸出乾淨無 UI 背景。
- 眼睛光點為初步座標，請在設定中依實際底圖微調。
- 網頁不能啟動 Sony 電視已安裝 App；此版僅模擬操作與動畫。
- iPhone 直向顯示會縮小；建議橫向全螢幕觀看。
- 為減少耗電，粒子畫面限制約 30fps；App Dock 使用 CSS 動畫。

## 檔案
- index.html：主介面
- style.css：版面與互動效果
- app.js：焦點、眼睛、孢子、沉浸模式與設定
- assets/ohmu-cave.png：背景

下一版：乾淨分層背景、精準 12 眼遮罩、原生 Android TV Launcher。
