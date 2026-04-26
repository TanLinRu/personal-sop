package com.delivery.staff.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStaffDTO {
    private Long id;
    private String name;
    private String phone;
    private Long stationId;
    private String status;
}
