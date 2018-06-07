declare global {
  interface Window {
    rpc: RpcClient
  }
}

export interface RpcClient {
  on (ev: string, fn: (...args: any[]) => void)
  once (ev: string, fn: (...args: any[]) => void)
  emit (ev: string, data: any)
  removeListener (ev: string, fn: (...args: any[]) => void)
  removeAllListeners ()
  destroy ()
  ipcListener (event: any, { ch, data }: { ch: string, data: any })
}
