/**
 * motivation / studyStyle の Firestore 保存形式について
 *
 * このPRでは ProfilePage の motivation・studyStyle を文字列から配列へ変更しています。
 * これは画面デザインが複数選択チップになったことに伴う意図的な仕様変更です。
 *
 * 後方互換: Firestore に文字列として保存された既存データは toArray() で配列に変換して読み込みます。
 * 書き込みは常に配列形式（string[]）で保存されます。
 *
 * 影響範囲: マッチングロジック側（B担当）が motivation / studyStyle を読む際は
 *   配列であることを前提としてください。
 */

/**
 * Firestoreから読み込んだ値を配列に正規化する。
 * - すでに配列 → そのまま返す
 * - 文字列（旧フォーマット）→ [文字列] に変換
 * - undefined / null / 空文字 → []
 */
export function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val) return [val];
  return [];
}
