# Immutability (CRITICAL)

Always create new objects, NEVER mutate existing ones.

```javascript
// Wrong - mutation
user.name = "new";
return user;

// Correct - immutable update
return { ...user, name: "new" };
```

## Core Principles

### KISS
- Prefer simplest solution
- Avoid premature optimization

### DRY
- Extract repeated logic
- Avoid copy-paste

### YAGNI
- Don't add features until needed

## Git Commit Style

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```