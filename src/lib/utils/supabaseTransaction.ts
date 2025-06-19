import { SupabaseClient } from '@supabase/supabase-js';

/**
 * A record of operations performed in a transaction-like sequence
 * that can be rolled back if needed
 */
export interface TransactionRecord {
  table: string;
  id: string;
  operation: 'insert' | 'update' | 'delete';
  originalData?: Record<string, unknown>;
}

/**
 * A utility class to help manage transaction-like behavior with Supabase
 * Since Supabase doesn't support true transactions, this helps track operations
 * and roll them back if needed
 */
export class SupabaseTransactionManager {
  private supabase: SupabaseClient;
  private operations: TransactionRecord[] = [];

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Track an insert operation
   * @param table The table name
   * @param id The ID of the inserted record
   */
  trackInsert(table: string, id: string): void {
    this.operations.push({
      table,
      id,
      operation: 'insert'
    });
  }

  /**
   * Track an update operation
   * @param table The table name
   * @param id The ID of the updated record
   * @param originalData The original data before the update
   */
  trackUpdate(table: string, id: string, originalData: Record<string, unknown>): void {
    this.operations.push({
      table,
      id,
      operation: 'update',
      originalData
    });
  }

  /**
   * Track a delete operation
   * @param table The table name
   * @param id The ID of the deleted record
   * @param originalData The original data before deletion
   */
  trackDelete(table: string, id: string, originalData: Record<string, unknown>): void {
    this.operations.push({
      table,
      id,
      operation: 'delete',
      originalData
    });
  }

  /**
   * Roll back all tracked operations in reverse order
   */
  async rollback(): Promise<void> {
    // Process operations in reverse order (LIFO)
    for (const op of [...this.operations].reverse()) {
      try {
        switch (op.operation) {
          case 'insert':
            // For inserts, we delete the record
            await this.supabase.from(op.table).delete().eq('id', op.id);
            break;
          case 'update':
            // For updates, we restore the original data
            if (op.originalData) {
              await this.supabase.from(op.table).update(op.originalData).eq('id', op.id);
            }
            break;
          case 'delete':
            // For deletes, we re-insert the original data
            if (op.originalData) {
              await this.supabase.from(op.table).insert(op.originalData);
            }
            break;
        }
      } catch (error) {
        console.error(`Error rolling back operation on ${op.table}:`, error);
        // Continue with other rollbacks even if one fails
      }
    }

    // Clear the operations after rollback
    this.operations = [];
  }

  /**
   * Clear all tracked operations (call this after a successful transaction)
   */
  commit(): void {
    this.operations = [];
  }

  /**
   * Get the current list of tracked operations
   */
  getOperations(): TransactionRecord[] {
    return [...this.operations];
  }
}

/**
 * Execute a function with transaction-like behavior
 * If the function throws an error, all tracked operations will be rolled back
 * 
 * @param supabase The Supabase client
 * @param fn The function to execute with the transaction manager
 * @returns The result of the function
 */
export async function withTransaction<T>(
  supabase: SupabaseClient,
  fn: (txManager: SupabaseTransactionManager) => Promise<T>
): Promise<T> {
  const txManager = new SupabaseTransactionManager(supabase);
  
  try {
    const result = await fn(txManager);
    txManager.commit();
    return result;
  } catch (error) {
    await txManager.rollback();
    throw error;
  }
} 