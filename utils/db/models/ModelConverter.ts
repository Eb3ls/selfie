import { ObjectId } from 'mongodb';

export type ConvertToString<T> = {
	[K in keyof T]: T[K] extends Date | ObjectId
		? string
		: T[K] extends ObjectId | undefined
		? string
		: T[K] extends ObjectId | null
		? string
		: T[K] extends ObjectId[]
		? string[]
		: T[K] extends Date | null
		? string
		: T[K] extends Date[]
		? string[]
		: T[K];
};