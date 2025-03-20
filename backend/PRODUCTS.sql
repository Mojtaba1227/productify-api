-- Create the PRODUCTS database
CREATE DATABASE PRODUCTS;

-- Use the PRODUCTS database


-- Create the product table
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    availability VARCHAR(50),
    price VARCHAR(50),
    short_description TEXT,
    date_created DATE
);

-- Import product data from the product3.csv file
-- when your importing the product3.csv file make sure to turn on the Header in Options
-- change db user, password, and port in api.js if you have another username, password and port are different
