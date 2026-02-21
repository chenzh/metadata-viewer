import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { execSync } from 'child_process'

// 获取 git 最后一次提交时间
const getGitCommitTime = () => {
  try {
    return execSync('git log -1 --format="%cd" --date=format:"%Y年%m月%d日 %H:%M:%S"').toString().trim()
  } catch {
    return '未知时间'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __GIT_COMMIT_TIME__: JSON.stringify(getGitCommitTime()),
  },
});
