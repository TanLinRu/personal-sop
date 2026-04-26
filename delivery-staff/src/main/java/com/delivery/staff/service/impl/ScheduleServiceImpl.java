package com.delivery.staff.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.delivery.staff.entity.Schedule;
import com.delivery.staff.mapper.ScheduleMapper;
import com.delivery.staff.service.IScheduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ScheduleServiceImpl extends ServiceImpl<ScheduleMapper, Schedule> implements IScheduleService {

    @Override
    @Transactional(readOnly = true)
    public List<Schedule> findAll() {
        return baseMapper.selectList(null);
    }

    @Override
    @Transactional(readOnly = true)
    public IPage<Schedule> findByPage(int pageNum, int pageSize) {
        return baseMapper.selectPage(new Page<>(pageNum, pageSize), null);
    }

    @Override
    @Transactional(readOnly = true)
    public Schedule findById(Long id) {
        return baseMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createSchedule(Schedule schedule) {
        return baseMapper.insert(schedule) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateSchedule(Long id, Schedule schedule) {
        schedule.setId(id);
        return baseMapper.updateById(schedule) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteSchedule(Long id) {
        return baseMapper.deleteById(id) > 0;
    }
}