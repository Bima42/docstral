/// <reference types="vite/client" />
declare global {
    interface Window {
        electronAPI: {
            ping: () => Promise<string>;
        };
    }
}
export {};