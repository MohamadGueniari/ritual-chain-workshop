/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS?: string;
  readonly VITE_RITUAL_EXECUTOR_ADDRESS?: string;
  readonly VITE_RITUAL_CHAIN_ID?: string;
  readonly VITE_RITUAL_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
