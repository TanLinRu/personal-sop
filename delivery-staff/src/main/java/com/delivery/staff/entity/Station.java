package com.delivery.staff.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("station")
public class Station {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("station_code")
    private String stationCode;

    @TableField("station_name")
    private String stationName;

    @TableField("address")
    private String address;

    @TableField("city")
    private String city;

    @TableField("status")
    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Station station = (Station) o;
        return id != null && id.equals(station.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}