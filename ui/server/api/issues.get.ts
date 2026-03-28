import { fetchOpenIssues } from '../utils/lane-git'

export default defineEventHandler(async () => {
  return await fetchOpenIssues()
})
