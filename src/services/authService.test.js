import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, logoutUser, observeAuthState } from './authService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// firebase/auth の関数をモック化
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// ../firebase で定義されている auth インスタンスをモック化
vi.mock('../firebase', () => ({
  auth: {}
}));

describe('authService', () => {
  beforeEach(() => {
    // 各テストの前にモックの呼び出し履歴などをリセット
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('正常系: createUserWithEmailAndPasswordが正しく呼ばれ、userが返る', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const result = await registerUser('test@example.com', 'password123');

      // 渡した引数で関数が呼ばれたか確認
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      // 戻り値の確認
      expect(result).toEqual(mockUser);
    });

    it('異常系: 新規登録時にエラーが発生した場合は例外が投げられる', async () => {
      const error = new Error('Auth Error');
      createUserWithEmailAndPassword.mockRejectedValueOnce(error);

      await expect(registerUser('test@example.com', 'password123')).rejects.toThrow('Auth Error');
    });
  });

  describe('loginUser', () => {
    it('正常系: signInWithEmailAndPasswordが正しく呼ばれ、userが返る', async () => {
      const mockUser = { uid: '456', email: 'login@example.com' };
      signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const result = await loginUser('login@example.com', 'password456');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'login@example.com', 'password456');
      expect(result).toEqual(mockUser);
    });

    it('異常系: ログイン時にエラーが発生した場合は例外が投げられる', async () => {
      const error = new Error('Login Error');
      signInWithEmailAndPassword.mockRejectedValueOnce(error);

      await expect(loginUser('login@example.com', 'password456')).rejects.toThrow('Login Error');
    });
  });

  describe('logoutUser', () => {
    it('正常系: signOutが正しく呼ばれる', async () => {
      signOut.mockResolvedValueOnce(undefined);

      await logoutUser();

      expect(signOut).toHaveBeenCalledWith(expect.anything());
    });

    it('異常系: ログアウト時にエラーが発生した場合は例外が投げられる', async () => {
      const error = new Error('Logout Error');
      signOut.mockRejectedValueOnce(error);

      await expect(logoutUser()).rejects.toThrow('Logout Error');
    });
  });

  describe('observeAuthState', () => {
    it('正常系: onAuthStateChangedがコールバック関数とともに呼ばれる', () => {
      const mockUnsubscribe = vi.fn();
      onAuthStateChanged.mockReturnValueOnce(mockUnsubscribe);

      const callback = vi.fn();
      const unsubscribe = observeAuthState(callback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
