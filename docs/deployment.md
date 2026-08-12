# 部署到自有服务器

本博客是「前端 SPA + Express 服务端代理」结构。**部署到自有服务器**（而非 GitHub Pages）后，所有依赖服务端代理的功能才会完整可用：

| 功能 | GitHub Pages（纯静态） | 自有服务器 |
|------|:---:|:---:|
| 文章 / 主题 / lofi / 壁纸 | ✅ | ✅ |
| 右下角 B站卡 | ❌（自动隐藏） | ✅ |
| 右下角追番卡（Bangumi + AniList） | ❌（自动隐藏） | ✅ |
| Steam 状态卡 | ❌（自动隐藏） | ✅ |
| 网易云播放器 | ⚠️（部分） | ✅ |

## 1. 服务器前置

- **Linux VPS**（推荐 Ubuntu 22.04+），1 核 1G 起步即可
- **Node.js 20+**（含 `npm`）
- 一个**域名**（可选，但强烈推荐，用于 HTTPS）

安装 Node 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # 应 ≥ 20.x
```

## 2. 拉取代码并安装

```bash
git clone https://github.com/Kita-kirakiradokidoki/mikudayo-kirakiradokidoki.git
cd mikudayo-kirakiradokidoki
npm ci
```

## 3. 配置 `.env`

复制 `.env.example` 为 `.env`（若不存在），填入密钥。密钥**只存在服务端**，不会打进前端 bundle：

```bash
# Steam 状态卡必需（申请：https://steamcommunity.com/dev/apikey）
STEAM_API_KEY=你的key

# 网易云高清音质（可选，登录网易云网页版后复制完整 cookie）
NETEASE_COOKIE=你的网易云cookie

# B站最近投稿（可选，无此项时 B站卡隐藏投稿列表但其余正常）
# 获取：浏览器登录 bilibili.com → 开发者工具 → Application → Cookies → 复制 SESSDATA=...; bili_jct=...
BILI_COOKIE=SESSDATA=xxx; bili_jct=xxx

# ── 数据墙账号身份 ───────────────────────────────
# B站 UID（space.bilibili.com/546195 → 546195）
BILI_UID=你的B站UID
# Bangumi 用户名（bgm.tv/user/你的名字）
BANGUMI_USERNAME=你的Bangumi用户名
# AniList 用户名（anilist.co/user/你的名字）
ANILIST_USERNAME=你的AniList用户名
```

## 4. 配置站点

### 账号身份（`.env`，见第 3 节）

数据墙三源的身份放服务端 `.env`：`BILI_UID`、`BANGUMI_USERNAME`、`ANILIST_USERNAME`。
改账号只需改 `.env` 并重启服务，**不需要重新构建前端**。

### 站点开关（`src/site.config.ts`）

前端配置只控制开关与代理路径，不含账号：

- `steam.steamId` / `netease.uid` —— 仍在前端配置（SteamID 为公开信息）
- `bilibili.enabled` / `bangumi.enabled` / `anilist.enabled` —— 各浮动卡开关

> 未配置 `.env` 身份时，对应浮动卡自动隐藏（与 Steam 卡在无 key 时的行为一致）。

## 5. 构建并启动

```bash
npm run build
# 前台启动（测试）：
node server.js
```

访问 `http://你的服务器IP:3000/`，首页右下角应显示 B站 / 追番 / Steam 三张浮动卡（hover 展开）。

## 6. 用 PM2 常驻

```bash
sudo npm install -g pm2
pm2 start server.js --name nagi-blog
pm2 save
pm2 startup   # 按提示执行输出命令，开机自启
```

常用：`pm2 logs nagi-blog`、`pm2 restart nagi-blog`、`pm2 monit`。

## 7. Nginx 反向代理 + HTTPS

1. 把域名 A 记录解析到服务器 IP。
2. 安装 Nginx 与证书：

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

3. 新建 `/etc/nginx/sites-available/nagi-blog`：

```nginx
server {
    listen 80;
    server_name blog.example.com;   # 换成你的域名

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # 允许播放器/进度条等长连接
        proxy_read_timeout 300s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nagi-blog /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d blog.example.com   # 自动配 HTTPS
```

4. 若 `site.config.ts` 中 `apiBase` 需要指向完整域名，可改为 `https://blog.example.com/api/...`；默认 `'/'` 相对路径在同域部署下无需改动。

## 8. 上线验证清单

- [ ] 首页 200，文章可读，主题/语言切换正常
- [ ] 右下角显示 B站 / 追番 / Steam 浮动卡（与 Player / Lofi 同款交互）
- [ ] B站卡：配置了 `BILI_UID` → hover 展开显示头像/粉丝/视频数；未配置 → 卡自动隐藏
- [ ] 追番卡：配置了 `BANGUMI_USERNAME` / `ANILIST_USERNAME` → hover 展开显示统计；未配置 → 卡自动隐藏
- [ ] 配置了 `BILI_COOKIE` → B站卡显示最近投稿列表
- [ ] Steam 卡：在线状态与时长正常（不再是"代理未配置"）
- [ ] 网易云播放器可搜索/播放
- [ ] 单张卡故障不影响其他卡（可在某卡 `enabled` 置 false 验证）

## 常见问题

- **右下角某张卡不显示**：对应 `.env` 身份变量未设置（`BILI_UID` / `BANGUMI_USERNAME` / `ANILIST_USERNAME`），未配置时卡自动隐藏；填好后 `pm2 restart nagi-blog` 即可。
- **B站卡显示「代理未配置」**：站点没走 `server.js`（如仍部署在 Pages），或 `bilibili.enabled` 为 false。
- **Bangumi 卡超时**：服务器到 `api.bgm.tv` 网络不通。确认服务器可 `curl https://api.bgm.tv/v0/users/sai`（网关/防火墙是否放行）。
- **Steam 卡隐藏**：`STEAM_API_KEY` 未配置，或账号隐私为私密。
- **更新部署**：`git pull && npm run build && pm2 restart nagi-blog`；只改了 `.env` 账号 → `pm2 restart nagi-blog` 即可（无需重新构建）。
