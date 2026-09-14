-- phpMyAdmin SQL Dump
-- version 4.7.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 07, 2018 at 07:13 PM
-- Server version: 10.2.11-MariaDB-log
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `akila_car_auction`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Akila Dunukara', 'dinushiakila@gmail.com', '0112345678', '77cb2899cf0a7a8d52eca93d410df665', '2017-11-26 14:50:13', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `vehicle_id`, `name`, `email`, `phone`, `message`, `created_at`, `updated_at`, `status`) VALUES
(1, 3, 'Akila Dunukara', 'dinushiakila@gmail.com', '0112345678', 'I am interested in a price quote on this vehicle. Please contact me at your earliest convenience with your best price for this vehicle.', '2017-11-26 16:11:37', '0000-00-00 00:00:00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `newsletters`
--

CREATE TABLE `newsletters` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `newsletters`
--

INSERT INTO `newsletters` (`id`, `name`, `email`, `created_at`, `updated_at`) VALUES
(1, 'Akila Dunukara', 'dinushiakila@gmail.com', '2017-11-26 16:15:56', '0000-00-00 00:00:00'),
(2, 'Akila Dunukara', 'dinushiakila@gmail.com', '2017-11-26 16:16:10', '0000-00-00 00:00:00'),
(3, 'Akila Dunukara', 'dinushiakila@gmail.com', '2017-11-26 16:17:44', '0000-00-00 00:00:00'),
(4, 'Akila Dunukara', 'dinushiakila@gmail.com', '2017-11-26 16:20:11', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `userpermissions`
--

CREATE TABLE `userpermissions` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `permissions` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `userpermissions`
--

INSERT INTO `userpermissions` (`id`, `name`, `permissions`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', '{\"customers\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"email-settings\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"inquiries\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"newsletters\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"userpermissions\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"users\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-color\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-feature\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-manufacturer\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-model\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-type\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}]}', 1, '2017-11-26 16:40:42', '2017-11-26 16:40:42'),
(2, 'Admin', '{\"email-settings\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"userpermissions\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"users\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-color\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-feature\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-manufacturer\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-model\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}],\"vehicle-type\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"1\"],\"view\":[\"1\"],\"other\":[\"1\"]}]}', 1, '2017-09-16 07:01:21', '0000-00-00 00:00:00'),
(3, 'User', '{\"customers\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"email-settings\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"inquiries\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"newsletters\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"userpermissions\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"users\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle-color\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle-feature\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle-manufacturer\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle-model\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}],\"vehicle-type\":[{\"add\":[\"1\"],\"edit\":[\"1\"],\"delete\":[\"0\"],\"view\":[\"1\"],\"other\":[\"0\"]}]}', 1, '2017-11-26 18:04:32', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `type` int(1) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `type`, `username`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Akila', 'Dunukara', 'akiladunukaraneo@gmail.com', 1, 'akila', '77cb2899cf0a7a8d52eca93d410df665', '2017-09-14 17:10:33', '2017-09-14 17:10:33'),
(2, 'Super', 'Admin', 'admin@gmail.com', 1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '2017-11-26 18:02:59', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle`
--

CREATE TABLE `vehicle` (
  `id` int(11) NOT NULL,
  `vehicle_type` int(11) DEFAULT NULL,
  `vehicle_manufacturer` int(11) DEFAULT NULL,
  `vehicle_model` int(11) DEFAULT NULL,
  `seo_url` varchar(255) NOT NULL,
  `main_color` int(11) DEFAULT NULL,
  `other_color` text DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `year` varchar(100) DEFAULT NULL,
  `chassi_id` varchar(100) DEFAULT NULL,
  `conditions` varchar(500) DEFAULT NULL,
  `seats` int(11) DEFAULT NULL,
  `doors` int(11) DEFAULT NULL,
  `passengers` int(11) DEFAULT NULL,
  `engine_capacity` varchar(20) DEFAULT NULL,
  `mileage` varchar(20) DEFAULT NULL,
  `fuel_type` varchar(20) DEFAULT NULL,
  `transmission` varchar(20) DEFAULT NULL,
  `drive_type` varchar(20) DEFAULT NULL,
  `auction_grade` varchar(50) NOT NULL,
  `grade` varchar(50) NOT NULL,
  `images` text DEFAULT NULL,
  `feature_ids` text DEFAULT NULL,
  `is_featured` varchar(20) DEFAULT NULL,
  `is_latest` int(11) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle`
--

INSERT INTO `vehicle` (`id`, `vehicle_type`, `vehicle_manufacturer`, `vehicle_model`, `seo_url`, `main_color`, `other_color`, `description`, `year`, `chassi_id`, `conditions`, `seats`, `doors`, `passengers`, `engine_capacity`, `mileage`, `fuel_type`, `transmission`, `drive_type`, `auction_grade`, `grade`, `images`, `feature_ids`, `is_featured`, `is_latest`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 2, 'suv-honda-x-trail-99894', 2, '2', '   Xtrail ', '2017', 'Abcs', '0', 5, 5, 4, '1500 CC', '0 km', '2', '0', '0', 'A', '', '5whfYyhZgRFtDhG77Ip5Izb2LDioaBCPD5Qp2LuOlVWf-2vmgUePFv5sCAOf_1511192468.jpg', '1,2', '1', 1, 1, '0000-00-00 00:00:00', NULL),
(2, 1, 2, 1, 'suv-honda-civic-64989', 2, '2', '  ', '2017', '', '0', 5, 5, 4, '1500 CC', '0 km', '2', '0', '0', '', '', '7gNelB08VIb65pkCyxLPkYbwQMUP757ZAzL7ILRz3csoioaVuZL4-2oGGvoLu2MJYEyC_1511192447.jpg', '1,2', '1', 1, 1, '0000-00-00 00:00:00', NULL),
(3, 1, 2, 4, 'suv-honda-vessel-24988', 5, '5', '  ', '2016', '', '0', 5, 5, 4, '2000 CC', '160 km', '2', '0', '0', '', '', 'jc9c9SfLBcXNn7xyAHfgsm2jXhdrXMeKMMwLAF5NXLXigZfX-gc1-7_1511192426.jpg', '1,2', '1', 1, 1, '0000-00-00 00:00:00', NULL),
(4, 1, 2, 4, 'suv-honda-vessel-6016', 4, '4', '  ', '2015', '', '0', 5, 5, 4, '2500 CC', '2000 km', '2', '0', '0', '', '', '7gNelB08VIb65pkCyxLPkYbwQMUP7584voGjvC4ZYMoJWHJbkWr0-31ZC17Mfw9LjBxA_1511192074.jpg', '1,2', '1', 1, 1, '0000-00-00 00:00:00', NULL),
(5, 1, 1, 5, 'suv-toyota-axio-99467', 4, '4', '     ', '2014', '', '0', 5, 5, 4, '1800 CC', '50000 km', '2', '0', '0', '', '', 'BIMYp8c52NhZtovI3XYDvHY7PXykj8BkdDv7pNkgo-4qEGQwxG31FJQ0_1511713321.jpg,BIMYp8c52NhZtp6BUJpMA2mgereylpdI2MlYl8vcJ-UAcKAb7gdCyRAU_1511713321.jpg', '1,2', '1', 1, 1, '0000-00-00 00:00:00', '2017-11-26 16:22:01');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_color`
--

CREATE TABLE `vehicle_color` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle_color`
--

INSERT INTO `vehicle_color` (`id`, `name`, `code`, `status`, `created_at`, `updated_at`) VALUES
(2, 'White', '', 1, '2017-11-19 09:34:26', '0000-00-00 00:00:00'),
(3, 'Black', '', 1, '2017-11-19 09:34:34', '0000-00-00 00:00:00'),
(4, 'Red', '', 1, '2017-11-19 09:34:42', '0000-00-00 00:00:00'),
(5, 'Dark Gray', '', 1, '2017-11-20 12:10:14', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_feature`
--

CREATE TABLE `vehicle_feature` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` varchar(200) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle_feature`
--

INSERT INTO `vehicle_feature` (`id`, `name`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Rear view Camera', 'muscle_car.png', 1, '2017-09-17 17:14:37', '2017-09-17 17:18:31'),
(2, 'Reverse Sensor', 'muscle_car.png', 1, '2017-09-17 17:15:24', '2017-09-18 00:31:32'),
(3, 'Power Windows', '', 1, '2017-11-26 02:25:41', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_manufacturer`
--

CREATE TABLE `vehicle_manufacturer` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle_manufacturer`
--

INSERT INTO `vehicle_manufacturer` (`id`, `name`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Toyota', 'toyota-1321428815.jpg', 1, '2017-09-17 16:34:51', '2017-09-17 16:40:00'),
(2, 'Honda', 'honda-1321429975.jpg', 1, '2017-09-17 16:53:04', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_model`
--

CREATE TABLE `vehicle_model` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `manufacturer_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle_model`
--

INSERT INTO `vehicle_model` (`id`, `name`, `manufacturer_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Civic', 2, 1, '2017-10-15 17:05:18', '2017-11-19 09:24:14'),
(2, 'X-Trail', 2, 1, '2017-11-19 09:29:02', '0000-00-00 00:00:00'),
(3, 'Grace', 2, 1, '2017-11-20 12:09:10', '0000-00-00 00:00:00'),
(4, 'Vessel', 2, 1, '2017-11-20 12:09:50', '0000-00-00 00:00:00'),
(5, 'Axio', 1, 1, '2017-11-20 12:13:25', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_type`
--

CREATE TABLE `vehicle_type` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `image` text NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vehicle_type`
--

INSERT INTO `vehicle_type` (`id`, `name`, `image`, `status`, `created_at`, `updated_at`) VALUES
(1, 'SUV', 'suv.png', 1, '0000-00-00 00:00:00', '2017-11-19 10:51:45'),
(4, 'Bus', 'bus.png', 1, '2017-09-17 14:00:33', '0000-00-00 00:00:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `newsletters`
--
ALTER TABLE `newsletters`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `userpermissions`
--
ALTER TABLE `userpermissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=10;

--
-- Indexes for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vehicle_color`
--
ALTER TABLE `vehicle_color`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `vehicle_feature`
--
ALTER TABLE `vehicle_feature`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `vehicle_manufacturer`
--
ALTER TABLE `vehicle_manufacturer`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `vehicle_model`
--
ALTER TABLE `vehicle_model`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- Indexes for table `vehicle_type`
--
ALTER TABLE `vehicle_type`
  ADD PRIMARY KEY (`id`) KEY_BLOCK_SIZE=1024;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `newsletters`
--
ALTER TABLE `newsletters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `userpermissions`
--
ALTER TABLE `userpermissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `vehicle`
--
ALTER TABLE `vehicle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `vehicle_color`
--
ALTER TABLE `vehicle_color`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `vehicle_feature`
--
ALTER TABLE `vehicle_feature`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `vehicle_manufacturer`
--
ALTER TABLE `vehicle_manufacturer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `vehicle_model`
--
ALTER TABLE `vehicle_model`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `vehicle_type`
--
ALTER TABLE `vehicle_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
