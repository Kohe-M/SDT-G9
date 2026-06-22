# マッチング・チャット MVP

## MVP仕様

- マッチング単位は `classCode` とする。
- グループ人数は2人とする。
- 1ユーザーが同時に待機できるマッチングは1件とする。
- 同じ2ユーザー・同じ授業コードの場合は既存グループを再利用する。
- マッチング成立後は個別チャットへ遷移する。
- `/chats` から過去に参加したグループへ再入室できる。

## 今回の範囲外

- 3人以上のグループマッチング
- 未読数、通知、既読表示
- 画像送信、チャット検索
- 授業削除時のグループ削除
- 曜日・時限・学期を使ったマッチング
- プロフィール未設定時の開始制御
- Cloud Functionsを用いた完全なサーバ側マッチング
- 放置された待機レコードの自動削除

## Firestore Security Rules 方針

このリポジトリでは、Firestore Rulesを `firestore.rules`、Firebase CLI用の最小設定を `firebase.json` で管理する。
実Firebaseへ反映する場合は、対象Firebaseプロジェクトを確認したうえで `firebase deploy --only firestore:rules`、またはFirestore Consoleで同等のRulesを設定する。

### `groups`

- 読み取りは `members` に `request.auth.uid` が含まれる利用者のみ許可する。
- 作成は2人グループで、`members` に `request.auth.uid` が含まれる場合のみ許可する。
- 作成時は、`members` の両方について `matchingQueue/{uid}` が存在し、その `classCode` が作成するグループの `classCode` と一致することをRulesで検証する。
- これにより、待機していない第三者を任意にグループへ追加する操作を拒否する。
- 更新はグループメンバーのみ許可し、更新可能フィールドは最終メッセージ関連に限定する。
- `members`、`classCode`、`createdAt` は更新不可とする。
- 直接URLを知っていても、グループメンバー以外は閲覧・更新できないようにする。
- 削除は許可しない。

### `groups/{groupId}/messages`

- 読み取りは親グループのメンバーのみ許可する。
- 作成は親グループのメンバーのみ許可する。
- `senderId` は `request.auth.uid` と一致する場合のみ許可する。
- 空本文、空白のみ、201文字以上の本文は拒否する。
- 他人になりすました投稿を拒否する。
- メッセージの更新・削除は許可しない。

### `matchingQueue`

- `read` はクライアント側の候補探索に必要なため、認証済みユーザーに許可する。
- `create` / `update` / `delete` は `request.auth.uid == queueId`、つまり本人の `matchingQueue/{uid}` のみ許可する。
- ドキュメント内の `userId` も `request.auth.uid` と一致する場合のみ許可する。
- `classCode` は文字列かつ空でない場合のみ許可する。
- 他ユーザーの待機レコード削除は許可しない。
- クライアント側マッチングでは `matchingQueue` を `classCode` で購読し、相手候補の待機レコードを読む必要がある。
- この設計では、認証済みユーザーに待機中UIDと授業コードが見える。
- マッチ成立後は、各クライアントが自分自身の `matchingQueue/{uid}` だけを削除する。
- キャンセル、画面離脱、エラー時も、自分自身の待機レコードだけを削除する。
- ブラウザ終了や通信断でクリーンアップが走らない場合、待機レコードが残る可能性がある。このMVPでは自動削除機構を追加せず、将来的に `expiresAt` とCloud Functionsなどのサーバ側処理で解消する。

## Rulesと現在のクライアント実装の対応

- `subscribeMatchingCandidates()` は `matchingQueue` を `classCode` で購読するため、`matchingQueue` の `read` は認証済みユーザー全体に許可する。
- `subscribeUserClassGroups()` は自分が `members` に含まれる `groups` を購読する。購読開始時の初期スナップショットでも、すでに存在する同一 `classCode` のグループを検知する。
- `tryCreateGroup()` はトランザクション内で自分と相手の待機レコードを読み、両者が同じ `classCode` で待機中であることを確認する。
- `tryCreateGroup()` は決定的な `groupId` と `runTransaction` を使い、同じ2人・同じ授業コードのグループを1件だけ作成または再利用する。
- `tryCreateGroup()` は相手の待機レコードを削除しない。
- 待機レコード削除は `cancelMatching({ userId })` に集約し、呼び出し元のクライアント自身のUIDだけを対象にする。
- マッチ成立検知は、相手の `matchingQueue` 削除通知に依存しない。キュー監視とは別に、自分が参加するグループのリアルタイム購読で成立を検知する。
- キュー監視とグループ監視の両方から成立通知が来る可能性があるため、画面側で二重遷移と二重クリーンアップを防止する。
- 成立後の自分の待機レコード削除に失敗しても、成立済みグループへの遷移は継続する。失敗した待機レコードは画面離脱時の再試行または将来の期限切れ処理で扱う。
- `groups` と `messages` は `members` に含まれるUIDだけが読み書きできるため、第三者が直接URLで他人の個別チャットを開いても、Firestoreの読取・送信は拒否される。

## Firestore Rules Simulatorで確認するケース

- 未認証ユーザーは `matchingQueue`、`groups`、`messages` を読み書きできない。
- 認証済みユーザーは `matchingQueue` を読める。
- 認証済みユーザーは自分の `matchingQueue/{uid}` だけ作成・更新・削除できる。
- 認証済みユーザーは他人の `matchingQueue/{uid}` を作成・更新・削除できない。
- `groups` 作成時、`members` が2人でない場合は拒否される。
- `groups` 作成時、2人のUIDが同じ場合は拒否される。
- `groups` 作成時、`request.auth.uid` が `members` に含まれない場合は拒否される。
- `groups` 作成時、両メンバーの `matchingQueue/{uid}` が存在しない場合は拒否される。
- `groups` 作成時、両メンバーの待機キュー `classCode` が作成グループの `classCode` と一致しない場合は拒否される。
- グループメンバー以外は `groups/{groupId}` と `groups/{groupId}/messages` を読めない。
- グループメンバーでも `members`、`classCode`、`createdAt` の更新は拒否される。
- メッセージ作成時、`senderId != request.auth.uid` は拒否される。
- 空文字、空白のみ、201文字以上のメッセージ本文は拒否される。
- メッセージの更新・削除は拒否される。

## Rulesで残る制約

- 現在のRulesは、決定的 `groupId` の文字列形式までは検証していない。重複作成防止はクライアントの `buildGroupId()` と `runTransaction` に依存する。
- グループ更新とメッセージ作成が同一バッチで行われたことまではRulesで検証していない。更新可能フィールドを最終メッセージ関連に限定して、改ざん範囲を狭めている。
- `matchingQueue` の `read` を認証済みユーザーに許可するため、待機中UIDと授業コードは認証済みユーザーに見える。

## 将来対応

- Cloud Functionsなどのサーバ側マッチングへ移すと、待機キューの候補探索とグループ作成をクライアントから隠せる。
- サーバ側処理に移行すれば、認証済みユーザーに待機中UIDや授業コードを公開しない設計にできる。
- `expiresAt` と定期削除を導入すれば、通信断やブラウザ終了で残った待機レコードを自動的に掃除できる。
