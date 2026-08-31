import { openDB, DBSchema } from 'idb';

export interface OfflineTransaction {
    id: string;
    material_type: string;
    weight_kg: number;
    price: number;
    synced: boolean;
    created_at: string;
}

interface KabadiDB extends DBSchema {
    transactions: {
        key: string;
        value: OfflineTransaction;
    };
}

const DB_NAME = 'kabadiwala_offline_db';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<KabadiDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('transactions')) {
                db.createObjectStore('transactions', { keyPath: 'id' });
            }
        },
    });
}

export async function saveTransactionOffline(tx: {
    material_type: string;
    weight_kg: number;
    price: number;
    synced?: boolean;
}): Promise<OfflineTransaction> {
    const db = await initDB();
    const entry: OfflineTransaction = {
        material_type: tx.material_type,
        weight_kg: Number(tx.weight_kg),
        price: Number(tx.price),
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        synced: tx.synced ?? false,
        created_at: new Date().toISOString(),
    };
    await db.put('transactions', entry);
    return entry;
}

export async function markTransactionsAsSynced(ids: string[]) {
    const db = await initDB();
    const tx = db.transaction('transactions', 'readwrite');
    for (const id of ids) {
        const item = await tx.store.get(id);
        if (item) {
            item.synced = true;
            await tx.store.put(item);
        }
    }
    await tx.done;
}

export async function getOfflineTransactions(): Promise<OfflineTransaction[]> {
    const db = await initDB();
    return db.getAll('transactions');
}