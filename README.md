# SDT-G9
# 授業マッチングアプリ

## 概要

一緒に授業を受ける人を探し、同じ授業を受ける学生同士で3人グループを作成してチャットできるWebアプリです。

授業コードを入力して時間割に授業を登録し、その授業のマッチングボタンを押すことで、同じ授業・同じコマでマッチングを希望しているユーザとグループを作成します。

## 主な機能

- ユーザ登録・ログイン
- プロフィール登録
  - ユーザ名
  - モチベーション
  - 授業の受け方
- 授業コード入力
- 時間割表示
- マッチング機能
- 3人グループ作成
- グループチャット
- マッチング完了通知

## 使用技術

- React
- Vite
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- GitHub

## ディレクトリ構成

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
│  ├─ Layout.jsx
│  ├─ Button.jsx
│  ├─ Loading.jsx
│  └─ ErrorMessage.jsx
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

## セットアップ方法

### 1. リポジトリをクローン

```bash
git clone https://github.com/ユーザ名/リポジトリ名.git
cd リポジトリ名
```

### 2. パッケージをインストール

```bash
npm install
```

### 3. 環境変数ファイルを作成

プロジェクト直下に `.env.local` を作成し、Firebaseの設定値を記述します。

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 4. 開発サーバを起動

```bash
npm run dev
```

## Firebase設定

このアプリでは、以下のFirebase機能を使用します。

- Firebase Authentication
  - メールアドレス・パスワードによるログイン
- Cloud Firestore
  - ユーザ情報
  - 授業情報
  - マッチング情報
  - グループ情報
  - チャットメッセージ
- Firebase Hosting
  - Webアプリの公開

Firebaseの設定値は `src/firebase.js` で読み込みます。

## Firestoreの主なデータ構造

### users

```js
users/{userId}
{
  name: "ユーザ名",
  motivation: "高め",
  studyStyle: "静かに受けたい",
  createdAt: timestamp
}
```

### classes

```js
classes/{classCode}
{
  code: "IS101",
  name: "ソフトウェア開発論",
  day: "月",
  period: 3,
  teacher: "担当教員"
}
```

### matchRequests

```js
matchRequests/{requestId}
{
  userId: "user001",
  classCode: "IS101",
  day: "月",
  period: 3,
  motivation: "高め",
  studyStyle: "静かに受けたい",
  status: "waiting",
  createdAt: timestamp
}
```

### groups

```js
groups/{groupId}
{
  classCode: "IS101",
  day: "月",
  period: 3,
  members: ["user001", "user002", "user003"],
  createdAt: timestamp
}
```

### messages

```js
groups/{groupId}/messages/{messageId}
{
  userId: "user001",
  text: "よろしくお願いします",
  createdAt: timestamp
}
```

## 担当範囲

| 担当 | 内容 | 主に触るファイル |
|---|---|---|
| A | GitHub管理、画面遷移、共通レイアウト、README | `App.jsx`, `routes/`, `components/Layout.jsx`, `components/Header.jsx`, `README.md` |
| B | ログイン、プロフィール | `LoginPage.jsx`, `ProfilePage.jsx`, `authService.js`, `userService.js` |
| C | 授業登録、時間割、仮シラバス | `TimetablePage.jsx`, `ClassSearchPage.jsx`, `classService.js`, `syllabus.js` |
| D | マッチング、チャット | `MatchingPage.jsx`, `ChatPage.jsx`, `matchingService.js`, `chatService.js` |
