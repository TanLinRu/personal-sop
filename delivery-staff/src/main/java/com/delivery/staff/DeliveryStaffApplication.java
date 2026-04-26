package com.delivery.staff;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.delivery.staff.mapper")
public class DeliveryStaffApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeliveryStaffApplication.class, args);
	}

}
