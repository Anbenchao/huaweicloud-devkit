---
name: huawei-cloud-find-skills
description: |
  Invoke this skill to search, discover, browse, find and install any Huawei Cloud (华为云) agent skill.Triggers include: "华为云","华为云有什么skill","华为云相关skill","华为云agent skill 市场","华为云skill类目","explore Huawei Cloud skills","show Huawei Cloud skill categories","does a Huawei Cloud skill exist for...","which Huawei Cloud skills exist","搜索华为云技能","有没有管理ECS/OBS/RDS的skill","帮我找 XX 华为云skill","介绍 XX Skill 内容","华为云 XX Skill 具体做什么","安装华为云Skill".
---

# Huawei Cloud Agent Skills Search and Discovery

**For any Huawei Cloud query:** Search → Install → Execute the matched skill.

## Prerequisites

- Python 3.6+ (`python` or `python3` in PATH)
- Network access to `gitcode.com` and `github.com`

## Core Workflow

### Step 1: Search

Run the search script (do NOT read index.json directly):

```bash
python scripts/search-skills.py -k "<keyword>"
python scripts/search-skills.py -k "<keyword>" -c "<category>"
```

The script fetches the index from GitCode API v5, expands CN↔EN keywords, scores results, and outputs matches.

### Step 2: View Details (optional)

Fetch SKILL.md for intent validation:

```
https://raw.githubusercontent.com/huaweicloud/huaweicloud-skills/master/skills/${category}/${service}/${name}/SKILL.md
```

### Step 3: Install

```bash
npx skills add https://gitcode.com/huaweicloud/huaweicloud-skills.git#master --skill <skill-name> -y
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `python` not found | Install Python 3.6+; try `python3` |
| SyntaxError / Python 2.x | Run with `python3` explicitly |
| `Failed to fetch index` | Check network to `gitcode.com` |
| GitCode 404 | Verify `category`/`service`/`name` from search |
| No results | Try broader keywords, switch CN↔EN, or list all with `-c "computing"` |

## Notes

- Read-only skill, no cloud resources created
- Index repo: `https://gitcode.com/2501_91318609/skills-for-index` (branch: `main`)
- Skills repo: `https://github.com/huaweicloud/huaweicloud-skills` (branch: `master`)
- See [scripts/search-skills.py](scripts/search-skills.py) for search script details
