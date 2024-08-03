// 1. 将vanilla.ts中的所有export的内容导出（不含export default的内容）
export * from './vanilla.ts'

// 2. 将react.ts中的所有export的内容导出（不含export default的内容）
export * from './react.ts'

// 3. 将react.ts中的export default的内容导出
export { default } from './react.ts'

// 在另一个文件中可以通过：
// import create, { useStore，createStore } from './index.ts'

// 实现导入，其中：
// create对应react.ts中的export default ()=>({})
// useStore对应react.ts中的export function useStore(){}
// createStore对应vanilla.ts中的export const createStore = ()=>({})
