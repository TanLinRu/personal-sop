# Java Coding Standards

## Formatting

### Code Style
- **4 spaces** indentation (no tabs)
- **120 char** line length max
- One public class per file
- Blank lines between logically related code blocks

### File Structure
```
package com.example.app;

import java.util.List;
import javax.persistence.Entity;

/**
 * Class description for Javadoc.
 *
 * @author Developer Name
 * @since 1.0.0
 */
@Entity
public class User {
    
    // Constants first
    private static final Logger LOG = LoggerFactory.getLogger(User.class);
    private static final int DEFAULT_LIMIT = 100;
    
    // Fields
    private Long id;
    private String name;
    
    // Constructors
    public User() {}
    
    public User(String name) {
        this.name = name;
    }
    
    // Public methods
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    // Package-private or protected methods
    void internalMethod() {
        // ...
    }
}
```

### Member Order
1. Static constants
2. Instance fields
3. Constructors
4. Public methods
5. Protected methods
6. Package-private methods
7. Private methods (at end)

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Class/Record | PascalCase | `UserService` |
| Interface | PascalCase | `UserRepository` |
| Method | camelCase | `findById()` |
| Field | camelCase | `userName` |
| Constant | SCREAMING_SNAKE | `MAX_SIZE` |
| Package | lowercase | `com.example.app.service` |
| Enum | PascalCase | `UserStatus` |

## Javadoc Requirements

### Class Javadoc
```java
/**
 * A brief description of what this class does.
 *
 * <p>More detailed description if needed.
 *
 * @author John Doe
 * @since 1.0.0
 * @see OtherClass
 */
public class UserService {}
```

### Method Javadoc
```java
/**
 * Finds a user by their unique identifier.
 *
 * @param id the user's unique identifier
 * @return the user if found, null otherwise
 * @throws EntityNotFoundException if id is null
 */
public User findById(Long id) {}
```

## Code Organization

### Imports
```java
// java.* first (ordered alphabetically)
import java.util.List;
import java.util.Optional;

// javax.* second
import javax.persistence.Entity;

// third-party
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// local packages
import com.example.app.repository.UserRepository;
```

### Vertical Spacing
```java
public class UserService {
    
    // 1 blank line after fields
    private final UserRepository repository;
    
    // 1 blank line before constructor
    public UserService(UserRepository repository) {
        this.repository = repository;
    }
    
    // 1 blank line between methods
    public User findById(Long id) {
        return repository.findById(id).orElse(null);
    }
    
    public List<User> findAll() {
        return repository.findAll();
    }
}
```

## Record Usage

Use records for immutable DTOs:

```java
// Good - simple DTO
public record UserDTO(Long id, String name, String email) {}

// Good - with validation
public record CreateUserRequest(String name, String email) {
    public CreateUserRequest {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email required");
        }
    }
}
```

Avoid records for:
- Entities (need id, mutable)
- Entities with JPA relationships
- Classes requiring manual equals/hashCode