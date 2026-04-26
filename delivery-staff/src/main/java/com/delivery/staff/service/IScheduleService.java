package com.delivery.staff.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.delivery.staff.entity.Schedule;

import java.util.List;

public interface IScheduleService extends IService<Schedule> {

    List<Schedule> findAll();

    IPage<Schedule> findByPage(int pageNum, int pageSize);

    Schedule findById(Long id);

    boolean createSchedule(Schedule schedule);

    boolean updateSchedule(Long id, Schedule schedule);

    boolean deleteSchedule(Long id);
}