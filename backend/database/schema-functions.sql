
-- Deduct stock when order_packages are inserted
CREATE OR REPLACE FUNCTION deduct_package_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  found_items INTEGER;
BEGIN
  -- Check if there are mapped products
  SELECT COUNT(*) INTO found_items
  FROM package_items
  WHERE package_id = NEW.package_id;

  IF found_items > 0 THEN
    -- Loop and deduct product stock
    FOR item IN
      SELECT product_id, quantity
      FROM package_items
      WHERE package_id = NEW.package_id
    LOOP
      UPDATE products
      SET stock = stock - (item.quantity * NEW.quantity),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = item.product_id;
    END LOOP;
  ELSE
    -- Deduct stock directly from the package itself
    UPDATE packages
    SET stock = stock - NEW.quantity
    WHERE id = NEW.package_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deducting stock when a package is ordered
CREATE TRIGGER trigger_deduct_stock_on_package_order
AFTER INSERT ON order_packages
FOR EACH ROW
EXECUTE FUNCTION deduct_package_stock();

CREATE OR REPLACE FUNCTION update_related_packages_stock()
RETURNS TRIGGER AS $$
DECLARE
  pkg_id INTEGER;
  new_stock INTEGER;
BEGIN
  FOR pkg_id IN
    SELECT DISTINCT package_id
    FROM package_items
    WHERE product_id = NEW.id
  LOOP
    SELECT
      CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE MIN(FLOOR(p.stock / pi.quantity))
      END
    INTO new_stock
    FROM package_items pi
    JOIN products p ON pi.product_id = p.id
    WHERE pi.package_id = pkg_id;
    UPDATE packages
    SET stock = new_stock
    WHERE id = pkg_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update package stock after product stock changes
CREATE TRIGGER trg_auto_update_package_stock
AFTER UPDATE OF stock ON products
FOR EACH ROW
WHEN (OLD.stock IS DISTINCT FROM NEW.stock)
EXECUTE FUNCTION update_related_packages_stock();
