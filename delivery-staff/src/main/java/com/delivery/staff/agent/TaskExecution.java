package com.delivery.staff.agent;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_task_execution")
public class TaskExecution {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private String taskId;

    @TableField("workflow_key")
    private String workflowKey;

    private String input;

    private String status;

    @TableField("current_step")
    private Integer currentStep;

    @TableField("context_data")
    private String contextData;

    @TableField("result")
    private String result;

    @TableField("duration_ms")
    private Long durationMs;

    @TableField("error_message")
    private String errorMessage;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("finished_at")
    private LocalDateTime finishedAt;
}