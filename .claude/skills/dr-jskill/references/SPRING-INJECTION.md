# Spring Injection Standards

## @Resource vs @Autowired

Use **@Resource** (JSR-250) instead of @Autowired for field injection.

### Why @Resource

| Aspect | @Resource | @Autowired |
|--------|----------|----------|
| Standard | JSR-250 | Spring-specific |
| Resolution | By name first | By type first |
| Flexibility | More predictable | Can cause surprises |
| Null injection | Optional support | Required by default |

### Preferred Style - Constructor Injection

```java
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
}
```

### Alternative - @Resource Field Injection

```java
@Service
public class UserService {
    
    @Resource
    private UserRepository userRepository;
}
```

### ❌ DON'T - @Autowired Field

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
}
```

## Package Structure

### Large Project Structure

```
com.example.app/
├── config/              # Configuration classes
│   ├── AppConfig.java
│   └── SecurityConfig.java
├── controller/         # REST controllers
│   ├── UserController.java
│   └── Advice/
│       └── GlobalExceptionHandler.java
├── service/             # Business logic
│   ├── UserService.java
│   └── impl/
│       └── UserServiceImpl.java
├── repository/          # Data access
│   ├── UserRepository.java
│   └── custom/
│       └── UserRepositoryCustom.java
├── entity/             # JPA entities
│   ├── User.java
│   └── embed/
│       └── Address.java
├── dto/                # Data transfer objects
│   ├── request/
│   │   └── CreateUserRequest.java
│   └── response/
│       └── UserResponse.java
├── mapper/              # Entity <-> DTO mapping
│   └── UserMapper.java
├── enums/               # Enumerations
│   └── UserStatus.java
├── exception/          # Custom exceptions
│   └── UserNotFoundException.java
└── util/               # Utilities
    └── StringUtils.java
```

### Small Project Structure

```
com.example.app/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
└── config/
```

## Component Scanning

### Explicit Scanning (Recommended)

```java
@Configuration
@ComponentScan(
    basePackages = "com.example.app",
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = ".*\\.config\\..*"
    )
)
public class AppConfig {}
```

### Avoid

```java
// Don't use component scanning without basePackages
@Configuration
@ComponentScan  // Scans current package - too broad
public class AppConfig {}
```

## Transaction Management

### Service Layer

```java
@Service
@Transactional(readOnly = true)
public class UserService {
    
    @Transactional
    public User create(User user) {
        // ...
    }
}
```

### Rules
- @Transactional on **Service** methods, notController
- Use `readOnly = true` for query methods
- Avoid transaction on private methods