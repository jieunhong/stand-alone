
import {
    createRxDatabase,
    RxDatabase,
    RxCollection,
    RxJsonSchema,
    addRxPlugin
} from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Enable dev mode plugin in development
if (process.env.NODE_ENV === 'development') {
    addRxPlugin(RxDBDevModePlugin);
}

// Interfaces
export interface DailyCheckDoc {
    date: string;
    sleep: number;
    nutrition: number;
    distress: number;
    impulse: number;
    exercise: number;
    score: number;
    diary?: string;
}

export interface GoalDoc {
    id: string; // 'current'
    text: string;
    duration: number;
    startDate: string;
}

// Collections Types
export type DailyCheckCollection = RxCollection<DailyCheckDoc>;
export type GoalCollection = RxCollection<GoalDoc>;

export type DatabaseCollections = {
    daily_checks: DailyCheckCollection;
    goals: GoalCollection;
}

export type MyDatabase = RxDatabase<DatabaseCollections>;

// Schemas
const dailyCheckSchema: RxJsonSchema<DailyCheckDoc> = {
    version: 0,
    primaryKey: 'date',
    type: 'object',
    properties: {
        date: {
            type: 'string',
            maxLength: 10
        },
        sleep: { type: 'number', minimum: 0, maximum: 5 },
        nutrition: { type: 'number', minimum: 0, maximum: 5 },
        distress: { type: 'number', minimum: 0, maximum: 5 },
        impulse: { type: 'number', minimum: 0, maximum: 5 },
        exercise: { type: 'number', minimum: 0, maximum: 5 },
        score: { type: 'number' },
        diary: { type: 'string' }
    },
    required: ['date', 'sleep', 'nutrition', 'distress', 'impulse', 'exercise', 'score']
};

const goalSchema: RxJsonSchema<GoalDoc> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        text: { type: 'string' },
        duration: { type: 'number' },
        startDate: { type: 'string' }
    },
    required: ['id', 'text', 'duration', 'startDate']
};

let dbPromise: Promise<MyDatabase> | null = null;
let currentUserId: string | null = null;

const _create = async (userId: string = 'guest') => {
    let storage: any = getRxStorageDexie();
    if (process.env.NODE_ENV === 'development') {
        storage = wrappedValidateAjvStorage({ storage });
    }

    const db = await createRxDatabase<DatabaseCollections>({
        name: `stand_alone_db_${userId}`,
        storage
    });

    await db.addCollections({
        daily_checks: {
            schema: dailyCheckSchema
        },
        goals: {
            schema: goalSchema
        }
    });

    return db;
};

export const getDatabase = (userId?: string) => {
    const id = userId || 'guest';
    if (!dbPromise || currentUserId !== id) {
        currentUserId = id;
        dbPromise = _create(id);
    }
    return dbPromise;
};

export const clearDatabase = () => {
    dbPromise = null;
    currentUserId = null;
};
