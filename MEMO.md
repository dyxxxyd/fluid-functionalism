# 分支维护

- `upstream`：原作者仓库 `mickadesign/fluid-functionalism`。
- `origin`：Fork 仓库 `dyxxxyd/fluid-functionalism`。
- `main`：保持与 `upstream/main` 一致，只接收上游更新。
- `linkstart`：长期维护定制组件、依赖和工具链改动。

日常开发使用 `linkstart`。切换分支前先提交当前改动，避免未提交的内容跟随分支切换。

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
