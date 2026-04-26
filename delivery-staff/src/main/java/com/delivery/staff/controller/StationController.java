package com.delivery.staff.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.delivery.staff.entity.Station;
import com.delivery.staff.service.IStationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stations")
@RequiredArgsConstructor
public class StationController {

    private final IStationService stationService;

    @GetMapping
    public ResponseEntity<List<Station>> findAll() {
        return ResponseEntity.ok(stationService.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<IPage<Station>> findByPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(stationService.findByPage(pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Station> findById(@PathVariable Long id) {
        return ResponseEntity.ok(stationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Station> create(@RequestBody Station station) {
        stationService.createStation(station);
        return ResponseEntity.status(HttpStatus.CREATED).body(station);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Station> update(@PathVariable Long id, @RequestBody Station station) {
        station.setId(id);
        stationService.updateStation(id, station);
        return ResponseEntity.ok(station);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
}