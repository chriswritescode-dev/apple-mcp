import { z } from 'zod';

// Input validation schemas
export const phoneNumberSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number too long')
  .regex(/^[+]?[0-9\s\-().]+$/, 'Invalid phone number format')
  .transform(val => val.replace(/[^0-9+]/g, ''));

export const emailSchema = z.string()
  .email('Invalid email address')
  .max(254, 'Email address too long');

export const searchQuerySchema = z.string()
  .min(1, 'Search query cannot be empty')
  .max(500, 'Search query too long')
  .transform(val => val.trim());

export const messageContentSchema = z.string()
  .min(1, 'Message cannot be empty')
  .max(10000, 'Message too long');

export const noteContentSchema = z.string()
  .max(50000, 'Note content too long');

export const folderNameSchema = z.string()
  .max(255, 'Folder name too long')
  .regex(/^[^/\\:*?"<>|]+$/, 'Invalid folder name');

export const filePathSchema = z.string()
  .max(1024, 'File path too long')
  .refine(path => !path.includes('..'), 'Path traversal detected');

// AppleScript escaping functions
export function escapeAppleScriptString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

export function escapeAppleScriptIdentifier(str: string): string {
  // Remove any characters that could break out of an identifier context
  return str.replace(/[^a-zA-Z0-9_]/g, '');
}

// SQL escaping functions
export function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

export function escapeSqlIdentifier(str: string): string {
  return str.replace(/[^a-zA-Z0-9_]/g, '');
}

// Shell command escaping
export function escapeShellArg(arg: string): string {
  // For shell arguments, wrap in single quotes and escape any single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

// Dangerous pattern detection
const DANGEROUS_PATTERNS = [
  /tell\s+application\s+"System\s+Events"/i,
  /do\s+shell\s+script/i,
  /osascript/i,
  /eval/i,
  /exec/i,
  /system\(/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /UPDATE\s+SET/i,
  /INSERT\s+INTO/i,
];

export function containsDangerousPattern(input: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(input));
}

// Rate limiting helpers
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  check(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || entry.resetAt <= now) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + this.windowMs
      });
      return true;
    }
    
    if (entry.count >= this.maxRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }
  
  reset(key: string): void {
    this.limits.delete(key);
  }
}

// Create rate limiters for different operations
export const rateLimiters = {
  messages: new RateLimiter(10, 60000), // 10 messages per minute
  emails: new RateLimiter(20, 60000), // 20 emails per minute
  search: new RateLimiter(30, 60000), // 30 searches per minute
  write: new RateLimiter(5, 60000), // 5 write operations per minute
  global: new RateLimiter(100, 60000), // 100 total operations per minute
};

// Validation error handling
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validate and sanitize functions
export function validatePhoneNumber(phone: string): string {
  try {
    return phoneNumberSchema.parse(phone);
  } catch (error) {
    throw new ValidationError('Invalid phone number', 'phoneNumber');
  }
}

export function validateEmail(email: string): string {
  try {
    return emailSchema.parse(email);
  } catch (error) {
    throw new ValidationError('Invalid email address', 'email');
  }
}

export function validateSearchQuery(query: string): string {
  try {
    const validated = searchQuerySchema.parse(query);
    if (containsDangerousPattern(validated)) {
      throw new ValidationError('Search query contains forbidden patterns', 'searchQuery');
    }
    return validated;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid search query', 'searchQuery');
  }
}

export function validateMessageContent(content: string): string {
  try {
    const validated = messageContentSchema.parse(content);
    if (containsDangerousPattern(validated)) {
      throw new ValidationError('Message contains forbidden patterns', 'message');
    }
    return validated;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid message content', 'message');
  }
}

// AppleScript builder for safer script construction
export class AppleScriptBuilder {
  private script: string[] = [];
  
  tell(application: string): this {
    const safe = escapeAppleScriptString(application);
    this.script.push(`tell application "${safe}"`);
    return this;
  }
  
  endTell(): this {
    this.script.push('end tell');
    return this;
  }
  
  setVariable(name: string, value: string): this {
    const safeName = escapeAppleScriptIdentifier(name);
    const safeValue = escapeAppleScriptString(value);
    this.script.push(`set ${safeName} to "${safeValue}"`);
    return this;
  }
  
  raw(line: string): this {
    this.script.push(line);
    return this;
  }
  
  build(): string {
    return this.script.join('\n');
  }
}

// Audit logging
export interface AuditLogEntry {
  timestamp: Date;
  operation: string;
  user?: string;
  details: Record<string, any>;
  success: boolean;
  error?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  
  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    this.logs.push({
      ...entry,
      timestamp: new Date()
    });
    
    // In production, this would write to a file or database
    console.error(`[AUDIT] ${entry.operation}:`, {
      success: entry.success,
      user: entry.user,
      details: entry.details,
      error: entry.error
    });
  }
  
  getRecentLogs(count: number = 100): AuditLogEntry[] {
    return this.logs.slice(-count);
  }
}

export const auditLogger = new AuditLogger();

// Sanitize limit helper
export function sanitizeLimit(limit: number, max: number = 100): number {
  const parsed = Math.floor(limit);
  if (isNaN(parsed) || parsed < 1) {
    return 10;
  }
  return Math.min(parsed, max);
}

// Environment-based configuration
export const securityConfig = {
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
  authToken: process.env.MCP_AUTH_TOKEN,
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || '10000', 10),
  maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS || '100', 10),
};

// Authentication check
export function checkAuthentication(token?: string): boolean {
  if (!securityConfig.authToken) {
    return true; // No auth configured
  }
  return token === securityConfig.authToken;
}