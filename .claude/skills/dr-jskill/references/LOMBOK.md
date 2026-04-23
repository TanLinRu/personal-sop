# Lombok vs Native Java

## Policy

**NEVER use Lombok in generated projects** (enforced by Maven Enforcer).

This document explains why and when native Java is preferred.

## Why No Lombok

| Reason | Explanation |
|--------|-------------|
| Hidden magic | Code behavior not visible in source |
| IDE issues | Sometimes requires annotation processing |
| Java 16+ features | Records, sealed classes reduce need |
| Learning curve | New developers must learn Lombok |

## Native Alternatives

### @Data →@Getter/@Setter or Records

```java
// ❌ DON'T - @Data generates too much
@Data
public class User {
    private String name;
}

// ✅ DO - Entity with controlled mutation
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String name;
}

// ✅ DO - DTO with record (immutable)
public record UserDTO(Long id, String name) {}
```

### @Builder → @Builder (keep if needed)

```java
// Builder is still useful for complex objects
@Data
@Builder
public class Config {
    private String host;
    private int port;
}
```

### @Slf4j → slf4j2 (or use constructor injection)

```java
// Recommended - use constructor injection
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public void log(String msg) {
        LoggerFactory.getLogger(getClass()).info(msg);
    }
}
```

## When Lombok IS Acceptable

| Scenario | Annotation | Reason |
|----------|-----------|--------|
| Request DTO | @Data | Needs no-arg constructor |
| Response DTO (mutable) | @Data @Builder | Jackson needs setters |
| Entity (JPA) | @Getter @Setter | Control mutation |
| Test fixtures | @Data @Builder | Convenience |

## Enforcer Rule

Add to pom.xml:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-enforcer-plugin</artifactId>
    <executions>
        <execution>
            <id>enforce-lombok</id>
            <rules>
                <bannedDependencies>
                    <excludes>
                        <exclude>org.projectlombok:lombok</exclude>
                    </excludes>
                </bannedDependencies>
            </rules>
            <fail>true</fail>
        </execution>
    </executions>
</plugin>
```

## Legacy Projects

For existing projects using Lombok:

1. **Entity**: Replace @Data with @Getter/@Setter + manual equals/hashCode
2. **DTO**: Consider converting to record
3. **Service**: Replace @Slf4j with LoggerFactory