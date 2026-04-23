# BACKEND.md - 后端迭代规范

## 技术栈

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.x | 需 jakarta.* |
| JDK | 21 | Virtual Threads |
| MyBatis-Plus | 3.5.x | ORM |
| MySQL | 8.0 | 主数据库 |
| Redis | 7 | 缓存 |

## 关键约束

### 必须遵守

- **无 Lombok** - 使用原生 getter/setter 或 record
- **jakarta.*** - 非 javax.* (Spring Boot 3)
- **SecurityFilterChain** - 非 WebSecurityConfigurerAdapter
- **构造函数注入** - 非 @Autowired 字段注入

### 检查点

- [ ] javax → jakarta 替换
- [ ] @Data → @Getter/@Setter (Entity)
- [ ] @AllArgsConstructor → 显式构造函数
- [ ] WebSecurityConfigurerAdapter → SecurityFilterChain
- [ ] MyBatis-Plus 配置正确

## 分层规范

```
src/main/java/com/{package}/
├── controller/      # REST API
├── service/         # 业务逻辑
├── mapper/          # MyBatis Mapper
├── entity/          # JPA Entity
├── dto/             # Data Transfer Object
├── config/          # 配置类
└── exception/      # 异常处理
```

## 并行 Agent

| Agent | 用途 |
|-------|------|
| java-reviewer | 代码分析 |
| security-scan | 安全扫描 |

## 命令

```bash
# 构建
./mvnw clean package -DskipTests

# 运行
./mvnw spring-boot:run

# 测试
./mvnw test
```

## 验证清单

- [ ] 代码格式 (Checkstyle)
- [ ] 单元测试通过
- [ ] 无安全漏洞
- [ ] API 文档生成