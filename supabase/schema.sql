-- ==========================================
-- BLOOD DONATION MANAGEMENT SYSTEM SCHEMA
-- ==========================================

-- 1. USERS TABLE (for authentication/authorization)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role INT NOT NULL CHECK (role IN (0, 1, 2)), -- 0=user, 1=super_user, 2=admin
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    created_by INT REFERENCES users(user_id)
);

-- 2. DISTRICTS TABLE (Alexandria districts)
CREATE TABLE districts (
    district_id SERIAL PRIMARY KEY,
    district_name VARCHAR(100) UNIQUE NOT NULL,
    district_name_ar VARCHAR(100) 
);

-- Insert Alexandria districts
INSERT INTO districts (district_name, district_name_ar) VALUES
    ('Al-Montazah', 'المنتزه'),
    ('Al-Attarin', 'العطارين'),
    ('Al-Gomrok', 'الجمرك'),
    ('Al-Labban', 'اللبان'),
    ('Al-Mansheya', 'المنشية'),
    ('Bab Sharqi', 'باب شرقي'),
    ('Karmouz', 'كرموز'),
    ('Mina Al-Basal', 'مينا البصل'),
    ('Moharam Bek', 'محرم بك'),
    ('Sidi Gaber', 'سيدي جابر'),
    ('Sidi Bishr', 'سيدي بشر'),
    ('Smouha', 'سموحة'),
    ('Sporting', 'سبورتنج'),
    ('Stanley', 'ستانلي'),
    ('Roshdy', 'رشدي'),
    ('Zizinia', 'زيزينيا'),
    ('San Stefano', 'سان ستيفانو'),
    ('Gleem', 'جليم'),
    ('Miami', 'ميامي'),
    ('Asafra', 'العصافرة'),
    ('Mandara', 'المندرة'),
    ('Abu Qir', 'أبو قير'),
    ('Borg El Arab', 'برج العرب'),
    ('King Mariout', 'كينج مريوط'),
    ('Agami', 'العجمي'),
    ('Dekheila', 'الدخيلة'),
    ('Amreya', 'العامرية'),
    ('Bahig', 'بهيج');

-- 3. DONORS TABLE
CREATE TABLE donors (
    donor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL, -- who added this donor
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthdate DATE NOT NULL,
    phone_number VARCHAR(13) UNIQUE NOT NULL CHECK (phone_number LIKE '+20%'),
    blood_type VARCHAR(5) NOT NULL CHECK (blood_type IN ('Not listed','A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    district_id INT REFERENCES districts(district_id),
    full_address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DONATION SESSIONS TABLE
CREATE TABLE donations (
    donation_id SERIAL PRIMARY KEY,
    donor_id INT REFERENCES donors(donor_id) ON DELETE CASCADE,
    donation_year INT NOT NULL,
    donation_session INT NOT NULL CHECK (donation_session IN (1, 2)), -- 1=Jan-Jun, 2=Jul-Dec
    donation_date DATE,
    added_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(donor_id, donation_year, donation_session) -- One donation per session
);

-- 5. WHATSAPP MESSAGE LOGS (for tracking)
CREATE TABLE whatsapp_logs (
    log_id SERIAL PRIMARY KEY,
    sender_admin_id INT REFERENCES users(user_id),
    recipient_phone VARCHAR(13),
    message_type VARCHAR(10) CHECK (message_type IN ('text', 'image')),
    message_content TEXT,
    media_url TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent'
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_donors_blood_type ON donors(blood_type);
CREATE INDEX idx_donors_district ON donors(district_id);
CREATE INDEX idx_donors_phone ON donors(phone_number);
CREATE INDEX idx_donations_year_session ON donations(donation_year, donation_session);
CREATE INDEX idx_donations_donor_year ON donations(donor_id, donation_year);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to validate donor age (18-60)
CREATE OR REPLACE FUNCTION check_donor_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.birthdate IS NOT NULL THEN
        IF AGE(CURRENT_DATE, NEW.birthdate) < INTERVAL '18 years' 
           OR AGE(CURRENT_DATE, NEW.birthdate) > INTERVAL '60 years' THEN
            RAISE EXCEPTION 'Donor age must be between 18 and 60 years';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_donor_age
    BEFORE INSERT OR UPDATE ON donors
    FOR EACH ROW
    EXECUTE FUNCTION check_donor_age();

-- Function to ensure only 2 active admins
CREATE OR REPLACE FUNCTION limit_admin_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 2 THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 2 AND is_active = true) >= 2 
           AND (TG_OP = 'INSERT' OR OLD.role != 2) THEN
            RAISE EXCEPTION 'Maximum of 2 active admins allowed';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_limit_admins
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION limit_admin_count();

-- Function to update updated_at on donors
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_donor_timestamp
    BEFORE UPDATE ON donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();