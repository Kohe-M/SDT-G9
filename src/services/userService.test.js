import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveUserProfile, getUserProfile } from './userService';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// firebase/firestore の関数をモック化
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
}));

// ../firebase で定義されている db インスタンスをモック化
vi.mock('../firebase', () => ({
  db: {}
}));

describe('userService', () => {
  beforeEach(() => {
    // 各テストの前にモックの呼び出し履歴などをリセット
    vi.clearAllMocks();
  });

  describe('saveUserProfile', () => {
    it('正常系: 正しい引数でFirestoreへの保存処理が呼ばれる', async () => {
      // doc()の戻り値をモック
      doc.mockReturnValueOnce('mockUserRef');
      // setDoc()は成功とする
      setDoc.mockResolvedValueOnce(undefined);

      const profileData = { name: 'Test User', motivation: '高い' };
      await saveUserProfile('user123', profileData);

      // docが正しいコレクション名とユーザーIDで呼ばれたか
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123');
      
      // setDocにデータ（現在時刻の updatedAt も含む）と merge オプションが渡されたか
      expect(setDoc).toHaveBeenCalledWith('mockUserRef', {
        ...profileData,
        updatedAt: expect.any(Date) // Dateオブジェクトが入っていることだけ確認
      }, { merge: true });
    });

    it('異常系: 保存時にエラーが発生した場合は例外が投げられる', async () => {
      doc.mockReturnValueOnce('mockUserRef');
      const error = new Error('Firestore Error');
      setDoc.mockRejectedValueOnce(error);

      await expect(saveUserProfile('user123', {})).rejects.toThrow('Firestore Error');
    });
  });

  describe('getUserProfile', () => {
    it('正常系: ドキュメントが存在する場合はデータが返る', async () => {
      doc.mockReturnValueOnce('mockUserRef');
      const mockData = { name: 'Test User', motivation: '高い' };
      
      // getDoc()の戻り値のDocumentSnapshot風オブジェクトを作成
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockData
      });

      const result = await getUserProfile('user123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123');
      expect(getDoc).toHaveBeenCalledWith('mockUserRef');
      expect(result).toEqual(mockData);
    });

    it('正常系: ドキュメントが存在しない場合はnullが返る', async () => {
      doc.mockReturnValueOnce('mockUserRef');
      
      getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const result = await getUserProfile('user123');

      expect(result).toBeNull();
    });

    it('異常系: 取得時にエラーが発生した場合は例外が投げられる', async () => {
      doc.mockReturnValueOnce('mockUserRef');
      const error = new Error('Firestore Get Error');
      getDoc.mockRejectedValueOnce(error);

      await expect(getUserProfile('user123')).rejects.toThrow('Firestore Get Error');
    });
  });
});
