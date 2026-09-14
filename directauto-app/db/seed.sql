-- Sample data so the site isn't empty on first deploy.
-- (migrate.js only runs this when the vehicle table is empty.)
-- Seed images reuse the demo pictures shipped in /assets/images.

-- Types
INSERT INTO vehicle_type (name) VALUES
  ('Sedan'), ('SUV'), ('Hatchback'), ('Van'), ('Wagon'), ('Coupe'), ('Pickup');

-- Manufacturers (a few flagged featured for the footer "Top Categories")
INSERT INTO vehicle_manufacturer (name, is_featured) VALUES
  ('Toyota', true),
  ('Honda', true),
  ('Nissan', true),
  ('Suzuki', true),
  ('Mazda', false),
  ('Mitsubishi', false),
  ('Mercedes-Benz', true),
  ('BMW', false);

-- Models
INSERT INTO vehicle_model (name, manufacturer_id) VALUES
  ('Aqua',        (SELECT id FROM vehicle_manufacturer WHERE name='Toyota')),
  ('Premio',      (SELECT id FROM vehicle_manufacturer WHERE name='Toyota')),
  ('Land Cruiser',(SELECT id FROM vehicle_manufacturer WHERE name='Toyota')),
  ('Vezel',       (SELECT id FROM vehicle_manufacturer WHERE name='Honda')),
  ('Fit',         (SELECT id FROM vehicle_manufacturer WHERE name='Honda')),
  ('X-Trail',     (SELECT id FROM vehicle_manufacturer WHERE name='Nissan')),
  ('Leaf',        (SELECT id FROM vehicle_manufacturer WHERE name='Nissan')),
  ('Wagon R',     (SELECT id FROM vehicle_manufacturer WHERE name='Suzuki')),
  ('CX-5',        (SELECT id FROM vehicle_manufacturer WHERE name='Mazda')),
  ('C-Class',     (SELECT id FROM vehicle_manufacturer WHERE name='Mercedes-Benz'));

-- Colors
INSERT INTO vehicle_color (name, code) VALUES
  ('White', '#ffffff'), ('Black', '#000000'), ('Silver', '#c0c0c0'),
  ('Red', '#c0392b'), ('Blue', '#2c3e93'), ('Grey', '#7f8c8d'), ('Pearl White', '#f4f4ec');

-- Features
INSERT INTO vehicle_feature (name) VALUES
  ('Power Steering'), ('Power Mirror'), ('Air Conditioning'), ('ABS'),
  ('Airbags'), ('Alloy Wheels'), ('Navigation'), ('Reverse Camera'),
  ('Sunroof'), ('Leather Seats'), ('Push Start'), ('Cruise Control');

-- Vehicles (FKs resolved by name; images point at demo pictures in /assets/images)
INSERT INTO vehicle
  (vehicle_type, vehicle_manufacturer, vehicle_model, seo_url, main_color, description,
   year, chassi_id, conditions, seats, doors, passengers, engine_capacity, mileage,
   fuel_type, transmission, drive_type, auction_grade, grade, price, images, feature_ids,
   is_featured, is_latest, status)
VALUES
  ((SELECT id FROM vehicle_type WHERE name='Hatchback'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Toyota'),
   (SELECT id FROM vehicle_model WHERE name='Aqua'),
   'toyota-aqua-2018',
   (SELECT id FROM vehicle_color WHERE name='Pearl White'),
   'Fuel-efficient hybrid hatchback, freshly imported and auction verified.',
   '2018', 'NHP10-2536987', 'Excellent condition, non-accident.', 5, 4, 5, '1500', '45000',
   'Hybrid', 'Automatic', '2WD', '4.5', 'A', 4850000,
   '["/assets/images/1.jpg","/assets/images/2.jpg","/assets/images/3.jpg"]',
   '[1,2,3,4,6,8]', true, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Honda'),
   (SELECT id FROM vehicle_model WHERE name='Vezel'),
   'honda-vezel-2019',
   (SELECT id FROM vehicle_color WHERE name='Black'),
   'Sporty compact SUV with premium interior and low mileage.',
   '2019', 'RU3-1204587', 'Top grade, well maintained.', 5, 4, 5, '1500', '32000',
   'Hybrid', 'Automatic', '2WD', '5', 'A', 6250000,
   '["/assets/images/4.jpg","/assets/images/5.jpg"]',
   '[1,2,3,4,5,6,7,8]', true, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Nissan'),
   (SELECT id FROM vehicle_model WHERE name='X-Trail'),
   'nissan-x-trail-2017',
   (SELECT id FROM vehicle_color WHERE name='Silver'),
   'Spacious 7-seater family SUV, 4WD, ideal for long trips.',
   '2017', 'T32-0458796', 'Good condition, minor wear.', 7, 5, 7, '2000', '68000',
   'Petrol', 'Automatic', '4WD', '4', 'B', 5600000,
   '["/assets/images/6.jpg","/assets/images/7.jpg"]',
   '[1,2,3,4,6]', false, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='Sedan'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Toyota'),
   (SELECT id FROM vehicle_model WHERE name='Premio'),
   'toyota-premio-2016',
   (SELECT id FROM vehicle_color WHERE name='White'),
   'Comfortable executive sedan, smooth ride, reliable.',
   '2016', 'NZT260-3098745', 'Clean, non-accident.', 5, 4, 5, '1500', '78000',
   'Petrol', 'Automatic', '2WD', '4', 'B', 5200000,
   '["/assets/images/2.jpg","/assets/images/3.jpg"]',
   '[1,2,3,6]', true, false, 1),

  ((SELECT id FROM vehicle_type WHERE name='Hatchback'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Suzuki'),
   (SELECT id FROM vehicle_model WHERE name='Wagon R'),
   'suzuki-wagon-r-2019',
   (SELECT id FROM vehicle_color WHERE name='Grey'),
   'Economical city car with great fuel economy and low running cost.',
   '2019', 'MH55S-7845123', 'Like new, single owner.', 4, 4, 4, '660', '21000',
   'Hybrid', 'Automatic', '2WD', '5', 'A', 3450000,
   '["/assets/images/3.jpg","/assets/images/1.jpg"]',
   '[1,3,6,11]', false, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'),
   (SELECT id FROM vehicle_manufacturer WHERE name='Mazda'),
   (SELECT id FROM vehicle_model WHERE name='CX-5'),
   'mazda-cx-5-2018',
   (SELECT id FROM vehicle_color WHERE name='Red'),
   'Stylish crossover with skyactiv engine and premium finish.',
   '2018', 'KF2P-2011478', 'Excellent, fully loaded.', 5, 5, 5, '2200', '54000',
   'Diesel', 'Automatic', '4WD', '4.5', 'A', 7100000,
   '["/assets/images/5.jpg","/assets/images/4.jpg"]',
   '[1,2,3,4,5,6,7,9,10]', true, false, 1);
