package com.delivery.staff.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.delivery.staff.entity.DeliveryStaff;

import java.util.List;

public interface IDeliveryStaffService extends IService<DeliveryStaff> {

    List<DeliveryStaff> findAll();

    IPage<DeliveryStaff> findByPage(int pageNum, int pageSize);

    DeliveryStaff findById(Long id);

    boolean createStaff(DeliveryStaff staff);

    boolean updateStaff(Long id, DeliveryStaff staff);

    boolean deleteStaff(Long id);
}
