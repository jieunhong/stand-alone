
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
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';

// Enable dev mode plugin in development
if (process.env.NODE_ENV === 'development') {
    addRxPlugin(RxDBDevModePlugin);
}
addRxPlugin(RxDBMigrationSchemaPlugin);

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
    tomorrowResolve?: string;
}

export interface GoalDoc {
    id: string; // 'current'
    text: string;
    duration: number;
    startDate: string;
}

export interface AchievementDoc {
    id: string; // achievement_id
    unlockedAt: string;
}

export interface AchievementDefinitionDoc {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'streak' | 'score' | 'milestone';
    targetValue: number;
    displayOrder: number;
}

// Collections Types
export type DailyCheckCollection = RxCollection<DailyCheckDoc>;
export type GoalCollection = RxCollection<GoalDoc>;
export type AchievementCollection = RxCollection<AchievementDoc>;
export type AchievementDefinitionCollection = RxCollection<AchievementDefinitionDoc>;

export type DatabaseCollections = {
    daily_checks: DailyCheckCollection;
    goals: GoalCollection;
    unlocked_achievements: AchievementCollection;
    achievement_definitions: AchievementDefinitionCollection;
}

export type MyDatabase = RxDatabase<DatabaseCollections>;

// Schemas
const dailyCheckSchema: RxJsonSchema<DailyCheckDoc> = {
    version: 1,
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
        diary: { type: 'string' },
        tomorrowResolve: { type: 'string' }
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

const achievementSchema: RxJsonSchema<AchievementDoc> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        unlockedAt: { type: 'string' }
    },
    required: ['id', 'unlockedAt']
};

const achievementDefinitionSchema: RxJsonSchema<AchievementDefinitionDoc> = {
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        title: { type: 'string' },
        description: { type: 'string' },
        icon: { type: 'string' },
        type: { type: 'string' },
        targetValue: { type: 'number' },
        displayOrder: { type: 'number' }
    },
    required: ['id', 'title', 'description', 'icon', 'type', 'targetValue', 'displayOrder']
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
            schema: dailyCheckSchema,
            migrationStrategies: {
                // Migration strategy from version 0 to 1
                1: (oldDoc: any) => {
                    oldDoc.tomorrowResolve = ''; // Initialize new field
                    return oldDoc;
                }
            }
        },
        goals: {
            schema: goalSchema
        },
        unlocked_achievements: {
            schema: achievementSchema
        },
        achievement_definitions: {
            schema: achievementDefinitionSchema,
            migrationStrategies: {
                1: (oldDoc: any) => {
                    oldDoc.displayOrder = 0;
                    return oldDoc;
                }
            }
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
