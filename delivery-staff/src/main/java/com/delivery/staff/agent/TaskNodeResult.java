package com.delivery.staff.agent;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sys_task_node_result")
public class TaskNodeResult {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private String taskId;

    @TableField("node_key")
    private String nodeKey;

    @TableField("agent_key")
    private String agentKey;

    private String status;

    @TableField("input_data")
    private String inputData;

    @TableField("output_data")
    private String outputData;

    @TableField("duration_ms")
    private Long durationMs;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("finished_at")
    private LocalDateTime finishedAt;
}