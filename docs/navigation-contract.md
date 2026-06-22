# 画面遷移契約

## 正式ルート

| 機能 | ルート | 担当 |
| --- | --- | --- |
| ホーム | `/` | A |
| 時間割 | `/timetable` | C |
| 授業検索 | `/classes/search` | C |
| プロフィール | `/profile` | B |
| チャット一覧 | `/chats` | D |
| マッチング | `/matching/:classCode` | D |
| 個別チャット | `/chat/:groupId` | D |

## 導線責務

- C: 時間割・授業検索から、対象授業のマッチング画面へ遷移させる。
- D: マッチング成立後、対象グループのチャット画面へ遷移させる。
- D: `/chats` に参加中グループ一覧を表示し、既存チャットへ再入室可能にする。
- B: プロフィール未設定時のマッチング開始制御と、完了後の復帰導線を実装する。
- A: ルート・保護ルート・下部ナビゲーション・共通ルート定義を維持する。

## 共通ルート定義

画面遷移では `src/constants/routes.js` の関数を使う。
HashRouter のため、`/#/...` を直接組み立てず、React Router の `to` に渡せるパスを生成する。

- `homePath()`
- `loginPath()`
- `profilePath()`
- `timetablePath()`
- `classSearchPath()`
- `chatsPath()`
- `matchingPath({ classCode, dayOfWeek, period, term })`
- `chatPath({ groupId })`

`matchingPath` は `classCode` をパスパラメータとして扱い、曜日・時限・学期は必要な場合だけクエリパラメータに含める。
A担当では、既存データに存在しない曜日・時限・学期を補完しない。

## 実装前の未確定仕様

以下は未確定であり、A判断では確定実装しない。

- マッチング単位に曜日・時限・学期を必須とするか
- グループの成立人数
- マッチング成立前にチャットを作るか
- 授業削除時の既存グループ・チャットの扱い
- 未読件数・通知をMVPに含めるか
