# NexusShift — 勤務モニタリングプラットフォーム

*Read this in [English](README.md).*

NexusShift は、透明性と同意にもとづく勤務モニタリングシステムです。2つの部分で構成されています。

- **ワーカーエージェント** — 従業員のPCにインストールするデスクトップアプリ（Electron）。*従業員が画面上で同意した後にのみ*、すべてのモニターのスクリーンショットを定期的に取得し、稼働／アイドル時間を記録します。
- **管理ダッシュボード** — 管理者がログインして、登録済みワーカー・スクリーンショット・アクティビティを確認するWebアプリ。

どちらも、自分でホストする **Supabase** バックエンド（Postgres + ストレージ + 認証）と通信します。

> ⚠️ **法的な注意.** 個人のモニタリングは法律で規制されています。適切な開示と同意のもと、
> 現地の法律（盗聴・同意に関する法律、GDPR、労働法など）を遵守した場合にのみ導入してください。
> エージェントは意図的に透明です（表示されるウィンドウ、同意画面、トレイアイコン）——
> 秘密裏に動作させようとしないでください。

---

## アーキテクチャ

```
ワーカーエージェント (Electron)              管理ダッシュボード (React)
   | 公開 anon キー                             | 管理者ログイン (Supabase Auth)
   | SECURITY DEFINER 関数で書き込み             | 行レベルセキュリティで読み取り
   v                                            v
             Supabase (Postgres + ストレージ + 認証)
```

- エージェントは **公開 anon キーのみ** を保持し、データベース関数を通じて書き込みます——
  従業員データを読み取ることは決してできません。**サービスロールキーはエージェントに同梱されません。**
- ダッシュボードは **管理者ログイン** が必須で、行レベルセキュリティが匿名の読み取りを完全にブロックします。

---

## 前提条件

- Node.js 18以上、npm 9以上
- 無料の [Supabase](https://supabase.com) アカウント
- （Windows版エージェントのビルド）Windows 10/11

---

## セットアップ

### 1. クローンとインストール

```bash
git clone https://github.com/chris-rizu/NexusShift.git
cd NexusShift
npm install
```

### 2. Supabase プロジェクトを作成

1. [supabase.com](https://supabase.com) → **New project**。データベースのパスワードを保存します。
2. **Project Settings → API** を開き、以下をコピーします。
   - **Project URL**（`https://YOUR_PROJECT_REF.supabase.co`）
   - **anon / public key**
   - **service_role key**（秘密——セットアップ時のみ使用）

### 3. ストレージバケットを作成

Supabase → **Storage** → **New bucket** で、`screenshots` という名前の **非公開（private）** バケットを作成します。

### 4. データベースのマイグレーションを実行

Supabase → **SQL Editor** で、`packages/supabase/migrations/` 内の各ファイルを
**順番に**（001 → 009）実行します。テーブル、安全な取り込み関数、行レベルセキュリティ、
管理者の読み取りアクセス、カスケードキー、マルチモニターのラベルを作成します。

### 5. 管理者ログインを作成

- Supabase → **Authentication → Users → Add user** → メールアドレスとパスワードを入力し、
  **Auto Confirm User** にチェックを入れます。
- Supabase → **Authentication → Providers → Email** → 「Allow new users to sign up」を
  **オフ** にします（作成したアカウントのみログイン可能にするため）。
- 管理者ごとに同じ方法でログインを追加します。

### 6. 環境変数を設定

各 `.env.example` を `.env` にコピーして値を入力します。

```bash
cp packages/admin-dashboard/.env.example packages/admin-dashboard/.env
cp packages/worker-agent/.env.example    packages/worker-agent/.env
```

- `packages/admin-dashboard/.env` → `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
  （管理スクリプトを実行する場合のみ `SUPABASE_SERVICE_ROLE_KEY`）。
- `packages/worker-agent/.env` → `MAIN_VITE_SUPABASE_URL`、`MAIN_VITE_SUPABASE_ANON_KEY`。

`.env` ファイルは git 管理外で、コミットされません。

---

## 管理ダッシュボードの実行

```bash
cd packages/admin-dashboard
npm run dev        # http://localhost:3000 でローカル開発
```

### デプロイ（Vercel）

```bash
npm i -g vercel
vercel                     # 初回：プロジェクトをリンク／作成
# Vercel のプロジェクト設定で、次の2つの環境変数を追加します：
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
vercel --prod              # デプロイ
```

作成した管理者アカウントでログインします。エージェントがまだ動作していない場合は
空の状態が表示されます——これは正常です。

---

## ワーカーエージェントのビルド

```bash
cd packages/worker-agent
npm run build              # コンパイル
npm run dist:win           # release/ に Windows インストーラーを生成
```

インストーラーは `packages/worker-agent/release/NexusShift Agent Setup <version>.exe` に生成されます。

従業員が実行すると **同意画面** が表示されます。同意した後にのみモニタリングが開始され、
いつでもトレイから一時停止・終了できます。すべてのモニターが取得され、
ラベル付け（Monitor 1、Monitor 2 …）されます。

### コード署名（配布前に推奨）

インストーラーは既定では未署名のため、他のマシンで Windows SmartScreen の警告が出ます。
署名方法（Azure Trusted Signing / EV / OV）は
[`packages/worker-agent/CODE-SIGNING.md`](packages/worker-agent/CODE-SIGNING.md) を参照してください。
パイプラインはすでに構成済みです。

---

## セキュリティに関する注意

- **サービスロールキーは決してコミット・同梱しないでください。** 一度きりのセットアップスクリプトでのみローカルに使用します。
- エージェントは公開 anon キー + 書き込み専用のデータベース関数を使用します。公開キーの保持者は
  データを送信できますが、従業員データを読み取ることはできません。より堅牢な運用ではデバイスごとの
  登録トークンを発行します（今後の課題）。
- ダッシュボードは認証済みユーザーをすべて管理者として扱います——公開サインアップを無効のままにし、
  アカウントは手動で作成してください。

## ライセンス

MIT
