# 并发处理

> 基于阿里巴巴《Java开发手册》- 并发处理规约

---

## 线程安全

### 【强制】单例对象必须完全无状态

```java
// ✅ 正确：单例无状态
@Service
public class UserService {
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}

// ❌ 错误：单例包含可变状态
@Service
public class UserService {
    private User currentUser;  // ❌ 可变状态，导致线程不安全
    
    public void setCurrentUser(User user) {
        this.currentUser = user;
    }
}
```

### 【强制】使用线程安全集合

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.Collections;

// ✅ 正确：ConcurrentHashMap
private final Map<String, Object> cache = new ConcurrentHashMap<>();

// ✅ 正确：CopyOnWriteArrayList（读多写少）
private final List<String> listeners = new CopyOnWriteArrayList<>();

// ❌ 错误：HashMap 在并发下不安全
private final Map<String, Object> cache = new HashMap<>();
```

---

## 线程池

### 【强制】必须使用线程池

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;

// ✅ 正确：使用线程池
private final ExecutorService executor = Executors.newFixedThreadPool(10);

// ❌ 错误：直接创建线程
new Thread(() -> {
    // do work
}).start();
```

### 【强制】线程池配置必须合理

```java
// ✅ 正确：自定义线程池
@Configuration
public class ThreadPoolConfig {
    @Bean
    public ExecutorService executor() {
        return new ThreadPoolExecutor(
            2,                          // 核心线程数
            10,                         // 最大线程数
            60L, TimeUnit.SECONDS,     // 空闲回收时间
            new LinkedBlockingQueue<>(100),  // 队列容量
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );
    }
}
```

---

## 并发修改

### 【强制】并发修改必须加锁

```java
// ✅ 正确：使用 synchronized
private int count = 0;

public synchronized void increment() {
    count++;
}

// ✅ 正确：使用 ReentrantLock
private final ReentrantLock lock = new ReentrantLock();

public void increment() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock();
    }
}
```

### 【强制】while 循环中 notify/wait 必须加锁

```java
// ✅ 正确：wait/notify 必须写在同步代码块中
synchronized (lock) {
    while (condition) {
        lock.wait();
    }
    // 处理逻辑
}

// ✅ 正确：notifyAll
synchronized (lock) {
    condition = true;
    lock.notifyAll();
}

// ❌ 错误：在同步块外调用 wait/notify
while (condition) {
    lock.wait();  // 编译错误
}
```

---

## ThreadLocal

### 【强制】必须清理 ThreadLocal

```java
// ✅ 正确：使用 finally 清理
private static final ThreadLocal<User> USER_TL = new ThreadLocal<>();

public void setUser(User user) {
    USER_TL.set(user);
}

public void clear() {
    USER_TL.remove();  // 必须清理
}

// 使用
try {
    USER_TL.set(user);
    // do work
} finally {
    USER_TL.remove();  // 清理
}
```

### 【强制】父子线程共享用 InheritableThreadLocal

```java
// ✅ 正确：子线程继承父线程变量
private static final ThreadLocal<String> INHERITABLE = new InheritableThreadLocal<>();

// 主线程设置
INHERITABLE.set("parent value");

// 子线程可读取
Thread child = new Thread(() -> {
    System.out.println(INHERITABLE.get());  // "parent value"
});
```

---

## ConcurrentHashMap

### 【推荐】并发 Map 使用 computeIfAbsent

```java
private final ConcurrentHashMap<String, User> cache = new ConcurrentHashMap<>();

// ✅ 推荐：computeIfAbsent 原子操作
public User getOrCreate(String id) {
    return cache.computeIfAbsent(id, key -> createUser(key));
}

// ❌ 避免：先判断再创建（非原子）
public User getOrCreate(String id) {
    if (!cache.containsKey(id)) {
        User user = createUser(id);
        cache.put(id, user);  // 可能重复创建
    }
    return cache.get(id);
}
```

### 【推荐】并发计数器使用 LongAdder

```java
import java.util.concurrent.atomic.LongAdder;

// ✅ 推荐：LongAdder 比 AtomicLong 性能更好
private final LongAdder counter = new LongAdder();

public void increment() {
    counter.increment();
}

public long getCount() {
    return counter.sum();
}
```

---

## Future 与异步

### 【强制】异步任务必须处理异常

```java
import java.util.concurrent.Future;

// ✅ 正确：检查 Future 异常
public void asyncProcess() {
    Future<User> future = executor.submit(() -> {
        // 异步任务
        return userService.process(id);
    });
    
    try {
        User user = future.get(30, TimeUnit.SECONDS);
    } catch (ExecutionException e) {
        log.error("Async task failed", e.getCause());
    } catch (TimeoutException e) {
        log.error("Async task timeout");
        future.cancel(true);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
}
```

### 【强制】CompletableFuture 必须设置超时

```java
// ✅ 正确：设置超时
CompletableFuture<User> future = CompletableFuture
    .supplyAsync(() -> userService.process(id))
    .orTimeout(30, TimeUnit.SECONDS)
    .exceptionally(ex -> {
        log.error("Failed", ex);
        return null;
    });
```

---

## 并发测试

### 【推荐】使用并发测试框架

```java
// ✅ 推荐：使用 CountDownLatch 进行并发测试
@Test
public void testConcurrent() throws InterruptedException {
    int threadCount = 10;
    CountDownLatch latch = new CountDownLatch(threadCount);
    AtomicInteger successCount = new AtomicInteger(0);
    
    for (int i = 0; i < threadCount; i++) {
        new Thread(() -> {
            try {
                service.increment();
                successCount.incrementAndGet();
            } finally {
                latch.countDown();
            }
        }).start();
    }
    
    latch.await(10, TimeUnit.SECONDS);
    assertEquals(threadCount, successCount.get());
}
```

---

## 参考

- Alibaba P3C: `ThreadConfinement` 规则集
- Java Concurrency in Practice