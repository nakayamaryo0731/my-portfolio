# Task Completion Checklist

タスク完了時に実行すべきこと:

## 1. 型チェック
```bash
pnpm check
```
Astroの型チェックを実行し、TypeScriptエラーがないことを確認。

## 2. リント
```bash
pnpm eslint
```
ESLintエラー・警告を確認し、必要に応じて修正。

## 3. ビルド確認
```bash
pnpm build
```
プロダクションビルドが成功することを確認。

## 4. 動作確認
```bash
pnpm preview
```
ビルド後のサイトをプレビューして動作確認。

## 5. Git操作
- 変更内容を確認: `git diff`
- 適切なコミットメッセージで日本語でコミット
