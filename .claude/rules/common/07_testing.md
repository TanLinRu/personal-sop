# 单元测试

> 基于阿里巴巴《Java开发手册》- 单元测试规约

---

## 测试覆盖率

### 【推荐】覆盖率要求

| 类型 | 覆盖率要求 | 说明 |
|------|-----------|------|
| 新增代码 | ≥80% | - |
| 关键路径 | 100% | 核心业务逻辑 |
| Bug修复 | 100% | 修复用例必须包含 |

### 【推荐】覆盖策略

```
        ┌───────────────────────────┐
        │     代码覆盖率         │
        │  ┌─────────────────┐   │
        │  │ 语句覆盖 80%   │   │
        │  │ ├─ 分支覆盖    │   │
        │  │ │  └─ 条件覆盖 │   │
        │  │ └─ 方法覆盖    │   │
        │  └─────────────────┘   │
        └───────────────────────────┘
```

---

## 测试结构

### 【推荐】Given-When-Then

```java
@Test
public void testCreateOrder_Success() {
    // Given: 准备测试数据
    OrderRequest request = OrderRequest.builder()
        .userId(1L)
        .amount(new BigDecimal("100"))
        .build();
    
    // When: 执行测试
    OrderResponse response = orderService.createOrder(request);
    
    // Then: 验证结果
    assertThat(response.getId()).isNotNull();
    assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
}
```

### 【推荐】测试命名规范

```java
// ✅ 正确：描述性测试名
@Test
public void testCreateOrder_WithValidRequest_ReturnsSuccess() { }

@Test
public void testCreateOrder_WithInvalidAmount_ThrowsException() { }

@Test
public void testFindOrder_NotFound_ReturnsEmpty() { }

// ❌ 避免：模糊命名
@Test
public void test1() { }
@Test
public void testCreate() { }
```

---

## Mock 使用

### 【推荐】使用 Mock 框架

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void testFindById() {
        // Given
        when(userRepository.findById(1L))
            .thenReturn(Optional.of(new User(1L, "zhangsan")));
        
        // When
        User user = userService.findById(1L);
        
        // Then
        assertThat(user.getName()).isEqualTo("zhangsan");
    }
}
```

### 【强制】验证 Mock 调用

```java
@Test
void testCreate_SavesAndReturns() {
    // Given
    User user = new User("zhangsan");
    
    // When
    userService.createUser(user);
    
    // Then: 验证调用
    verify(userRepository, times(1)).save(user);
}
```

---

## 测试隔离

### 【强制】测试用例相互独立

```java
// ✅ 正确：每个测试独立准备数据
@BeforeEach
void setUp() {
    userRepository.deleteAll();
}
```

### 【强制】避免测试顺序依赖

```java
// ❌ 避免：依赖执行顺序
@Test
void test1() {
    saveUser();
    // test2 可能依赖 test1 的数据
}
```

---

## 测试数据

### 【推荐】使用测试数据构建器

```java
public class UserBuilder {
    private Long id = 1L;
    private String name = "test";
    private String email = "test@example.com";
    
    public UserBuilder id(Long id) {
        this.id = id;
        return this;
    }
    
    public User build() {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        return user;
    }
}

// 使用
User user = new UserBuilder()
    .id(1L)
    .name("zhangsan")
    .build();
```

---

## 异步测试

### 【推荐】使用 Awaitility

```java
@Test
public void testAsync() {
    // Given
    Async async = mock(Async.class);
    
    // When
    async.execute(() -> {
        // 异步执行
    });
    
    // Then: 等待异步完成
    await().atMost(5, TimeUnit.SECONDS)
        .untilAsserted(() -> {
            verify(async).complete();
        });
}
```

---

## 参考

- Alibaba P3C: `TestClassShouldBeRightTestStyle` 规则集