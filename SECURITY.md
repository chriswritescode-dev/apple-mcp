# Security Guide for Apple MCP

This document outlines the security features and best practices for the Apple MCP server.

## Security Features

### 1. Input Validation

All user inputs are validated using Zod schemas to prevent injection attacks:

- **Phone numbers**: Validated for format and length
- **Email addresses**: RFC-compliant validation
- **Search queries**: Sanitized to prevent malicious patterns
- **Message content**: Length limits and content validation
- **File paths**: Protected against directory traversal

### 2. Command Injection Prevention

- **AppleScript**: All inputs are escaped using `escapeAppleScriptString()`
- **SQL queries**: Parameterized queries prevent SQL injection
- **Shell commands**: Using `spawn()` instead of `exec()` with proper argument arrays

### 3. Rate Limiting

Configurable rate limits protect against abuse:

- Messages: 10 per minute (default)
- Emails: 20 per minute (default)
- Search operations: 30 per minute (default)
- Write operations: 5 per minute (default)
- Global limit: 100 operations per minute (default)

### 4. Authentication

Optional token-based authentication:

```bash
# Set in environment
export MCP_AUTH_TOKEN=your-secret-token-here

# Include in requests
Authorization: Bearer your-secret-token-here
```

### 5. Audit Logging

All operations are logged with:
- Timestamp
- Operation type
- Success/failure status
- Error details (if applicable)
- User information (when auth is enabled)

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_AUTH_TOKEN` | Authentication token | None (disabled) |
| `ENABLE_RATE_LIMITING` | Enable rate limiting | `true` |
| `ENABLE_AUDIT_LOGGING` | Enable audit logging | `true` |
| `MAX_MESSAGE_LENGTH` | Maximum message length | `10000` |
| `MAX_SEARCH_RESULTS` | Maximum search results | `100` |

## Security Best Practices

### 1. Enable Authentication

For production use, always enable authentication:

```bash
export MCP_AUTH_TOKEN=$(openssl rand -hex 32)
```

### 2. Restrict Access

- Grant only necessary permissions in macOS System Preferences
- Use the principle of least privilege
- Regularly review granted permissions

### 3. Monitor Logs

Regularly review audit logs for:
- Failed authentication attempts
- Rate limit violations
- Unusual patterns of usage

### 4. Update Dependencies

Keep dependencies up to date:

```bash
bun update
```

### 5. Network Security

- Run the MCP server on localhost only
- Use a reverse proxy with TLS if remote access is needed
- Implement IP whitelisting if possible

## Security Checklist

Before deploying to production:

- [ ] Set a strong `MCP_AUTH_TOKEN`
- [ ] Enable rate limiting
- [ ] Enable audit logging
- [ ] Review all environment variables
- [ ] Test input validation with edge cases
- [ ] Verify error messages don't leak sensitive info
- [ ] Check file permissions on `.env`
- [ ] Review macOS permissions granted to the app

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. Email security concerns to the maintainers
3. Include steps to reproduce the issue
4. Allow time for a fix before public disclosure

## Security Updates

This document was last updated with security enhancements including:

- Input validation for all user inputs
- Command injection prevention
- SQL injection protection
- Rate limiting implementation
- Authentication system
- Audit logging
- Secure error handling

Stay updated with the latest security patches by watching the repository.