import { openDB } from "idb";
export type QueuedOperation={id:string;type:"inventory_update";payload:Record<string,unknown>;createdAt:string};
const db=()=>openDB("swasthya-setu",1,{upgrade(database){if(!database.objectStoreNames.contains("syncQueue"))database.createObjectStore("syncQueue",{keyPath:"id"});}});
export async function queueOperation(operation:QueuedOperation){return (await db()).put("syncQueue",operation)}
export async function pendingOperations(){return (await db()).getAll("syncQueue") as Promise<QueuedOperation[]>}
export async function clearOperations(){return (await db()).clear("syncQueue")}
