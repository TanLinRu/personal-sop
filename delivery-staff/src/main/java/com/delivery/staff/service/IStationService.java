package com.delivery.staff.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.delivery.staff.entity.Station;

import java.util.List;

public interface IStationService extends IService<Station> {

    List<Station> findAll();

    IPage<Station> findByPage(int pageNum, int pageSize);

    Station findById(Long id);

    boolean createStation(Station station);

    boolean updateStation(Long id, Station station);

    boolean deleteStation(Long id);
}