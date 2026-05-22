# Review

## Checks
- 
pm run build passed.
- Verified frontend now resolves cross-origin production API base URL to same-origin /api/v1.
- Added Vercel rewrite from /api/v1/:path* to https://learn-api.020417.xyz/api/v1/:path*.

## Risk notes
- If backend enforces strict Host/Origin checks at application layer, allow Vercel proxy traffic accordingly.
- Current sandbox does not have external CCG model wrapper available (~/.claude/bin/codeagent-wrapper missing), so dual-model review could not be executed.
