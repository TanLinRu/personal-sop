# IntelliJ IDEA 配置指南

## JDK 21 配置

### 1. 安装 JDK 21

从 [Adoptium](https://adoptium.net/) 下载 JDK 21。

### 2. IDEA 中配置

```
Settings → Build, Execution, Deployment → SDK Manager
```

点击 `+` 添加 JDK 21 安装路径。

### 3. 项目 SDK 设置

```
Project Structure → Project → Project SDK → 21
```

## Maven 配置

### 镜像源（可选）

```xml
<!-- maven/conf/settings.xml -->
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>central</mirrorOf>
        <name>Aliyun Maven</name>
        <url>https://maven.aliyun.com/repository/central</url>
    </mirror>
</mirrors>
```

### VM 选项

```
Settings → Build, Execution, Deployment → Build Tools → Maven → Runner
VM Options: -Xms512m -Xmx2048m
```

## Lombok 配置

### 1. 安装插件

```
Settings → Plugins → 搜索 "Lombok" → Install
```

### 2. 启用注解处理

```
Settings → Build, Execution, Deployment → Compiler → Annotation Processors
✓ Enable annotation processing
```

## Spring Boot 配置

### 1. 运行配置

```
Run → Edit Configurations → + → Spring Boot
```

- Main class: `Application`
- VM options: `-Dspring.profiles.active=dev`

### 2. 热部署

添加依赖：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
</dependency>
```

设置：
```
Settings → Build, Execution, Deployment → Compiler
✓ Build project automatically
```

## 数据库连接

### 1. 安装 MySQL 驱动

```
File → Project Structure → Libraries → + → from Maven
com.mysql:mysql-connector-j:8.0.33
```

### 2. Database 面板

```
View → Tool Windows → Database
```

创建 Data Source → MySQL

## 代码样式

### 1. 导入代码风格

```
Settings → Editor → Code Style → Java → Import Scheme
```

### 2. 文件编码

```
Settings → Editor → File Encodings
✓ UTF-8 for all files
```

## 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+F10` | 运行 |
| `Ctrl+Shift+F9` | 调试 |
| `Ctrl+Alt+O` | 优化导入 |
| `Ctrl+Alt+L` | 格式化 |
| `Shift+Shift` | 搜索 everywhere |

## 性能优化

### 1. 内存配置

编辑 IDEA 安装目录下的 `idea64.vmoptions`：

```properties
-Xms512m
-Xmx2048m
-XX:ReservedCodeCacheSize=512m
```

### 2. 关闭不需要的功能

```
Settings → Editor → General → Code Completion
✓ 关闭 Autopopup
```

## 常用插件

| 插件 | 用途 |
|------|------|
| Lombok | 注解生成 |
| MyBatisX | MyBatis 映射 |
| RestfulToolkit | REST API 测试 |
| Translation | 翻译 |
| Maven Helper | 依赖分析 |

## 问题排查

### 1. Lombok 不生效

- 确认已启用 annotation processing
- 重启 IDEA

### 2. Maven 依赖红色

- 尝试 `Reimport` Maven 项目
- 检查 Maven 配置

### 3. 项目无法启动

- 检查 JDK 版本
- 检查 Spring Boot 版本兼容性