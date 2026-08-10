# 手动同步到开源仓 SOP

> 本文档说明如何把本仓库（`huaweicloud-mate/huaweicloud-devkit`）的代码**手动**同步到公开开源仓（`huaweicloud/HuaweiCloud-Devkit`）。

## 背景与分工

| 仓库 | 职责 |
| ---- | ---- |
| `huaweicloud-mate/huaweicloud-devkit` | 开发、CI/CD、**npm 发布源**（正式发布从这里发生） |
| `huaweicloud/HuaweiCloud-Devkit` | **公开代码镜像**：只展示源码，无发布能力（发布 workflow 已移除） |

两个仓库历史无共同祖先，同步采用**合并**（`--allow-unrelated-histories`），**不要覆盖（force-push）**。

## 触发时机

**每次正式版发布后**（npm `latest` 更新后），执行一次同步。

## 同步步骤

> 前置：需要 `huaweicloud/HuaweiCloud-Devkit` 的 SSH 写权限（`zrr000212-netizen` 等协作者）。

```bash
# 1. 在本地进入 huaweicloud-mate 仓库
cd <本仓库路径>

# 2. 拉取两边最新
git fetch origin main
git fetch git@github.com:huaweicloud/HuaweiCloud-Devkit.git main

# 3. 基于开源仓 main 建合并分支
git checkout -b sync-to-org FETCH_HEAD_2   # FETCH_HEAD_2 指开源仓 main

# 4. 合并本仓库 main（无共同祖先，需 allow-unrelated）
git merge origin/main --no-edit --allow-unrelated-histories

# 5. 解决冲突（通常：README/CONTRIBUTING/CODE_OF_CONDUCT/SECURITY/.github 等共享文件）
#    - 共享文件取本仓库（插件）版本
#    - 开源仓独有的治理 workflow（status-transition / triage-issue 等）保留

# 6. 校验
npm run lint
npm run validate

# 7. 提交并推送到开源仓
git commit --no-edit
git push git@github.com:huaweicloud/HuaweiCloud-Devkit.git HEAD:main

# 8. 推本次发布版本 tag（只需正式版 tag，如 v1.0.0）
git push git@github.com:huaweicloud/HuaweiCloud-Devkit.git refs/tags/vX.Y.Z
```

## 冲突解决约定

| 文件 | 取谁 |
| ---- | ---- |
| 插件功能内容（plugins/bin/skills/integrations/test 等） | 本仓库（插件） |
| README / CONTRIBUTING / CODE_OF_CONDUCT / SECURITY / .github 共享文件 | 本仓库（插件，完整内容） |
| 开源仓独有治理 workflow（status-transition/triage-issue） | 保留开源仓版本 |
| 发布型 workflow（cd-production/release/publish 等） | **不合并**——公开仓只保留校验 CI + 治理 workflow |
| `docs/hook-rule-model.md`、`docs/opencode-hook-safety-test-guide.md` | **不合并**——内部文档，含内部信息，公开仓已删除 |

## 验证

```bash
git ls-remote git@github.com:huaweicloud/HuaweiCloud-Devkit.git refs/heads/main refs/tags/vX.Y.Z
# 确认 main HEAD 与本地一致，tag 存在
```

## 注意

- **不要 force-push**：开源仓可能有合并产物或独有内容，覆盖会丢失。
- **tag 只推正式版**：`v0.1.x` 等测试期 tag 不进开源仓。
- 同步前先确认 npm `latest` 已更新（发布已成功）。
