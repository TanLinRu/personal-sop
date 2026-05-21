package com.delivery.staff.agent;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_agent_config")
public class AgentConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("agent_key")
    private String agentKey;

    private String name;

    private String description;

    private String model;

    @TableField("system_prompt")
    private String systemPrompt;

    private String tools;

    @TableField("trigger_pattern")
    private String triggerPattern;

    private Integer timeout;

    private Boolean enabled;

    @TableField("order_index")
    private Integer orderIndex;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}