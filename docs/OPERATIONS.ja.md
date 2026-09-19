# Awesome Books Asia 運用マニュアル

> www.awesomebooks.asia · 2026年8月現在
> 対象：運用担当者（管理者アカウント保有者）

---

## 1. サービス概要

| 項目 | 内容 |
|---|---|
| 本番環境 | https://www.awesomebooks.asia （apexはwwwへリダイレクト） |
| リポジトリ | github.com/joeywoongsekim-pixel/awesome-books-asia（`main`ブランチ） |
| デプロイ | `main`へpushするとVercelが自動デプロイ（約40秒） |
| DB／認証／ファイル | Supabaseプロジェクト `hbsqmtdnnkzsbqxvclxf`（Awesome AI Asiaと共用） |
| DNS | Cloudflare（A `76.76.21.21`、CNAME www `cname.vercel-dns.com`、いずれもDNS only） |
| 言語 | 8言語 — EN・KO・JA・FIL・DE・FR・ES・PT |
| 管理者 | joey.woongse.kim@awesomeai.asia · akira.murata@awesomeai.asia · contact@awesomebooks.asia |

**現在のビジネスモデル**
- 単品販売：サイトでは販売せず、詳細ページから提携書店（Amazon・教保文庫・YES24・アラジン）へリンク
- 閲覧権限：**ログイン必須。** オーサムリーダーはサンプルを含め会員専用で、未ログインのアクセスは`/auth/login?next=…`へ戻します
- 登録：**招待クーポン制。** トライアル期間のため、管理者（contact@awesomebooks.asia）へメールでクーポンを請求する必要があります
- 料金：**無料サンプル購読。** 書棚が30冊になるまで無料、100冊になるまで無料サンプル購読として運営（サイトに明記）
- Amazonとの契約：新刊は最初の90日間Amazon独占のため、オーサムリーダーには刊行から90日後に並びます（サイトに明記）
- 有料サブスクリプション：決済コードは実装済み・休眠中

---

## 2. 初回のみの設定（未完了の項目）

Supabaseダッシュボード → プロジェクト → **Authentication**：

1. **URL Configuration**
   - Site URL：`https://www.awesomebooks.asia`
   - Redirect URLsに追加：`https://www.awesomebooks.asia/api/auth/callback`
   - （未設定の場合、確認メールのリンクがlocalhostを指します）
2. **Confirm emailポリシーの決定**（Sign In / Providers → Email）
   - オン（既定）：登録後に確認メールのクリックが必要 — 捨てアカウントを防げますが、メール受信が必須
   - オフ：即時登録 — 招待クーポンがすでに門番の役割を果たすため、オフでも安全です（運用上はこちらを推奨）
3. **Googleログイン**（任意）：Providers → GoogleにOAuthクライアントID／Secretを登録。登録前はエラーにしかならないため、ログイン／登録画面ではGoogleボタンを非表示にしています — 登録後にVercelの環境変数へ`NEXT_PUBLIC_GOOGLE_AUTH=1`を追加して再デプロイすると再び表示されます

### 受信（お問い合わせ・手紙申込）
手紙のバンドや`/ja/contact`に書かれた内容はすべて`public.inbox`に保存され、コンソールの**受信**で確認します。アドレスをクリックすれば返信が開き、右上のボタンで手紙申込者全員をBCCに入れたメールを一度に開けます。読めるのは管理者だけで、書き込みは誰でもできます（お問い合わせフォームなので）。
**contact@awesomebooks.asia へ自動転送はされません** — メール送信サービスがまだありません。Resend の API キーを登録すれば、新着をそのアドレスへ通知できます。

### 管理者アカウント
`joey.woongse.kim@awesomeai.asia`と`akira.murata@awesomeai.asia`の2件がメールとパスワードでログインでき、いずれも`admin_emails`の許可リストにあるため`/ja/admin`がそのまま開きます。パスワードはリポジトリには置いていません — 初回ログイン後、Supabaseダッシュボードから各自で変更してください。
初回ログイン後は、サイト上の**パスワード変更**（`/ja/account/password`、上部メニューの「パスワード」）から各自で変更できます — 変更前に現在のパスワードを確認します。お渡ししたパスワードのままのアカウントには、ページ上部に案内の帯が出ます。
管理画面はサイトとは切り離された**管理者モード**です — 上部メニューの「管理者モード」から入り、コンソール右上の「サイトへ戻る」で抜けます。このボタンは管理者にのみ表示されます。
ログインすると、それぞれの言語で管理画面が開きます（Joey → `/ko/admin`、Akira → `/ja/admin`）。言語は`admin_emails.locale`に保存されており、その値を変えれば遷移先も変わります。

---

## 3. 招待の流れ（中核となる運用）

### 3-1. 管理者本人の初回登録（ブートストラップ）

1. 別途お渡しした初期クーポンコードを持って https://www.awesomebooks.asia/ja/auth/signup へ
2. クーポンコード＋管理者メール（上記3つのいずれか）＋パスワードで登録
3. （Confirm emailがオンの場合）確認メールのリンクをクリック
4. ログインするとクーポンが自動で登録され、https://www.awesomebooks.asia/ja/admin が開きます

### 3-2. 招待クーポンの発行

1. `/ja/admin` → **クーポン**タブ
2. 種類を選択：
   - **365日サブスクリプション** ← 知人招待の標準（1年間無料で全冊閲覧）
   - 30日サブスクリプション／単品（特定の1冊）も選択可
3. 数量（1〜100）と有効期限（任意）を入力 → **クーポンを発行**
4. 一覧から `ABA-XXXX-XXXX` のコードをコピーして知人へ送付

送付文の例：
> Awesome Books Asiaへご招待します。
> https://www.awesomebooks.asia/ja/auth/signup からクーポンコード `ABA-XXXX-XXXX` でご登録いただくと、
> 1年間すべての本を無料でお読みいただけます。

### 3-3. 招待された方の体験

登録（コード必須）→ 初回ログイン時にコードが自動登録 → ライブラリ・リーダーで全冊閲覧。
自動登録がされなかった場合（別端末で確認メールを開いた等）は、`/ja/redeem` でコードを直接入力できます。

- コードは**1回限り**。登録と同時にロックされ、誰がいつ使ったか記録されます
- クーポンのない訪問者は各書籍の冒頭3見開き（サンプル）のみ閲覧でき、その先で登録案内が表示されます

---

## 4. 書籍の管理

`/ja/admin` → **書籍**タブ

### 4-1. 新しい本の登録

**新しい本** → 以下を入力：

| 項目 | 説明 |
|---|---|
| タイトル／著者 | 表示どおり |
| スラッグ | URL名（例：`ai-bible`）— 小文字とハイフンのみ。公開後の変更は非推奨 |
| カテゴリー | `ai`／`edu`／`kids` |
| 価格（USD） | 書店販売価格の表示用。0はサブスク専用 |
| 難易度 | 1〜3 |
| ページ数／刊行日／新刊表示 | 詳細ページの表記用 |

### 4-2. ファイルのアップロード（PDF/EPUB）

書籍編集画面の下部で、言語別（EN/KO/JA）に**PDF／EPUBをアップロード**。
- ファイルは非公開ストレージに `スラッグ/言語.pdf` として保存され、閲覧権限のある読者にのみ10分間の署名付きURLで配信されます
- アップロード完了で ✓ が表示されます

### 4-3. 留意点（重要）

- ホームと書店に表示される本は、現在**コードに組み込まれた初期6冊**です。管理画面で登録した本は権限・ファイル・200冊カウントには反映されますが、**ストアフロントへの表示はまだ自動ではありません** — 本格的な登録を始める際は「ストアフロントのDB連携」作業をご依頼ください（次の予定ステップ）
- **200冊到達時**：冊数はDBからリアルタイムに集計されるため、200冊目を登録した時点で料金案内の条件が満たされます。そのタイミングで決済を有効化してください（§6）

---

## 5. 会員・権限の構造（参考）

| 概念 | 意味 |
|---|---|
| クーポン（coupons） | 招待状＝利用券。単品／30日／365日 |
| 購入（purchases） | 単品の永久所有（クーポン、将来的には決済で付与） |
| サブスクリプション（subscriptions） | 期間制の読み放題。`current_period_end` を過ぎると自動失効 |
| サンプル | 誰でも各書籍の冒頭3見開きまで |
| 進捗・しおり | ログイン読者は読書位置としおりが自動保存 |

管理者の追加・削除はSQLでのみ行います（Supabase SQL Editor）：

```sql
insert into admin_emails (email) values ('new.admin@example.com');
delete from admin_emails where email = 'old.admin@example.com';
```

---

## 6. 有料化への切り替え（200冊到達時）

決済コードはデプロイ済みで、環境変数がないため休眠しています。

1. 決済事業者を決定：Stripe（海外法人が必要 — 日本の合同会社またはエストニアOÜ）またはAirwallex（韓国法人で可。アクセプタンス提供状況の確認が必要）
2. Stripeの場合：Vercel → プロジェクト → Settings → Environment Variables に
   `STRIPE_SECRET_KEY`、`STRIPE_WEBHOOK_SECRET`、`STRIPE_PRICE_MONTHLY`、`STRIPE_PRICE_ANNUAL`、`SUPABASE_SERVICE_ROLE_KEY` を設定 → 再デプロイ
3. Stripeダッシュボードでウェブフックを登録：`https://www.awesomebooks.asia/api/stripe-webhook`
   （イベント：`checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted`）
4. 登録時の招待コード必須要件の解除は開発作業1件です（ご依頼いただければ即対応）

---

## 7. コンテンツ・翻訳・デプロイ（開発ワークフロー）

- サイトの文言は `messages/en.json`（英語原文）で管理 → `npm run i18n` で他7言語を再生成（翻訳キャッシュ `scripts/translation-cache.json` をコミット管理。`ANTHROPIC_API_KEY` があれば新規文言は自動翻訳）
- `npm run i18n:check` — 翻訳漏れがあると失敗します
- `npm run build` の成功を確認してから `git push` → Vercelが自動デプロイ
- スキーマ変更履歴：`supabase/migrations/`（適用はSupabase SQL Editor、またはClaudeへ依頼）

---

## 8. トラブルシューティング

| 症状 | 確認事項 |
|---|---|
| 登録できない（「無効なコード」） | クーポンが未使用・未失効か、管理画面のクーポン一覧で確認 |
| 確認メールが届かない | Supabase Authログ、迷惑メール、§2のURL設定 |
| 登録したのに本がロックされている | `/ja/redeem` でコードを手動登録 |
| 管理画面が「権限がありません」 | ログイン中のメールが管理者3件のいずれか／メール確認済みか |
| ファイルアップロード失敗 | 管理者アカウントか確認のうえ再試行。拡張子（.pdf/.epub）も確認 |
| スタイルが古い・崩れる | 強制リロード（Ctrl+Shift+R）。Vercelで最新デプロイ状況を確認 |
| ドメインのエラー | CloudflareのA/CNAMEが§1の値で「DNS only」になっているか |

---

## 9. アカウント・資産一覧

- **GitHub**：joeywoongsekim-pixel / awesome-books-asia
- **Vercel**：プロジェクト awesome-books-asia（GitHub連携の自動デプロイ）
- **Supabase**：プロジェクト hbsqmtdnnkzsbqxvclxf（Auth・DB・Storage）
- **Cloudflare**：awesomebooks.asia のDNS（⚠️ MX smtp.google.com、gabiaのNSレコード3件、TXT検証レコードは絶対に変更しないこと — 会社メールとネームサーバーが停止します）
- **デザインガイド**：`docs/`（ブランド仕様v1.0、プロトタイプ）
- **ロゴ原本**：`public/logo.jpg`（円形シール。ファビコンは `app/icon.png`）
