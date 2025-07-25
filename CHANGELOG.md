# Changelog

## [Unreleased] - Security Update

### Added
- Comprehensive input validation using Zod schemas
- Rate limiting to prevent abuse (configurable per operation type)
- Token-based authentication support via `MCP_AUTH_TOKEN`
- Audit logging for all operations
- SQL injection protection with parameterized queries
- Command injection prevention for AppleScript
- Security documentation (SECURITY.md)
- Environment configuration support (.env file)

### Changed
- All user inputs are now validated before use
- AppleScript commands use proper escaping
- Database queries use parameterized statements
- Shell commands use spawn() instead of exec()
- Error messages sanitized to prevent information disclosure

### Security
- Fixed command injection vulnerabilities in AppleScript execution
- Fixed SQL injection vulnerabilities in Messages database queries
- Added protection against directory traversal attacks
- Implemented rate limiting to prevent DoS attacks
- Added authentication layer for production deployments

### Configuration
- New environment variables:
  - `MCP_AUTH_TOKEN` - Authentication token
  - `ENABLE_RATE_LIMITING` - Toggle rate limiting (default: true)
  - `ENABLE_AUDIT_LOGGING` - Toggle audit logging (default: true)
  - `MAX_MESSAGE_LENGTH` - Maximum message length (default: 10000)
  - `MAX_SEARCH_RESULTS` - Maximum search results (default: 100)

## Previous Versions

See commit history for earlier changes.