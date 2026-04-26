package com.delivery.staff.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.delivery.staff.entity.DeliveryStaff;
import com.delivery.staff.mapper.DeliveryStaffMapper;
import com.delivery.staff.service.IDeliveryStaffService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DeliveryStaffServiceImpl extends ServiceImpl<DeliveryStaffMapper, DeliveryStaff> implements IDeliveryStaffService {

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryStaff> findAll() {
        return baseMapper.selectList(null);
    }

    @Override
    @Transactional(readOnly = true)
    public IPage<DeliveryStaff> findByPage(int pageNum, int pageSize) {
        return baseMapper.selectPage(new Page<>(pageNum, pageSize), null);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryStaff findById(Long id) {
        return baseMapper.selectById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createStaff(DeliveryStaff staff) {
        return baseMapper.insert(staff) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateStaff(Long id, DeliveryStaff staff) {
        staff.setId(id);
        return baseMapper.updateById(staff) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteStaff(Long id) {
        return baseMapper.deleteById(id) > 0;
    }
}
