const validResult = () => ({ ok: true });

const invalidResult = (message) => ({
  ok: false,
  message,
});

const validateRequiredTextLength = (value, label, maxLength) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return invalidResult(`${label}を入力してください。`);
  }

  if (value.trim().length > maxLength) {
    return invalidResult(`${label}は${maxLength}文字以内で入力してください。`);
  }

  return validResult();
};

export const validateEmail = (email) => {
  if (typeof email !== "string" || email.trim().length === 0) {
    return invalidResult("メールアドレスを入力してください。");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return invalidResult("正しい形式のメールアドレスを入力してください。");
  }

  return validResult();
};

export const validatePassword = (password) => {
  if (typeof password !== "string" || password.length === 0) {
    return invalidResult("パスワードを入力してください。");
  }

  if (password.length < 6) {
    return invalidResult("パスワードは6文字以上で入力してください。");
  }

  return validResult();
};

export const validateDisplayName = (name) =>
  validateRequiredTextLength(name, "表示名", 20);

export const validateClassName = (className) =>
  validateRequiredTextLength(className, "授業名", 50);

export const validateMessageText = (text) =>
  validateRequiredTextLength(text, "メッセージ", 500);
