# Supabase Transaction Manager

Since Supabase doesn't support native transactions, this utility provides a way to implement transaction-like behavior in your application. It tracks database operations and can roll them back if something goes wrong.

## Basic Usage

The simplest way to use the transaction manager is with the `withTransaction` helper:

```typescript
import { withTransaction } from '@/lib/utils/supabaseTransaction';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/types';

export async function someApiRoute(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    // Use withTransaction to automatically handle rollbacks on error
    return await withTransaction(supabase, async (txManager) => {
      // Perform your database operations
      const { data: item, error } = await supabase
        .from('some_table')
        .insert({ name: 'Test Item' })
        .select()
        .single();
        
      if (error) {
        throw new Error('Failed to insert item');
      }
      
      // Track the insert operation so it can be rolled back if needed
      txManager.trackInsert('some_table', item.id);
      
      // Perform more operations...
      
      // If any operation throws an error, all tracked operations will be rolled back
      
      // Return your response
      return { success: true, data: item };
    });
  } catch (error) {
    // Any errors will be caught here after rollback has occurred
    return { error: 'Operation failed' };
  }
}
```

## Manual Transaction Management

If you need more control, you can create and manage the transaction manager yourself:

```typescript
import { SupabaseTransactionManager } from '@/lib/utils/supabaseTransaction';

// Create a transaction manager
const txManager = new SupabaseTransactionManager(supabase);

try {
  // Perform operations and track them
  const { data: item } = await supabase.from('some_table').insert({ name: 'Test' }).select().single();
  txManager.trackInsert('some_table', item.id);
  
  // More operations...
  
  // If everything succeeds, commit the transaction
  txManager.commit();
} catch (error) {
  // If anything fails, roll back all operations
  await txManager.rollback();
  throw error;
}
```

## API Reference

### `withTransaction<T>(supabase: SupabaseClient, fn: (txManager: SupabaseTransactionManager) => Promise<T>): Promise<T>`

Executes a function with transaction-like behavior. If the function throws an error, all tracked operations will be rolled back.

### `SupabaseTransactionManager`

A class to help manage transaction-like behavior with Supabase.

#### Methods

- `trackInsert(table: string, id: string): void` - Track an insert operation
- `trackUpdate(table: string, id: string, originalData: Record<string, unknown>): void` - Track an update operation
- `trackDelete(table: string, id: string, originalData: Record<string, unknown>): void` - Track a delete operation
- `rollback(): Promise<void>` - Roll back all tracked operations in reverse order
- `commit(): void` - Clear all tracked operations (call this after a successful transaction)
- `getOperations(): TransactionRecord[]` - Get the current list of tracked operations

## Important Notes

1. This is not a true database transaction. Operations are executed immediately and only rolled back if an error occurs.
2. Rollbacks happen in reverse order (LIFO) to maintain data integrity.
3. If a rollback operation itself fails, the manager will log the error and continue with other rollbacks.
4. Be careful with complex operations that might leave your database in an inconsistent state if rollback fails. 