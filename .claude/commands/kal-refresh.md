---
description: Refresh the kaleidoscope dashboard — update git status, rebuild, commit + push both repos
allowed-tools: Bash(bash:*), Bash(~/CODEVENTURES/kaleidoscope/kal-private/tools/refresh.sh:*)
---

## Refresh kaleidoscope

Running the one-shot refresh (update-status → build-dashboard → commit kal-private → commit + push kal-public):

!`bash ~/CODEVENTURES/kaleidoscope/kal-private/tools/refresh.sh`

Summarize the output above for me:
- which projects' git fields changed (branch / last commit),
- whether `kal-private` committed,
- whether `kal-public` was pushed (if so, GitHub Pages will redeploy at https://maerlined.github.io/kal-public/).

If the script reported nothing changed, just say everything was already up to date.
