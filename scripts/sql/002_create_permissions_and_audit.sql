-- Create permissions table to track who has access to which records
CREATE TABLE IF NOT EXISTS record_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES records(id) ON DELETE CASCADE,
    owner_email TEXT NOT NULL,
    grantee_email TEXT NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit trail table to track all access events
CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id UUID REFERENCES records(id) ON DELETE CASCADE,
    actor_email TEXT NOT NULL,
    actor_name TEXT,
    action TEXT NOT NULL CHECK (action IN ('VIEW', 'DOWNLOAD', 'GRANT_ACCESS', 'REVOKE_ACCESS', 'COMMIT_RECORD')),
    record_hash TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata TEXT,
    blockchain_tx_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_record_permissions_record_id ON record_permissions(record_id);
CREATE INDEX IF NOT EXISTS idx_record_permissions_grantee_email ON record_permissions(grantee_email);
CREATE INDEX IF NOT EXISTS idx_record_permissions_owner_email ON record_permissions(owner_email);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record_id ON audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_actor_email ON audit_trail(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_trail_owner_email ON audit_trail(owner_email);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail(action);

-- Enable Row Level Security (RLS)
ALTER TABLE record_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for record_permissions
CREATE POLICY "Users can view permissions for records they own" ON record_permissions
    FOR SELECT USING (owner_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can view permissions granted to them" ON record_permissions
    FOR SELECT USING (grantee_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Record owners can grant permissions" ON record_permissions
    FOR INSERT WITH CHECK (owner_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Record owners can update permissions" ON record_permissions
    FOR UPDATE USING (owner_email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for audit_trail
CREATE POLICY "Users can view audit trail for records they own" ON audit_trail
    FOR SELECT USING (owner_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can view audit trail for actions they performed" ON audit_trail
    FOR SELECT USING (actor_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "System can insert audit trail entries" ON audit_trail
    FOR INSERT WITH CHECK (true);

-- Insert sample permissions for testing
INSERT INTO record_permissions (record_id, owner_email, grantee_email, status) 
SELECT 
    r.id,
    r.owner_email,
    'doctor@test.com' as grantee_email,
    'ACTIVE'
FROM records r 
WHERE r.owner_email = 'patient@test.com' 
LIMIT 2;

-- Insert sample audit trail entries
INSERT INTO audit_trail (record_id, actor_email, actor_name, action, record_hash, owner_email, metadata)
SELECT 
    r.id,
    'doctor@test.com' as actor_email,
    'Dr. Sarah Lee' as actor_name,
    'VIEW' as action,
    r.hash as record_hash,
    r.owner_email,
    'Viewed file with granted permission'
FROM records r 
WHERE r.owner_email = 'patient@test.com' 
LIMIT 1;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_record_permissions_updated_at 
    BEFORE UPDATE ON record_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

