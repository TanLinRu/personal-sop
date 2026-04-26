package com.delivery.staff.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.delivery.staff.entity.Performance;
import com.delivery.staff.service.IPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/performances")
@RequiredArgsConstructor
public class PerformanceController {

    private final IPerformanceService performanceService;

    @GetMapping
    public ResponseEntity<List<Performance>> findAll() {
        return ResponseEntity.ok(performanceService.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<IPage<Performance>> findByPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(performanceService.findByPage(pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> findById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Performance> create(@RequestBody Performance performance) {
        performanceService.createPerformance(performance);
        return ResponseEntity.status(HttpStatus.CREATED).body(performance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Performance> update(@PathVariable Long id, @RequestBody Performance performance) {
        performance.setId(id);
        performanceService.updatePerformance(id, performance);
        return ResponseEntity.ok(performance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }
}