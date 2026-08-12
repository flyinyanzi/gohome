# 七夕小家 V1 原型

这是第一版可运行原型：
- 一个 HTML 应用承载玄关 + 家的总览 + 六个房间
- CSS / JS 分离
- 小纸条、愿望、梦境使用 IndexedDB 存在浏览器本机
- 书房保留技能五子棋 / 读心术入口
- 当前首页使用第一张统一手绘风视觉概念图
- 房间内先以交互骨架为主，下一步可逐间替换成独立手绘背景与透明物件素材

本地运行建议：
不要直接双击 index.html。用一个静态服务器启动，例如：
python3 -m http.server 8000
然后浏览器打开 http://localhost:8000/qixi_home_v1/

目录：
index.html
css/
js/
assets/images/
games/gomoku/
games/mind-reader/
