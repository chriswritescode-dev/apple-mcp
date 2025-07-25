import { spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { escapeShellArg } from './security.js';

interface SqliteResult {
  stdout: string;
  stderr: string;
}

/**
 * Execute a SQLite query safely using spawn instead of exec
 * This prevents shell injection attacks
 */
export async function executeSqliteQuery(
  dbPath: string, 
  query: string,
  parameters: (string | number)[] = []
): Promise<SqliteResult> {
  return new Promise((resolve, reject) => {
    // Build the query with parameter placeholders
    let parameterizedQuery = query;
    let paramIndex = 0;
    
    // Replace ? placeholders with actual values (SQLite doesn't support true parameterization via CLI)
    // We'll escape the values properly
    for (const param of parameters) {
      const escaped = typeof param === 'string' 
        ? `'${param.replace(/'/g, "''")}'`  // SQL string escaping
        : String(param);
      
      parameterizedQuery = parameterizedQuery.replace('?', escaped);
      paramIndex++;
    }
    
    // Use spawn to avoid shell injection
    const sqlite = spawn('sqlite3', [
      '-json',
      dbPath,
      parameterizedQuery
    ]);
    
    let stdout = '';
    let stderr = '';
    
    sqlite.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    sqlite.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    sqlite.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQLite process exited with code ${code}: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
    
    sqlite.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Build a safe SQL IN clause
 */
export function buildSafeInClause(values: string[]): { clause: string, params: string[] } {
  if (values.length === 0) {
    return { clause: '(NULL)', params: [] };
  }
  
  const placeholders = values.map(() => '?').join(',');
  return { 
    clause: `(${placeholders})`, 
    params: values 
  };
}

/**
 * Validate and sanitize a limit value
 */
export function sanitizeLimit(limit: number, max: number = 100): number {
  const parsed = Math.floor(limit);
  if (isNaN(parsed) || parsed < 1) {
    return 10;
  }
  return Math.min(parsed, max);
}