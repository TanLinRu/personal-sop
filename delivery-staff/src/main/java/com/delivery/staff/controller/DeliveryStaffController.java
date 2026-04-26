package com.delivery.staff.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.delivery.staff.entity.DeliveryStaff;
import com.delivery.staff.service.IDeliveryStaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staffs")
@RequiredArgsConstructor
public class DeliveryStaffController {

    private final IDeliveryStaffService staffService;

    @GetMapping
    public ResponseEntity<List<DeliveryStaff>> findAll() {
        return ResponseEntity.ok(staffService.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<IPage<DeliveryStaff>> findByPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(staffService.findByPage(pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryStaff> findById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryStaff> create(@RequestBody DeliveryStaff staff) {
        staffService.createStaff(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(staff);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryStaff> update(@PathVariable Long id, @RequestBody DeliveryStaff staff) {
        staff.setId(id);
        staffService.updateStaff(id, staff);
        return ResponseEntity.ok(staff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
