# ソフトウェアメトリクスを使った品質管理

## 目的

複雑な関数を早期に検出し、保守性・理解容易性・テスト容易性を維持する。

## 使用指標

McCabeの循環的複雑度を使用する。

循環的複雑度は、制御フローグラフにおける独立パス数を表す指標である。`if`、三項演算子、論理演算子、例外処理などの分岐が増えるほど値が増え、関数の理解・保守・テストが難しくなる可能性を示す。

## 対象範囲

計測対象は、本番ロジックを中心とした次のファイルである。

- `src/services/**/*.js`
- `src/utils/**/*.js`
- `src/constants/routes.js`

テストコードは、仕様を検証するための分岐やモックが多くなりやすく、本番コードの保守性を直接表すものではないため対象外とする。React画面コンポーネントも、表示条件やUI状態による分岐が多く、今回の目的である本番ロジックの品質ゲートとは性質が異なるため対象外とする。

Firebase設定ファイル、workflow、設定ファイル、生成物も、アプリケーションの本番ロジックそのものではないため対象外とする。

## 判定基準

関数ごとの循環的複雑度を10以下とする。

10を超える関数が検出された場合、`npm run quality:complexity` は非0終了し、CIも失敗する。

## 計測コマンド

```bash
npm run quality:complexity
```

このコマンドはESLintのcore `complexity` ruleを使い、対象ファイルのMcCabe型の循環的複雑度を検査する。

## CIとの統合

GitHub Actionsの `CI` workflow / `ci-build` job に複雑度検査を追加している。

Pull Requestと `main` へのpush時に、次の順で自動実行される。

```text
Install dependencies
Test
Check cyclomatic complexity
Build
```

基準を超える関数がある場合、`Check cyclomatic complexity` stepでCIを失敗させる。

## 初回計測結果

対象範囲は `src/services/**/*.js`、`src/utils/**/*.js`、`src/constants/routes.js` である。

実行コマンドは次の通りである。

```bash
npm run quality:complexity
```

初回計測では基準超過があった。`src/services/chatService.js` のチャットグループ一覧を並び替える処理で、ESLintにより複雑度13として検出された。

基準は緩和せず、Firestoreの読み書き対象や公開APIを変えない範囲で、グループ整形と比較処理を補助関数へ抽出した。修正後の同コマンドでは基準超過は検出されていない。

## 限界

複雑度が低くても欠陥がないことは保証しない。

循環的複雑度は、レビューやテストを重点化すべき候補を見つけるための指標であり、テストやコードレビューを置き換えるものではない。
