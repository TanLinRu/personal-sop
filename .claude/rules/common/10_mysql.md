# MySQL 数据库规约

> 基于阿里巴巴《Java开发手册》- MySQL 规约

---

## 建表规约

### 【强制】表名/字段名

```sql
-- ✅ 正确：小写下划线
CREATE TABLE user_info (
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户名',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ❌ 错误：大写/驼峰
CREATE TABLE UserInfo (
    UserId BIGINT,
    userName VARCHAR
);
```

### 【强制】主键 ID

```sql
-- ✅ 正确：使用 bigint unsigned
user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY

-- ❌ 避免：int 有上限
user_id INT NOT NULL AUTO_INCREMENT
```

### 【强制】无物理删除

```sql
-- ✅ 正确：使用逻辑删除
CREATE TABLE user_info (
    user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '0-未删除 1-已删除'
);

-- ❌ 禁止：物理删除
-- DELETE FROM user_info WHERE id = 1;
```

---

## 索引规约

### 【强制】索引命名

```sql
-- ✅ 正确：idx_ / uniq_ 前缀
ALTER TABLE user_info ADD INDEX idx_user_name(user_name);
ALTER TABLE user_info ADD UNIQUE uk_user_email(user_email);

-- ❌ 错误
ALTER TABLE user_info ADD INDEX user_name(user_name);
```

### 【强制】避免全表扫描

```sql
-- ✅ 正确：走索引
SELECT * FROM user_info WHERE user_id = 1;
SELECT * FROM user_info WHERE status = 'ACTIVE' AND created_at > '2024-01-01';

-- ❌ 避免：全表扫描
SELECT * FROM user_info WHERE deleted = 0;  // 无索引
SELECT * FROM user_info WHERE UPPER(name) = 'TEST';  // 函数
```

### 【推荐】复合索引

```sql
-- ✅ 推荐：复合索引，区分度大的放前面
ALTER TABLE order_info ADD INDEX idx_status_created(status, created_at);
```

---

## SQL 规约

### 【强制】避免 select *

```sql
-- ✅ 正确：指定字段
SELECT user_id, user_name FROM user_info WHERE user_id = 1;

-- ❌ 避免
SELECT * FROM user_info WHERE user_id = 1;
```

### 【强制】分页优化

```sql
-- ✅ 正确：基于 ID 的分页
SELECT * FROM user_info 
WHERE user_id > #{lastId} 
ORDER BY user_id 
LIMIT 20;

-- ❌ 避免：大偏移量
SELECT * FROM user_info LIMIT 100000, 20;
```

### 【强制】避免负向查询

```sql
-- ✅ 正确：正项查询
SELECT * FROM user_info WHERE status = 'ACTIVE';
SELECT * FROM user_info WHERE user_id IN (1, 2, 3);

-- ❌ 避免：负向查询
SELECT * FROM user_info WHERE status != 'ACTIVE';
SELECT * FROM user_info WHERE status NOT IN ('ACTIVE');
SELECT * FROM user_info WHERE user_id NOT IN (1, 2, 3);
```

---

## 字段设计

### 【强制】DECIMAL 用于金额

```sql
-- ✅ 正确：使用 DECIMAL
amount DECIMAL(10, 2) NOT NULL COMMENT '金额'

-- ❌ 避免：使用 FLOAT/DOUBLE
amount DOUBLE NOT NULL  -- 精度丢失
```

### 【强制】NOT NULL 必须设置默认值

```sql
-- ✅ 正确：NOT NULL + DEFAULT
status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态'
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

-- ❌ 避免：NOT NULL 无默认值
status VARCHAR(20) NOT NULL  -- 插入失败
```

### 【推荐】适当冗余

```sql
-- ✅ 推荐：避免频繁JOIN
CREATE TABLE order_info (
    order_id BIGINT UNSIGNED NOT NULL,
    user_name VARCHAR(50),  -- 冗余字段，避免 JOIN
    user_id BIGINT UNSIGNED NOT NULL,
    ...
);
```

---

## 时间字段

### 【强制】使用 DATETIME

```sql
-- ✅ 正确：DATETIME
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

-- ❌ 避免：TIMESTAMP (2038 问题)
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

---

## 参考

- Alibaba P3C: `InsertIntoDatabaseViewLengthRule` 规则集