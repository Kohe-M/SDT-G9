# SDT-G9 授業マッチングアプリ

## アプリ概要

同じ授業を受ける学生同士でグループを作り、チャットできるようにする授業マッチングアプリです。

今回の初期構成では、機能の本実装ではなく、各担当が作業を開始できるページ、サービス、ルーティング、共通レイアウトを用意しています。

## 公開URL

https://kohe-m.github.io/SDT-G9/

## 使用技術

- React
- Vite
- JavaScript
- react-router-dom
- Firebase Authentication
- Cloud Firestore

## セットアップ方法

```bash
npm install
npm run dev
```

Pull requests to `main` are verified by GitHub Actions (`CI / build`).

開発サーバー起動後、以下にアクセスできます。

```text
http://localhost:5173/
http://localhost:5173/login
http://localhost:5173/profile
http://localhost:5173/timetable
http://localhost:5173/classes/search
http://localhost:5173/matching/TEST101
http://localhost:5173/chat/test-group
```

ビルド確認は以下です。

```bash
npm run build
```

## 環境変数

`.env.example` を参考に、各自で `.env.local` を作成してください。

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env.local` はGitHubに上げないでください。実際のFirebase設定値はGit管理しません。

## Git運用ルール

- `main` は動作する状態を保つ
- 作業は担当ごとにブランチを分ける
- `node_modules/`, `dist/`, `.env`, `.env.local` はコミットしない
- 作業前に `npm install` を実行する
- Pull Request前に `npm run build` を実行する

## 担当範囲

### A担当

- GitHub管理
- 画面遷移
- 共通レイアウト
- Header
- README
- 初期環境構築

### B担当

- ログイン
- プロフィール
- authService
- userService

### C担当

- 授業登録
- 時間割
- 仮シラバス
- classService

### D担当

- マッチング
- チャット
- matchingService
- chatService

## 各担当が触るファイル

| 担当 | 主なファイル |
| --- | --- |
| A | `src/App.jsx`, `src/main.jsx`, `src/routes/AppRoutes.jsx`, `src/components/Layout.jsx`, `src/components/Header.jsx`, `src/constants/routes.js`, `src/styles/global.css`, `README.md` |
| B | `src/pages/LoginPage.jsx`, `src/pages/ProfilePage.jsx`, `src/services/authService.js`, `src/services/userService.js` |
| C | `src/pages/TimetablePage.jsx`, `src/pages/ClassSearchPage.jsx`, `src/services/classService.js`, `src/data/syllabus.js` |
| D | `src/pages/MatchingPage.jsx`, `src/pages/ChatPage.jsx`, `src/services/matchingService.js`, `src/services/chatService.js` |

## 現在の構成

```text
src/
├─ App.jsx
├─ main.jsx
├─ firebase.js
├─ routes/
│  └─ AppRoutes.jsx
├─ pages/
│  ├─ HomePage.jsx
│  ├─ LoginPage.jsx
│  ├─ ProfilePage.jsx
│  ├─ TimetablePage.jsx
│  ├─ ClassSearchPage.jsx
│  ├─ MatchingPage.jsx
│  └─ ChatPage.jsx
├─ components/
│  ├─ Header.jsx
│  └─ Layout.jsx
├─ services/
│  ├─ authService.js
│  ├─ userService.js
│  ├─ classService.js
│  ├─ matchingService.js
│  └─ chatService.js
├─ data/
│  └─ syllabus.js
├─ constants/
│  └─ routes.js
└─ styles/
   └─ global.css
```
