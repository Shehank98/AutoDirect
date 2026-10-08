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
  ('Corolla Axio',(SELECT id FROM vehicle_manufacturer WHERE name='Toyota')),
  ('Grace',       (SELECT id FROM vehicle_manufacturer WHERE name='Honda')),
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
  ('White', '#ffffff'), ('Black', '#000000'), ('Silver', '#c0c0c0'), ('Red Mica', '#9c1c1c'), ('Gun Grey', '#5b6065'),
  ('Red', '#c0392b'), ('Blue', '#2c3e93'), ('Grey', '#7f8c8d'), ('Pearl White', '#f4f4ec');

-- Features
INSERT INTO vehicle_feature (name) VALUES
  ('Power Steering'), ('Power Mirror'), ('Air Conditioning'), ('ABS'),
  ('Airbags'), ('Alloy Wheels'), ('Navigation'), ('Reverse Camera'),
  ('Sunroof'), ('Leather Seats'), ('Push Start'), ('Cruise Control');

-- Vehicles (FKs resolved by name). Sample photos ship in /app/img.
INSERT INTO vehicle
  (vehicle_type, vehicle_manufacturer, vehicle_model, seo_url, main_color, trim, description,
   year, chassi_id, conditions, seats, doors, passengers, engine_capacity, mileage,
   fuel_type, transmission, drive_type, auction_grade, grade, price, location, stock_status, images, feature_ids,
   is_featured, is_latest, status)
VALUES
  ((SELECT id FROM vehicle_type WHERE name='Sedan'), (SELECT id FROM vehicle_manufacturer WHERE name='Toyota'),
   (SELECT id FROM vehicle_model WHERE name='Corolla Axio'), 'toyota-corolla-axio-2019',
   (SELECT id FROM vehicle_color WHERE name='Red Mica'), 'Hybrid WxB', 'Sample vehicle - replace in the admin.',
   '2019', 'NKE165-7185540', '', 5, 4, 5, '1500', '38200', 'Hybrid', 'Automatic', '2WD', '4.5', 'B', 11850000, 'Japan', 'Available',
   '["/app/img/corolla-axio.jpg"]', '[1,2,3,4,5,8,11,12]', true, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='Sedan'), (SELECT id FROM vehicle_manufacturer WHERE name='Honda'),
   (SELECT id FROM vehicle_model WHERE name='Grace'), 'honda-grace-2018',
   (SELECT id FROM vehicle_color WHERE name='Pearl White'), 'Hybrid EX', 'Sample vehicle - replace in the admin.',
   '2018', 'GM4-1204519', '', 5, 4, 5, '1500', '45600', 'Hybrid', 'Automatic', '2WD', '4', 'B', 9950000, 'Japan', 'Available',
   '["/app/img/honda-grace.jpg"]', '[1,2,3,4,5,8,11]', true, false, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'), (SELECT id FROM vehicle_manufacturer WHERE name='Nissan'),
   (SELECT id FROM vehicle_model WHERE name='X-Trail'), 'nissan-x-trail-2018',
   (SELECT id FROM vehicle_color WHERE name='Gun Grey'), '20Xi Hybrid', 'Sample vehicle - replace in the admin.',
   '2018', 'HNT32-172311', '', 7, 5, 7, '2000', '52800', 'Hybrid', 'Automatic', '4WD', '4', 'C', 16400000, 'Japan', 'Reserved',
   '["/app/img/xtrail-grey.jpg"]', '[1,2,3,4,5,8,11,7]', true, false, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'), (SELECT id FROM vehicle_manufacturer WHERE name='Nissan'),
   (SELECT id FROM vehicle_model WHERE name='X-Trail'), 'nissan-x-trail-2019',
   (SELECT id FROM vehicle_color WHERE name='Pearl White'), '20X Hybrid', 'Sample vehicle - replace in the admin.',
   '2019', 'HNT32-178214', '', 7, 5, 7, '2000', '31500', 'Hybrid', 'Automatic', '4WD', '4.5', 'A', 17250000, 'Japan', 'In transit',
   '["/app/img/xtrail-pearl.jpg"]', '[1,2,3,4,5,6,7,8,9,10,11,12]', true, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='Hatchback'), (SELECT id FROM vehicle_manufacturer WHERE name='Toyota'),
   (SELECT id FROM vehicle_model WHERE name='Aqua'), 'toyota-aqua-2020',
   (SELECT id FROM vehicle_color WHERE name='White'), 'G', 'Sample vehicle - replace in the admin.',
   '2020', 'NHP10-6873321', '', 5, 4, 5, '1500', '22400', 'Hybrid', 'Automatic', '2WD', '5', 'A', 7650000, 'Japan', 'In transit',
   '[]', '[1,2,3,4,5,11]', false, true, 1),

  ((SELECT id FROM vehicle_type WHERE name='SUV'), (SELECT id FROM vehicle_manufacturer WHERE name='Honda'),
   (SELECT id FROM vehicle_model WHERE name='Vezel'), 'honda-vezel-2017',
   (SELECT id FROM vehicle_color WHERE name='Black'), 'Hybrid Z', 'Sample vehicle - replace in the admin.',
   '2017', 'RU3-1250087', '', 5, 5, 5, '1500', '61200', 'Hybrid', 'Automatic', '2WD', '3.5', 'B', 10900000, 'Singapore', 'Available',
   '[]', '[1,2,3,4,5,8,6]', false, false, 1),

  ((SELECT id FROM vehicle_type WHERE name='Hatchback'), (SELECT id FROM vehicle_manufacturer WHERE name='Suzuki'),
   (SELECT id FROM vehicle_model WHERE name='Wagon R'), 'suzuki-wagon-r-2019',
   (SELECT id FROM vehicle_color WHERE name='Silver'), 'Stingray', 'Sample vehicle - replace in the admin.',
   '2019', 'MH55S-712094', '', 4, 4, 4, '660', '28900', 'Petrol', 'Automatic', '2WD', '4.5', 'B', 5250000, 'Japan', 'Sold',
   '[]', '[1,2,3,4,5,11]', false, false, 1);
