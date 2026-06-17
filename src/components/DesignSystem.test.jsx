import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  Button,
  Card,
  TextField,
  SelectField,
  PageHeader,
  ErrorMessage,
  SuccessMessage,
  Toast,
} from "./DesignSystem";

afterEach(cleanup);

// ─── Button ──────────────────────────────────────────────────────────────────

describe("Button", () => {
  test("テキストを表示する", () => {
    render(<Button>送信</Button>);
    expect(screen.getByRole("button", { name: "送信" })).toBeTruthy();
  });

  test("disabled=true のとき非活性になる", () => {
    render(<Button disabled>送信</Button>);
    expect(screen.getByRole("button").disabled).toBe(true);
  });

  test("loading=true のとき「処理中...」を表示しボタンが非活性になる", () => {
    render(<Button loading>送信</Button>);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toBe("処理中...");
    expect(btn.disabled).toBe(true);
  });

  test("クリックハンドラが呼ばれる", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>押す</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  test("disabled のときクリックしても非活性で反応しない", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>押す</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

// ─── Card ────────────────────────────────────────────────────────────────────

describe("Card", () => {
  test("children を描画する", () => {
    render(<Card>カードの内容</Card>);
    expect(screen.getByText("カードの内容")).toBeTruthy();
  });
});

// ─── TextField ───────────────────────────────────────────────────────────────

describe("TextField", () => {
  test("label と input が htmlFor/id で関連付けられている", () => {
    render(<TextField label="メールアドレス" type="email" />);
    const label = screen.getByText("メールアドレス");
    const input = screen.getByRole("textbox");
    expect(label.htmlFor).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
  });

  test("複数の TextField を並べると id が重複しない", () => {
    render(
      <>
        <TextField label="フィールド1" />
        <TextField label="フィールド2" />
      </>
    );
    const [f1, f2] = screen.getAllByRole("textbox");
    expect(f1.id).not.toBe("");
    expect(f2.id).not.toBe("");
    expect(f1.id).not.toBe(f2.id);
  });

  test("error props でエラーメッセージを表示する", () => {
    render(<TextField label="名前" error="必須項目です" />);
    expect(screen.getByText("必須項目です")).toBeTruthy();
  });

  test("id prop を明示したとき label の htmlFor に使われる", () => {
    render(<TextField label="名前" id="my-name" />);
    expect(screen.getByLabelText("名前").id).toBe("my-name");
  });
});

// ─── SelectField ─────────────────────────────────────────────────────────────

describe("SelectField", () => {
  test("label と select が htmlFor/id で関連付けられている", () => {
    render(
      <SelectField label="カテゴリ">
        <option value="a">A</option>
      </SelectField>
    );
    const label = screen.getByText("カテゴリ");
    const select = screen.getByRole("combobox");
    expect(label.htmlFor).toBeTruthy();
    expect(label.htmlFor).toBe(select.id);
  });

  test("options が正しく描画される", () => {
    render(
      <SelectField label="選択">
        <option value="x">項目X</option>
        <option value="y">項目Y</option>
      </SelectField>
    );
    expect(screen.getByRole("option", { name: "項目X" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "項目Y" })).toBeTruthy();
  });
});

// ─── PageHeader ──────────────────────────────────────────────────────────────

describe("PageHeader", () => {
  test("デフォルトで h1 として描画される", () => {
    render(<PageHeader title="ページタイトル" />);
    expect(screen.getByRole("heading", { level: 1, name: "ページタイトル" })).toBeTruthy();
  });

  test("level=2 で h2 として描画される", () => {
    render(<PageHeader title="セクション" level={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "セクション" })).toBeTruthy();
  });

  test("subtitle を表示する", () => {
    render(<PageHeader title="タイトル" subtitle="補足説明" />);
    expect(screen.getByText("補足説明")).toBeTruthy();
  });
});

// ─── ErrorMessage ────────────────────────────────────────────────────────────

describe("ErrorMessage", () => {
  test("message が空のときは何も描画しない", () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  test("role=alert を持つ", () => {
    render(<ErrorMessage message="入力エラーです" />);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  test("aria-live=assertive を持つ", () => {
    render(<ErrorMessage message="入力エラーです" />);
    expect(screen.getByRole("alert").getAttribute("aria-live")).toBe("assertive");
  });

  test("メッセージテキストを表示する", () => {
    render(<ErrorMessage message="パスワードが違います" />);
    expect(screen.getByText("パスワードが違います")).toBeTruthy();
  });
});

// ─── SuccessMessage ──────────────────────────────────────────────────────────

describe("SuccessMessage", () => {
  test("message が空のときは何も描画しない", () => {
    const { container } = render(<SuccessMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  test("role=status を持つ", () => {
    render(<SuccessMessage message="保存しました" />);
    expect(screen.getByRole("status")).toBeTruthy();
  });

  test("aria-live=polite を持つ", () => {
    render(<SuccessMessage message="保存しました" />);
    expect(screen.getByRole("status").getAttribute("aria-live")).toBe("polite");
  });

  test("メッセージテキストを表示する", () => {
    render(<SuccessMessage message="プロフィールを保存しました！" />);
    expect(screen.getByText("プロフィールを保存しました！")).toBeTruthy();
  });
});

// ─── Toast ───────────────────────────────────────────────────────────────────

describe("Toast", () => {
  test("text が空のときは何も描画しない", () => {
    const { container } = render(<Toast text="" />);
    expect(container.firstChild).toBeNull();
  });

  test("成功トーストは ✓ を表示し role=status を持つ", () => {
    render(<Toast text="追加しました" />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText(/✓/)).toBeTruthy();
    expect(screen.getByText(/追加しました/)).toBeTruthy();
  });

  test("エラートーストは ✕ を表示し role=alert を持つ", () => {
    render(<Toast text="重複しています" error />);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText(/✕/)).toBeTruthy();
  });
});
