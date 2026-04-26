package com.delivery.staff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("delivery_staff")
public class DeliveryStaff {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("staff_code")
    private String staffCode;

    @TableField("staff_name")
    private String staffName;

    private String phone;

    @TableField("id_card")
    private String idCard;

    private String status;

    @TableField("hire_date")
    private String hireDate;

    @TableField("station_id")
    private Long stationId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeliveryStaff that = (DeliveryStaff) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}