-- H2 初始化脚本
DROP TABLE IF EXISTS performance;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS station;
DROP TABLE IF EXISTS delivery_staff;

CREATE TABLE delivery_staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_code VARCHAR(50),
    staff_name VARCHAR(100),
    phone VARCHAR(20),
    id_card VARCHAR(18),
    status VARCHAR(20),
    hire_date VARCHAR(20),
    station_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE station (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(50),
    station_name VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(50),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT,
    station_id BIGINT,
    shift_date VARCHAR(20),
    shift_type VARCHAR(20),
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT,
    record_month VARCHAR(10),
    total_orders INT,
    total_distance DECIMAL(10,2),
    avg_delivery_time DECIMAL(10,2),
    rating DECIMAL(3,2),
    bonus DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO station (station_code, station_name, address, city, status) VALUES
('ST001', 'Chaoyang Station', 'Beijing Chaoyang XX Road 123', 'Beijing', 'ACTIVE'),
('ST002', 'Haidian Station', 'Beijing Haidian YY Road 456', 'Beijing', 'ACTIVE');

INSERT INTO delivery_staff (staff_code, staff_name, phone, id_card, status, hire_date, station_id) VALUES
('SF001', 'Zhang San', '13800138001', '110101199001011234', 'ACTIVE', '2024-01-15', 1),
('SF002', 'Li Si', '13800138002', '110101199002021234', 'ACTIVE', '2024-02-20', 1),
('SF003', 'Wang Wu', '13800138003', '110101199003031234', 'INACTIVE', '2023-06-10', 2);