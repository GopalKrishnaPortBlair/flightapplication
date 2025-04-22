-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.7.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for flight
DROP DATABASE IF EXISTS `flight`;
CREATE DATABASE IF NOT EXISTS `flight` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;
USE `flight`;

-- Dumping structure for table flight.file_upload_log
DROP TABLE IF EXISTS `file_upload_log`;
CREATE TABLE IF NOT EXISTS `file_upload_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `File_Reference` varchar(255) NOT NULL,
  `File_Name` varchar(255) NOT NULL,
  `Upload_Timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table flight.flight_data
DROP TABLE IF EXISTS `flight_data`;
CREATE TABLE IF NOT EXISTS `flight_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Quarter` varchar(50) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  `Marketing_Airline` varchar(255) DEFAULT NULL,
  `Operating_Airline` varchar(255) DEFAULT NULL,
  `Origin` varchar(255) DEFAULT NULL,
  `Destination` varchar(255) DEFAULT NULL,
  `Origin_Hub` varchar(255) DEFAULT NULL,
  `Destination_Hub` varchar(255) DEFAULT NULL,
  `Hub` varchar(255) DEFAULT NULL,
  `Mkt_Op_One_Way_Airline_Route` varchar(255) DEFAULT NULL,
  `Mkt_One_Way_Airline_Route` varchar(255) DEFAULT NULL,
  `Non_Directional_Market` varchar(255) DEFAULT NULL,
  `Actual_Aircraft` varchar(255) DEFAULT NULL,
  `Proxy_Aircraft` varchar(255) DEFAULT NULL,
  `Origin_Entity` varchar(255) DEFAULT NULL,
  `Dest_Entity` varchar(255) DEFAULT NULL,
  `IRDB_Entity` varchar(255) DEFAULT NULL,
  `APAS_Entity` varchar(255) DEFAULT NULL,
  `Sub_Region_B` varchar(255) DEFAULT NULL,
  `ML_RL` varchar(255) DEFAULT NULL,
  `CPA_or_WO` varchar(255) DEFAULT NULL,
  `Fleet_Type` varchar(255) DEFAULT NULL,
  `DOM_INT` varchar(50) DEFAULT NULL,
  `Departures` int(11) DEFAULT NULL,
  `Miles` int(11) DEFAULT NULL,
  `ASMs` bigint(20) DEFAULT NULL,
  `Total_Passengers` int(11) DEFAULT NULL,
  `Seats` int(11) DEFAULT NULL,
  `Flight_Minutes` int(11) DEFAULT NULL,
  `Block_Minutes` int(11) DEFAULT NULL,
  `MTOW` decimal(12,2) DEFAULT NULL,
  `Cargo_Pounds` bigint(20) DEFAULT NULL,
  `Cargo_RTMs` decimal(12,2) DEFAULT NULL,
  `Departure_Validation` varchar(255) DEFAULT NULL,
  `Local_Pax_Fare` decimal(10,2) DEFAULT NULL,
  `Local_Passenger_Percentage` decimal(5,2) DEFAULT NULL,
  `Onboard_PRASM` decimal(10,4) DEFAULT NULL,
  `FFP_PRASM` decimal(10,4) DEFAULT NULL,
  `DB1B_Validation` varchar(255) DEFAULT NULL,
  `Route_Validation` varchar(255) DEFAULT NULL,
  `ASMs_True_Up` decimal(10,2) DEFAULT NULL,
  `Passenger_Revenue__M_` decimal(15,2) DEFAULT NULL,
  `FFP_Revenue__M_` decimal(15,2) DEFAULT NULL,
  `Revenue_True_Up` decimal(15,2) DEFAULT NULL,
  `Pax_Rev_SEC_Tie` decimal(15,2) DEFAULT NULL,
  `Adj_Pax_Rev__M_` decimal(15,2) DEFAULT NULL,
  `Entity` varchar(255) DEFAULT NULL,
  `Lookup_Entity` varchar(255) DEFAULT NULL,
  `Other_Revenue_RATE` decimal(8,4) DEFAULT NULL,
  `Cargo_Revenue_RATE` decimal(8,4) DEFAULT NULL,
  `Cargo_Beyond_Revenue_RATE` decimal(8,4) DEFAULT NULL,
  `Passenger_Beyond_Contribution_RATE` decimal(8,4) DEFAULT NULL,
  `Cargo_Beyond_Contribution_RATE` decimal(8,4) DEFAULT NULL,
  `Other_Revenue_M` decimal(15,2) DEFAULT NULL,
  `Cargo_Revenue_M` decimal(15,2) DEFAULT NULL,
  `SEC_Other_Revenue` decimal(15,2) DEFAULT NULL,
  `SEC_Cargo_Revenue` decimal(15,2) DEFAULT NULL,
  `SEC_Fuel_Exp` decimal(15,2) DEFAULT NULL,
  `Other_SEC_Tie_Rate` decimal(10,4) DEFAULT NULL,
  `Cargo_SEC_Tie_Rate` decimal(10,4) DEFAULT NULL,
  `Other_SEC_Tie` decimal(15,2) DEFAULT NULL,
  `Adj_Other_Revenue_M` decimal(15,2) DEFAULT NULL,
  `Cargo_SEC_Tie` decimal(15,2) DEFAULT NULL,
  `Adj_Cargo_Rev_M` decimal(15,2) DEFAULT NULL,
  `Total_Adj_Rev_M` decimal(15,2) DEFAULT NULL,
  `Local_Passengers` int(11) DEFAULT NULL,
  `Local_Revenue_M` decimal(15,2) DEFAULT NULL,
  `ADJ_Factor_REMOVE_REV` decimal(10,4) DEFAULT NULL,
  `Actual_AC___Proxy_AC` varchar(255) DEFAULT NULL,
  `AC_Type` varchar(255) DEFAULT NULL,
  `Maintenance___FH` decimal(15,2) DEFAULT NULL,
  `Maintenance___Dep` decimal(15,2) DEFAULT NULL,
  `Departures_Expense` decimal(15,2) DEFAULT NULL,
  `Pilot_Expense` decimal(15,2) DEFAULT NULL,
  `Ownership_Expense` decimal(15,2) DEFAULT NULL,
  `Flight_Attendant_Expense` decimal(15,2) DEFAULT NULL,
  `Ownership` decimal(15,2) DEFAULT NULL,
  `Flight_Attendant` decimal(15,2) DEFAULT NULL,
  `Departure` decimal(15,2) DEFAULT NULL,
  `Pilot` decimal(15,2) DEFAULT NULL,
  `Passenger_Expense` decimal(15,2) DEFAULT NULL,
  `Traffic_Expense` decimal(15,2) DEFAULT NULL,
  `Rent_Seats` decimal(10,2) DEFAULT NULL,
  `Landing_Fees_Per_Seat` decimal(10,2) DEFAULT NULL,
  `Indirect_Other_Variable_Per_Seat` decimal(10,2) DEFAULT NULL,
  `Cargo_Expense_Per_Pound` decimal(10,4) DEFAULT NULL,
  `Reservation___Sales_Per_Passenger` decimal(10,4) DEFAULT NULL,
  `Navigation_Fees_per_MTOW` decimal(10,4) DEFAULT NULL,
  `Indirect_Marketing_Expense_Per_Passenger` decimal(10,4) DEFAULT NULL,
  `Indirect_Other_Variable` decimal(15,2) DEFAULT NULL,
  `Cargo_Expense` decimal(15,2) DEFAULT NULL,
  `Reservations_Sales___Marketing` decimal(15,2) DEFAULT NULL,
  `Nav_Fees` decimal(15,2) DEFAULT NULL,
  `2nd_Degree__a_` decimal(10,4) DEFAULT NULL,
  `1st_Degree__b_` decimal(10,4) DEFAULT NULL,
  `Intercept__m_` decimal(10,4) DEFAULT NULL,
  `R2` decimal(10,4) DEFAULT NULL,
  `Stage_Length` decimal(10,2) DEFAULT NULL,
  `Fuel_Expense_A` decimal(15,2) DEFAULT NULL,
  `Fuel_Expense_B` decimal(15,2) DEFAULT NULL,
  `Fuel_Expense` decimal(15,2) DEFAULT NULL,
  `SEC_Fuel_True_up_Rate` decimal(10,4) DEFAULT NULL,
  `Fuel_True_up` decimal(15,2) DEFAULT NULL,
  `Adjusted_Fuel_Expense` decimal(15,2) DEFAULT NULL,
  `Lookup_ML_WO_CPA` varchar(255) DEFAULT NULL,
  `Fixed_Expense_RATE` decimal(10,4) DEFAULT NULL,
  `Fixed_Cost_Calc_1` decimal(15,2) DEFAULT NULL,
  `Expenses_For_True_Up` decimal(15,2) DEFAULT NULL,
  `Key_2` varchar(255) DEFAULT NULL,
  `Model_True_Up_Rate` decimal(10,4) DEFAULT NULL,
  `APAS_Cost_adjustment` decimal(15,2) DEFAULT NULL,
  `Profit_Ex_Profit_Sharing_and_Fixed_Cost` decimal(15,2) DEFAULT NULL,
  `Sum_SEC_Op_Ex` decimal(15,2) DEFAULT NULL,
  `Profit_Share_Ratio` decimal(10,4) DEFAULT NULL,
  `Profit_Sharing_Expense` decimal(15,2) DEFAULT NULL,
  `Unadjusted_Expense` decimal(15,2) DEFAULT NULL,
  `Op_Ex_Ratio` decimal(10,4) DEFAULT NULL,
  `Expense_SEC_Tie` decimal(15,2) DEFAULT NULL,
  `Total_Expense` decimal(15,2) DEFAULT NULL,
  `Variable_Expense` decimal(15,2) DEFAULT NULL,
  `Unadjusted_Expense_ex_Profit_Sharing` decimal(15,2) DEFAULT NULL,
  `FAC` varchar(255) DEFAULT NULL,
  `File_Reference` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table flight.test
DROP TABLE IF EXISTS `test`;
CREATE TABLE IF NOT EXISTS `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `File_Reference` varchar(255) NOT NULL DEFAULT '0',
  `Quarter` varchar(255) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  `Marketing_Airline` text DEFAULT NULL,
  `Operating_Airline` text DEFAULT NULL,
  `Origin` varchar(255) DEFAULT NULL,
  `Destination` varchar(255) DEFAULT NULL,
  `Origin_Hub` varchar(255) DEFAULT NULL,
  `Destination_Hub` varchar(255) DEFAULT NULL,
  `Hub` varchar(255) DEFAULT NULL,
  `Mkt_Op_One_Way_Airline_Route` varchar(255) DEFAULT NULL,
  `Segment_ID` varchar(255) DEFAULT NULL,
  `Airport_Group_Code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table flight.test1
DROP TABLE IF EXISTS `test1`;
CREATE TABLE IF NOT EXISTS `test1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Quarter` varchar(255) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
