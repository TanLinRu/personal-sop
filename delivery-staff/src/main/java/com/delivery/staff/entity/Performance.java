package com.delivery.staff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("performance")
public class Performance {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("staff_id")
    private Long staffId;

    @TableField("record_month")
    private String recordMonth;

    @TableField("total_orders")
    private Integer totalOrders;

    @TableField("total_distance")
    private BigDecimal totalDistance;

    @TableField("avg_delivery_time")
    private BigDecimal avgDeliveryTime;

    @TableField("rating")
    private BigDecimal rating;

    @TableField("bonus")
    private BigDecimal bonus;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Performance that = (Performance) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}