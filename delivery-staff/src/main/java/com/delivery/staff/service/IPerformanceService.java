package com.delivery.staff.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.delivery.staff.entity.Performance;

import java.util.List;

public interface IPerformanceService extends IService<Performance> {

    List<Performance> findAll();

    IPage<Performance> findByPage(int pageNum, int pageSize);

    Performance findById(Long id);

    boolean createPerformance(Performance performance);

    boolean updatePerformance(Long id, Performance performance);

    boolean deletePerformance(Long id);
}