package com.delivery.staff.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.delivery.staff.entity.Performance;
import com.delivery.staff.mapper.PerformanceMapper;
import com.delivery.staff.service.IPerformanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PerformanceServiceImpl extends ServiceImpl<PerformanceMapper, Performance> implements IPerformanceService {

    @Override
    @Transactional(readOnly = true)
    public List<Performance> findAll() {
        return baseMapper.selectList(null);
    }

    @Override
    @Transactional(readOnly = true)
    public IPage<Performance> findByPage(int pageNum, int pageSize) {
        return baseMapper.selectPage(new Page<>(pageNum, pageSize), null);
    }

    @Override
    @Transactional(readOnly = true)
    public Performance findById(Long id) {
        return baseMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createPerformance(Performance performance) {
        return baseMapper.insert(performance) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updatePerformance(Long id, Performance performance) {
        performance.setId(id);
        return baseMapper.updateById(performance) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deletePerformance(Long id) {
        return baseMapper.deleteById(id) > 0;
    }
}