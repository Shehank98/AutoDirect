// Shared vehicle SELECT + the mapping from a DB row to the shape the frontend components use.
// One SELECT joins taxonomy names and rolls up feature names, so callers get ready-to-render rows.
const VEHICLE_SELECT = `
  SELECT v.*,
         t.name  AS type_name,
         m.name  AS manufacturer_name,
         mo.name AS model_name,
         c.name  AS color_name,
         c.code  AS color_code,
         COALESCE(
           (SELECT json_agg(f.name ORDER BY f.name)
              FROM vehicle_feature f
             WHERE f.id = ANY (SELECT jsonb_array_elements_text(v.feature_ids)::int)),
           '[]'
         ) AS feature_names
    FROM vehicle v
    LEFT JOIN vehicle_type         t  ON t.id  = v.vehicle_type
    LEFT JOIN vehicle_manufacturer m  ON m.id  = v.vehicle_manufacturer
    LEFT JOIN vehicle_model        mo ON mo.id = v.vehicle_model
    LEFT JOIN vehicle_color        c  ON c.id  = v.main_color
`;

const digits = (s) => { const n = parseInt(String(s == null ? '' : s).replace(/[^0-9]/g, ''), 10); return Number.isFinite(n) ? n : 0; };
const refOf = (id) => 'AD-' + String(id).padStart(4, '0');

function toVehicle(r) {
  const images = Array.isArray(r.images) ? r.images : [];
  return {
    id: refOf(r.id),          // public reference, used as the React key and in the compare list
    dbId: r.id,               // numeric id, used when posting an inquiry
    seo: r.seo_url,
    make: r.manufacturer_name || '',
    model: r.model_name || '',
    grade: r.trim || '',
    year: parseInt(r.year, 10) || 0,
    mileage: digits(r.mileage),
    fuel: r.fuel_type || '',
    trans: r.transmission || '',
    drive: r.drive_type || '',
    engine: digits(r.engine_capacity),
    color: r.color_name || r.other_color || '',
    type: r.type_name || '',
    price: r.price == null ? null : Number(r.price),
    auctionGrade: r.auction_grade || '',
    interior: r.grade || '',
    status: r.stock_status || 'Available',
    chassis: r.chassi_id || '',
    img: images[0] || null,
    images,
    featured: !!r.is_featured,
    isNew: !!r.is_latest,
    features: r.feature_names || [],
    location: r.location || '',
    description: r.description || '',
    conditions: r.conditions || '',
    seats: r.seats, doors: r.doors,
    added: r.created_at,
  };
}

function toLot(r) {
  return {
    id: r.id, lot: r.lot_no, house: r.house, date: r.auction_date, endsAt: r.ends_at,
    make: r.make, model: r.model, grade: r.trim, year: r.year, chassis: r.chassis, mileage: r.mileage || 0,
    auctionGrade: r.auction_grade, interior: r.interior, start: r.start_price, current: r.current_price || r.start_price || 0,
    img: r.image || null,
  };
}

module.exports = { VEHICLE_SELECT, toVehicle, toLot, refOf };
