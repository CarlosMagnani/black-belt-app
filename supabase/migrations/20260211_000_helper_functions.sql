-- Helper function: update_updated_at
-- Usada em triggers para atualizar automaticamente a coluna updated_at

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Trigger function para atualizar automaticamente updated_at';
