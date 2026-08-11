# 《信号漂流》部署与分享说明

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://127.0.0.1:5173/` 即可试玩。

## 临时公网分享

适合马上发给朋友试玩，不需要账号，也不需要同一 Wi-Fi。

1. 启动生产预览：

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

2. 另开一个终端启动 Cloudflare 临时隧道：

```bash
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:4173
```

3. 把输出中的 `https://xxx.trycloudflare.com` 链接发给朋友。

注意：
- 链接有效期内电脑必须保持开机，隧道进程不能关闭
- 链接每次启动都会变化
- 临时隧道没有稳定保障，长期使用请走下面的正式部署

## 永久部署

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "feat: 信号漂流可玩原型"
git branch -M main
git remote add origin https://github.com/你的用户名/信号漂流.git
git push -u origin main
```

### HTTPS 被重置时使用 SSH 443 推送

如果 `git push` 提示 `Connection was reset`，可以改用 SSH 443 端口：

```bash
git remote set-url origin ssh://git@ssh.github.com:443/你的用户名/仓库名.git
git push -u origin main
```

之后日常更新仍然使用 `git push`。

### 2. 在 Vercel 部署

1. 打开 [vercel.com](https://vercel.com) 并登录
2. 点击 New Project
3. 导入刚才的 GitHub 仓库
4. Framework Preset 选择 Vite
5. Build Command 保持 `npm run build`
6. Output Directory 填写 `dist`
7. 点击 Deploy

部署完成后会生成一个永久 HTTPS 链接。

### 3. 在 Netlify 部署

1. 打开 [netlify.com](https://netlify.com) 并登录
2. Add new site 后选择 Import from Git
3. 选择仓库，Build command 填 `npm run build`
4. Publish directory 填 `dist`
5. 点击 Deploy

### 4. 在 Cloudflare Pages 部署

1. 打开 [pages.cloudflare.com](https://pages.cloudflare.com) 并登录
2. Create project 后选择 Git 仓库
3. Framework preset 选择 Vite
4. Build command 填 `npm run build`
5. Build output directory 填 `dist`
6. 点击 Save and Deploy

## 手机端

游戏已适配手机：
- 虚拟摇杆在左下角
- 冲刺和脉冲按钮在右下角
- 每个玩家打开链接后，存档保存在各自手机的本地存储中

## 更新游戏

修改代码后重新提交并推送：

```bash
git add .
git commit -m "更新内容说明"
git push
```

接入 Vercel 等平台后，推送会自动触发重新部署。
