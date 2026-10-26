# 分支维护

- `upstream`：原作者仓库 `mickadesign/fluid-functionalism`。
- `origin`：Fork 仓库 `dyxxxyd/fluid-functionalism`。
- `main`：保持与 `upstream/main` 一致，只接收上游更新。
- `linkstart`：长期维护定制组件、依赖和工具链改动。
- `feature/*`：从最新 `linkstart` 创建，完成一项功能或修复后合并回 `linkstart`。

日常开发以 `linkstart` 为基线，每项修改使用独立的 `feature/*` 分支。切换分支前先提交当前改动，避免未提交的内容跟随分支切换。

## 功能开发与合并

以下以 `feature/component-name` 为例，请替换为本次功能对应的新分支名。

### 1. 更新开发基线并创建分支

确认工作区干净后执行：

```bash
git switch linkstart
git pull --ff-only origin linkstart
git switch -c feature/component-name
```

### 2. 修改、验证、提交并推送

完成代码修改和相关测试、类型检查及构建验证后，检查改动并提交。将下面的文件路径替换为实际修改的文件，可列出多个路径：

```bash
git status --short
git add path/to/changed-file
git commit -m "feat: describe component change"
git push -u origin feature/component-name
```

### 3. 通过 PR 合并回 linkstart

在 Fork 仓库创建 Pull Request：

- 来源分支（compare）：`feature/component-name`。
- 目标分支（base）：`linkstart`。

确认改动范围和 CI 检查结果；如有冲突，在功能分支解决并重新验证、提交、推送。检查通过后合并 PR。

### 4. 合并后更新本地

确认 PR 已合并且当前工作区干净后执行：

```bash
git switch linkstart
git pull --ff-only origin linkstart
```

下一项修改继续从更新后的 `linkstart` 创建新的 `feature/*` 分支。

## 同步上游

确认工作区干净后执行：

```bash
git fetch upstream
git switch main
git merge --ff-only upstream/main
git push origin main

git switch linkstart
git merge main
# 如有冲突，解决后完成合并；验证组件、类型检查和构建后再推送。
git push origin linkstart
```

如果 `main` 无法快进，先检查是否误加了定制提交，不要直接强制重置或强制推送。
