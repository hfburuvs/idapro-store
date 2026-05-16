# iDaPro 部署指南（方案C - 预构建静态部署）

## 第一步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. Repository name 填 `idapro-store`（或其他你喜欢的名字）
3. 选择 **Public**
4. 不要勾选 "Add a README file"
5. 点击 **Create repository**

## 第二步：推送代码到 GitHub

```bash
# 进入导出目录
cd idapro-deploy

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "iDaPro v2.0 - React build"

# 关联远程仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/idapro-store.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

## 第三步：Vercel 部署配置

1. 打开 https://vercel.com/new
2. 导入你刚创建的 GitHub 仓库
3. 在配置页面：
   - **Framework Preset**: 选择 `Other`（不要选 Vite）
   - **Build Command**: 留空（不构建，直接托管）
   - **Output Directory**: 留空（使用根目录）
   - **Install Command**: 留空（不需要 npm install）
4. 点击 **Deploy**

> 等待约 30 秒，Vercel 会给你一个 `.vercel.app` 的域名。

## 第四步：配置 Supabase

> ⚠️ **这一步是必须的，否则网站无法正常工作！**

### 4.1 创建 Supabase 项目

1. 访问 https://supabase.com
2. 注册/登录后点击 **New Project**
3. 填写项目名 `idapro`，设置密码
4. 等待项目创建完成（约 1-2 分钟）

### 4.2 创建数据表

1. 进入项目 Dashboard → 左侧 **SQL Editor**
2. 点击 **New query**
3. 将以下 SQL 完整粘贴进去，点击 **Run**：

```sql
-- 分类表
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 品牌表
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 产品表
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  amazon_link TEXT NOT NULL,
  description TEXT DEFAULT '',
  features TEXT DEFAULT '',
  aplus_images TEXT DEFAULT '',
  category_id INTEGER,
  brand_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 留言表
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订阅表
CREATE TABLE subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  rating INTEGER DEFAULT 5,
  content TEXT NOT NULL,
  is_approved INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设置表
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 轮播图表
CREATE TABLE carousel (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  link TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 导航表
CREATE TABLE navigation (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  link TEXT NOT NULL,
  parent_id INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 首页内容表
CREATE TABLE home_content (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEO设置表
CREATE TABLE seo_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 统计代码表
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认设置
INSERT INTO settings (key, value) VALUES
('siteTitle', 'iDaPro'),
('metaKeywords', 'screen protector, tempered glass, camera accessories, watch accessories'),
('metaDescription', 'Premium screen protectors and accessories for cameras and smartwatches.'),
('heroTitle', 'Premium Protection for Your Devices'),
('heroSubtitle', 'High-quality screen protectors and accessories, delivered with Amazon Prime.'),
('contactEmail', 'iddadirect@126.com'),
('aboutContent', '')
ON CONFLICT DO NOTHING;

-- 插入示例分类
INSERT INTO categories (name, slug, sort_order) VALUES
('Screen Protectors', 'screen-protectors', 1),
('Camera Accessories', 'camera-accessories', 2),
('Watch Accessories', 'watch-accessories', 3),
('Charging Accessories', 'charging-accessories', 4)
ON CONFLICT DO NOTHING;

-- 启用 RLS（行级安全）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（开发阶段）
CREATE POLICY "Allow all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON carousel FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON navigation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON home_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON seo_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON analytics FOR ALL USING (true) WITH CHECK (true);
```

### 4.3 获取 API 密钥

1. 点击左侧 **Project Settings** → **API**
2. 复制以下两个值：
   - **Project URL**（如 `https://abcdefghijklmnop.supabase.co`）
   - **anon public** API key

### 4.4 修改 index.html

在 GitHub 上直接编辑 `index.html` 文件（点击文件 → 右上角铅笔图标），修改这 3 行：

```html
<script>
  window.__SUPABASE_URL__ = 'https://你的实际URL.supabase.co';
  window.__SUPABASE_KEY__ = '你的实际anon-key';
  window.__ADMIN_PASS__ = '你想设置的管理员密码';
</script>
```

修改后点击 **Commit changes**。

### 4.5 Vercel 自动重新部署

回到 Vercel Dashboard，你会看到自动触发了一次新的部署（因为 GitHub 有提交）。等待约 30 秒，部署完成后刷新网站即可。

## 第五步：绑定自定义域名（可选）

1. 在 Vercel Dashboard → 你的项目 → **Settings** → **Domains**
2. 输入你的域名（如 `www.idapro.com`）
3. 按照提示添加 DNS 记录（A 记录或 CNAME）
4. 等待 DNS 生效（通常几分钟到 48 小时）

## 第六步：Google Analytics（可选）

1. 访问 https://analytics.google.com 创建账号
2. 获取你的 **Measurement ID**（格式如 `G-XXXXXXXXXX`）
3. 登录网站后台 → **Analytics Code** 标签
4. 点击 **Add Code**，名称填 `Google Analytics`，代码内容填：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

5. 点击 Save，代码会自动注入到所有页面

## 后台登录地址

部署完成后，访问：
- 前台：`https://你的域名/` 或 `https://你的域名.vercel.app/`
- 后台：`https://你的域名/admin`
- 默认管理员密码：你在 `index.html` 中设置的 `__ADMIN_PASS__`

## 后续更新流程

当需要更新网站时：

1. 我会重新构建项目，生成新的 `dist` 文件
2. 你下载新的导出包，替换 GitHub 仓库中的所有文件
3. Vercel 会自动重新部署

```bash
# 快速更新脚本
cd idapro-deploy
git add .
git commit -m "Update to latest version"
git push origin main
```

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 网站入口，包含 Supabase 配置 |
| `assets/` | React 构建后的 JS 和 CSS |
| `_worker.js` | Cloudflare Workers 后端（暂未使用，保留备用） |
| `vercel.json` | Vercel 路由重写配置 |
| `placeholder.png` | 占位图片 |
| `products/` | 产品图片目录 |
