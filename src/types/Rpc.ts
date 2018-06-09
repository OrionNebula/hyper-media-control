declare global {
  interface Window {
    rpc: RpcClient
  }
}

export interface RpcClient {
  on (ev: string, fn: (...args: any[]) => void): void
  once (ev: string, fn: (...args: any[]) => void): void
  emit (ev: string, data: any): void
  removeListener (ev: string, fn: (...args: any[]) => void): void
  removeAllListeners (): void
  destroy (): void
  ipcListener (event: any, { ch, data }: { ch: string, data: any }): void
}
