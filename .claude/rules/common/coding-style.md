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

---

## @Transactional Configuration (Required)

All Service methods must follow these patterns for proper transaction management and performance optimization.

### Query Methods (Read-Only)

```java
@Transactional(readOnly = true)
public List<Warehouse> findAll() {
    return this.list();
}

@Transactional(readOnly = true)
public Warehouse findById(Long id) {
    return this.getById(id);
}
```

**Why**: `readOnly = true` enables:
- Hibernate skips dirty-checking
- Auto-flush is skipped
- Driver can route to read replicas

### Write Methods (Create/Update/Delete)

```java
@Transactional(rollbackFor = Exception.class)
public Warehouse createWarehouse(WarehouseDTO dto) {
    // ... save logic
}

@Transactional(rollbackFor = Exception.class)
public Warehouse updateWarehouse(Long id, WarehouseDTO dto) {
    // ... update logic
}

@Transactional(rollbackFor = Exception.class)
public boolean deleteWarehouse(Long id) {
    return this.removeById(id);
}
```

**Why**: `rollbackFor = Exception.class` ensures:
- Checked exceptions trigger rollback (default: only unchecked)
- All exceptions lead to atomic transaction

### Exception Handling (Required)

Always use custom exceptions for domain errors:

```java
// Custom exception
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

// Global exception handler (RFC 7807)
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Resource Not Found");
        return pd;
    }
}
```

### Common Pitfalls (Avoid)

```java
// ❌ WRONG: Default rollback only covers unchecked exceptions
@Transactional
public void processFile(String path) throws IOException {
    // IOException won't trigger rollback!
}

// ✅ CORRECT: Explicit rollback configuration
@Transactional(rollbackFor = Exception.class)
public void processFile(String path) throws IOException {
    // Now rolls back on IOException
}

// ❌ WRONG: Try-catch swallows exception, no rollback
@Transactional
public void createOrder(Order order) {
    try {
        orderRepository.save(order);
    } catch (Exception e) {
        log.error("Error", e);  // Exception swallowed - transaction commits!
    }
}

// ✅ CORRECT: Rethrow or manual rollback
@Transactional(rollbackFor = Exception.class)
public void createOrder(Order order) {
    try {
        orderRepository.save(order);
    } catch (Exception e) {
        throw new RuntimeException("Failed to create order", e);  // Rethrow
    }
}
```

### Summary Checklist

| Method Type          | Annotation                                      | Purpose                  |
| -------------------- | ----------------------------------------------- | ------------------------ |
| Query (read)         | `@Transactional(readOnly = true)`               | Performance optimization |
| Create/Update/Delete | `@Transactional(rollbackFor = Exception.class)` | Atomic transaction       |
| Internal method call | Avoid or use self-injection                     | Proxy bypass prevention  |

---

## DTO/VO/Entity Patterns

### Entity (with manual equals/hashCode)
```java
@Data
@TableName("warehouse")
public class Warehouse {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    // Manual equals/hashCode based on business ID
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Warehouse that = (Warehouse) o;
        return id != null && id.equals(that.id);
    }
}
```

### DTO (with @Builder)
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Warehouse data transfer object")
public class WarehouseDTO {
    @Schema(description = "Warehouse ID")
    private Long id;
}
```

---

## Git Commit Style

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```