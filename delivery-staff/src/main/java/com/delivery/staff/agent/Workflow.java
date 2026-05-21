package com.delivery.staff.agent;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_workflow")
public class Workflow {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("workflow_key")
    private String workflowKey;

    private String name;

    private String description;

    @TableField("node_config")
    private String nodeConfig;

    @TableField("edges_config")
    private String edgesConfig;

    @TableField("is_default")
    private Boolean isDefault;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}