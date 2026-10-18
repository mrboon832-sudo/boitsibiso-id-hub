/*
 * Run from backend/: npm run seed
 * Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in .env.
 *
 * Demo citizens for the presentation (citizen password = National ID):
 * - Thabo Mokoena, 9804125012345: Traffic licence renewal pulls his verified ID.
 * - Mamello Khumalo, 8109236012346: Death registration pushes a pension benefit case.
 * - Kabelo Ntsoane, 9207157012347: Passport review has a restricted police flag check.
 * - Lerato Masupha, 7503018012348: Pension claim includes a payment-in-arrears case.
 * - Palesa Mofokeng, 9901289012349: Duplicate-looking passport submissions show staff review.
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dbConfig = require('../src/db/mysql-config');

const STAFF_PASSWORD = 'Password123!';
const timestamp = (date) => `${date} 09:30:00`;

const citizens = [
  ['9804125012345', 'Thabo Mokoena', '1998-04-12', 'male', 'Ha Thetsane', 'Maseru', '+266 50123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['8109236012346', 'Mamello Khumalo', '1981-09-23', 'female', 'Ha Motimposo', 'Maseru', '+266 58234567', 'married', 'community_of_property', ['Tebello Khumalo', 'Lineo Khumalo'], 'active', null, 'ussd', 'assisted'],
  ['9207157012347', 'Kabelo Ntsoane', '1992-07-15', 'male', 'Hlotse Central', 'Leribe', '+266 59123456', 'married', 'out_of_community', ['Neo Ntsoane'], 'active', null, 'web', 'standard'],
  ['7503018012348', 'Lerato Masupha', '1975-03-01', 'female', 'Ha Matala', 'Maseru', '+266 62123456', 'widowed', 'community_of_property', ['Mpho Masupha'], 'active', null, 'ussd', 'assisted'],
  ['9901289012349', 'Palesa Mofokeng', '1999-01-28', 'female', 'Teyateyaneng', 'Berea', '+266 63123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['6805061012350', 'Matshepo Radebe', '1968-05-06', 'female', 'Mafeteng Urban', 'Mafeteng', '+266 51123456', 'married', 'community_of_property', ['Lindiwe Radebe'], 'active', null, 'ussd', 'assisted'],
  ['0308172012351', 'Tumisang Molefe', '2003-08-17', 'male', 'Butha-Buthe Central', 'Butha-Buthe', '+266 52123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['8702223012352', 'Nthabiseng Sebelisoa', '1987-02-22', 'female', 'Qacha\'s Nek Urban', "Qacha's Nek", '+266 53123456', 'married', 'out_of_community', ['Karabo Sebelisoa', 'Mosa Sebelisoa'], 'active', null, 'web', 'standard'],
  ['9409304012353', 'Sello Makhubedu', '1994-09-30', 'male', 'Mokhotlong Central', 'Mokhotlong', '+266 54123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7206145012354', 'Mapaseka Mohapi', '1972-06-14', 'female', 'Thaba-Tseka Central', 'Thaba-Tseka', '+266 55123456', 'divorced', 'not_applicable', ['Lerato Mohapi'], 'active', null, 'ussd', 'assisted'],
  ['8904106012355', 'Teboho Likotsi', '1989-04-10', 'male', 'Mohale\'s Hoek Urban', "Mohale's Hoek", '+266 56123456', 'married', 'community_of_property', ['Khau Likotsi'], 'active', null, 'web', 'standard'],
  ['9601197012356', 'Lineo Phafoli', '1996-01-19', 'female', 'Quthing Urban', 'Quthing', '+266 57123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7907278012357', 'Moeketsi Mothae', '1979-07-27', 'male', 'Maputsoe', 'Leribe', '+266 58123456', 'married', 'out_of_community', ['Tshepiso Mothae'], 'active', null, 'web', 'standard'],
  ['0503119012358', 'Refiloe Ntoabala', '2005-03-11', 'female', 'Roma', 'Maseru', '+266 60123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['6308151012359', 'Mpho Ramakgopa', '1963-08-15', 'male', 'Berea Plateau', 'Berea', '+266 61123456', 'married', 'community_of_property', ['Lindi Ramakgopa'], 'active', null, 'ussd', 'assisted'],
  ['9101262012360', 'Senauoane Tsoeu', '1991-01-26', 'male', 'Maseru West', 'Maseru', '+266 62223456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['8505293012361', 'Mahlomola Qhobela', '1985-05-29', 'male', 'Mafeteng East', 'Mafeteng', '+266 63223456', 'married', 'community_of_property', ['Bokang Qhobela'], 'active', null, 'web', 'standard'],
  ['9711044012362', 'Boitumelo Nteso', '1997-11-04', 'female', 'Hlotse', 'Leribe', '+266 64223456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7012165012363', 'Matsepo Hlaele', '1970-12-16', 'female', 'Ha Tsolo', 'Quthing', '+266 65223456', 'widowed', 'community_of_property', ['Kamohelo Hlaele'], 'active', null, 'ussd', 'assisted'],
  ['9306086012364', 'Tlotliso Khiba', '1993-06-08', 'male', 'Mokhotlong Rural', 'Mokhotlong', '+266 66223456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['8202177012365', 'Masebelisoa Monaheng', '1982-02-17', 'female', 'Thaba-Tseka East', 'Thaba-Tseka', '+266 67223456', 'married', 'out_of_community', ['Lethabo Monaheng'], 'active', null, 'web', 'standard'],
  ['9503258012366', 'Khotso Mokhehle', '1995-03-25', 'male', 'Butha-Buthe North', 'Butha-Buthe', '+266 68223456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7609189012367', 'Nteboheleng Rantso', '1976-09-18', 'female', 'Qacha\'s Nek South', "Qacha's Nek", '+266 69223456', 'married', 'community_of_property', ['Puseletso Rantso'], 'active', null, 'ussd', 'assisted'],
  ['8807011012368', 'Lefu Matekane', '1988-07-01', 'male', 'Mohale\'s Hoek West', "Mohale's Hoek", '+266 70123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['0104262012369', 'Nokuthula Mokoena', '2001-04-26', 'female', 'Maseru Central', 'Maseru', '+266 71123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['6601093012370', 'Motlatsi Ralebese', '1966-01-09', 'male', 'Teyateyaneng North', 'Berea', '+266 72123456', 'married', 'community_of_property', ['Masego Ralebese'], 'active', null, 'ussd', 'assisted'],
  ['9008024012371', 'Bontle Mothobi', '1990-08-02', 'female', 'Mafeteng Central', 'Mafeteng', '+266 73123456', 'divorced', 'not_applicable', ['Paballo Mothobi'], 'active', null, 'web', 'standard'],
  ['8405135012372', 'Tebello Tšita', '1984-05-13', 'male', 'Leribe South', 'Leribe', '+266 74123456', 'married', 'out_of_community', ['Mpho Tšita', 'Lerato Tšita'], 'active', null, 'web', 'standard'],
  ['9802236012373', 'Nokwanda Mphahlele', '1998-02-23', 'female', 'Quthing North', 'Quthing', '+266 75123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7409087012374', 'Mokete Mothae', '1974-09-08', 'male', 'Mokhotlong West', 'Mokhotlong', '+266 76123456', 'married', 'community_of_property', ['Rethabile Mothae'], 'active', null, 'ussd', 'assisted'],
  ['0206058012375', 'Lindokuhle Mokoena', '2002-06-05', 'female', 'Thaba-Tseka Central', 'Thaba-Tseka', '+266 77123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['8603209012376', 'Katleho Nhlapo', '1986-03-20', 'male', 'Butha-Buthe Central', 'Butha-Buthe', '+266 78123456', 'married', 'community_of_property', ['Tšepo Nhlapo'], 'active', null, 'web', 'standard'],
  ['6907111012377', 'Mants\'ebo Khiba', '1969-07-11', 'female', 'Qacha\'s Nek Central', "Qacha's Nek", '+266 79123456', 'widowed', 'community_of_property', ['Palesa Khiba'], 'deceased', '2026-04-17', 'ussd', 'assisted'],
  ['9301252012378', 'Rethabile Tšolo', '1993-01-25', 'male', 'Mohale\'s Hoek East', "Mohale's Hoek", '+266 80123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['9606303012379', 'Bokang Mofolo', '1996-06-30', 'female', 'Maseru South', 'Maseru', '+266 81123456', 'married', 'out_of_community', ['Kea Mofolo'], 'active', null, 'web', 'standard'],
  ['8009214012380', 'Kamohelo Letuka', '1980-09-21', 'male', 'Berea Central', 'Berea', '+266 82123456', 'married', 'community_of_property', ['Lerato Letuka'], 'active', null, 'web', 'standard'],
  ['0401085012381', 'Puleng Radebe', '2004-01-08', 'female', 'Mafeteng West', 'Mafeteng', '+266 83123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['7704146012382', 'Tšepo Mokoena', '1977-04-14', 'male', 'Leribe Central', 'Leribe', '+266 84123456', 'divorced', 'not_applicable', ['Lerato Mokoena'], 'active', null, 'web', 'standard'],
  ['8906017012383', 'Masego Khoabane', '1989-06-01', 'female', 'Quthing South', 'Quthing', '+266 85123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
  ['0711228012384', 'Karabo Mofokeng', '2007-11-22', 'male', 'Ha Abia', 'Maseru', '+266 86123456', 'single', 'not_applicable', [], 'active', null, 'web', 'standard'],
];

const staff = [
  ['ha.officer', 'Home Affairs Officer', 'home_affairs', 'home_affairs', '+266 59000001'],
  ['traffic.officer', 'Traffic Officer', 'traffic', 'traffic', '+266 59000002'],
  ['pensions.officer', 'Pensions Officer', 'pensions', 'pensions', '+266 59000003'],
  ['police.officer', 'Police Officer', 'police', 'police', '+266 59000004'],
  ['passport.mokoena', 'Officer Mokoena', 'passport', 'passport', '+266 59000005'],
  ['finance.officer', 'Finance Officer', 'finance', 'finance', '+266 59000006'],
  ['admin', 'System Administrator', 'admin', 'admin', '+266 59000007'],
];

const applications = [
  ['app-thabo-license', '9804125012345', 'license_renewal', 'traffic', 'confirmed', 'web', 'Identity verified by Home Affairs. Licence ready for collection.', '2026-08-28', '2026-08-29'],
  ['app-mamello-death', '8109236012346', 'death_registration', 'home_affairs', 'completed', 'ussd', 'Death certificate confirmed; Pensions notified automatically.', '2026-08-21', '2026-08-23'],
  ['app-kabelo-passport', '9207157012347', 'passport_application', 'passport', 'in_review', 'web', 'Core identity verified. Police flag status check requested.', '2026-09-02', '2026-09-04'],
  ['app-lerato-pension', '7503018012348', 'pension_claim', 'pensions', 'pending_payment', 'staff_assisted', 'Benefit approved; payment is in arrears for two monthly cycles.', '2026-07-14', '2026-09-01'],
  ['app-palesa-passport-1', '9901289012349', 'passport_application', 'passport', 'submitted', 'web', 'Original passport application received.', '2026-08-12', '2026-08-12'],
  ['app-palesa-passport-2', '9901289012349', 'passport_application', 'passport', 'in_review', 'web', 'Possible duplicate of submission dated 2026-08-12; staff review required.', '2026-08-13', '2026-08-14'],
  ['app-matshepo-pension', '6805061012350', 'pension_claim', 'pensions', 'approved', 'ussd', 'Eligibility confirmed from verified civil status.', '2026-06-18', '2026-07-02'],
  ['app-tumisang-id', '0308172012351', 'id_renewal', 'home_affairs', 'pending', 'web', 'New photo appointment not yet attended.', '2026-09-05', '2026-09-05'],
  ['app-nthabiseng-license', '8702223012352', 'license_renewal', 'traffic', 'rejected', 'web', 'Outstanding traffic fine must be settled before renewal.', '2026-05-10', '2026-05-14'],
  ['app-sello-vehicle', '9409304012353', 'vehicle_registration', 'traffic', 'completed', 'staff_assisted', 'Vehicle registration completed after identity pull.', '2026-03-18', '2026-03-22'],
  ['app-mapaseka-id', '7206145012354', 'id_renewal', 'home_affairs', 'completed', 'ussd', 'National ID card collected at district office.', '2026-02-02', '2026-02-20'],
  ['app-teboho-passport', '8904106012355', 'passport_application', 'passport', 'approved', 'web', 'Passport production authorised.', '2026-04-08', '2026-04-21'],
  ['app-lineo-license', '9601197012356', 'license_renewal', 'traffic', 'in_review', 'web', 'Medical certificate awaiting verification.', '2026-08-18', '2026-08-19'],
  ['app-moeketsi-vehicle', '7907278012357', 'vehicle_registration', 'traffic', 'pending_payment', 'web', 'Registration fee invoice issued; payment still due.', '2026-09-01', '2026-09-01'],
  ['app-refiloe-id', '0503119012358', 'id_renewal', 'home_affairs', 'submitted', 'web', 'Application received and queued.', '2026-08-30', '2026-08-30'],
  ['app-mpho-pension', '6308151012359', 'pension_claim', 'pensions', 'completed', 'staff_assisted', 'Monthly benefit payment schedule activated.', '2026-01-15', '2026-02-04'],
  ['app-senauoane-passport', '9101262012360', 'passport_application', 'passport', 'rejected', 'web', 'Photograph did not meet document requirements.', '2026-06-09', '2026-06-12'],
  ['app-mahlomola-license', '8505293012361', 'license_renewal', 'traffic', 'approved', 'web', 'Licence renewal approved.', '2026-07-21', '2026-07-23'],
  ['app-boitumelo-id', '9711044012362', 'id_renewal', 'home_affairs', 'confirmed', 'web', 'Core identity record confirmed.', '2026-08-05', '2026-08-06'],
  ['app-matsepo-pension', '7012165012363', 'pension_claim', 'pensions', 'in_review', 'ussd', 'Dependent details being reviewed.', '2026-09-03', '2026-09-04'],
  ['app-tlotliso-vehicle', '9306086012364', 'vehicle_registration', 'traffic', 'submitted', 'staff_assisted', 'Ownership transfer documents received.', '2026-08-27', '2026-08-27'],
  ['app-masebelisoa-id', '8202177012365', 'id_renewal', 'home_affairs', 'pending', 'ussd', 'Waiting for staff-assisted biometric capture.', '2026-09-06', '2026-09-06'],
  ['app-khotso-passport', '9503258012366', 'passport_application', 'passport', 'completed', 'web', 'Passport collected from Maseru office.', '2026-01-25', '2026-02-18'],
  ['app-nteboheleng-license', '7609189012367', 'license_renewal', 'traffic', 'completed', 'ussd', 'Renewal completed.', '2026-03-03', '2026-03-08'],
  ['app-lefu-vehicle', '8807011012368', 'vehicle_registration', 'traffic', 'approved', 'web', 'Registration approved pending plate collection.', '2026-07-08', '2026-07-10'],
  ['app-nokuthula-id', '0104262012369', 'id_renewal', 'home_affairs', 'in_review', 'web', 'Identity details under routine review.', '2026-08-01', '2026-08-02'],
  ['app-motlatsi-pension', '6601093012370', 'pension_claim', 'pensions', 'pending_payment', 'staff_assisted', 'Payment details awaiting Finance validation.', '2026-07-04', '2026-07-12'],
  ['app-bontle-passport', '9008024012371', 'passport_application', 'passport', 'submitted', 'web', 'Application received.', '2026-09-07', '2026-09-07'],
  ['app-tebello-license', '8405135012372', 'license_renewal', 'traffic', 'confirmed', 'web', 'Identity verification completed.', '2026-08-24', '2026-08-25'],
  ['app-nokwanda-id', '9802236012373', 'id_renewal', 'home_affairs', 'approved', 'web', 'Replacement ID approved.', '2026-06-11', '2026-06-15'],
  ['app-mokete-vehicle', '7409087012374', 'vehicle_registration', 'traffic', 'rejected', 'staff_assisted', 'Chassis number differs from submitted documents.', '2026-05-02', '2026-05-06'],
  ['app-lindokuhle-passport', '0206058012375', 'passport_application', 'passport', 'pending', 'web', 'Awaiting document scan appointment.', '2026-09-08', '2026-09-08'],
  ['app-katleho-license', '8603209012376', 'license_renewal', 'traffic', 'completed', 'web', 'Renewal completed and digital receipt issued.', '2026-04-19', '2026-04-22'],
  ['app-mantsebo-death', '6907111012377', 'death_registration', 'home_affairs', 'completed', 'staff_assisted', 'Death certificate confirmed; survivor benefit notification sent.', '2026-04-18', '2026-04-20'],
  ['app-rethabile-id', '9301252012378', 'id_renewal', 'home_affairs', 'confirmed', 'web', 'Identity verified for replacement card.', '2026-08-09', '2026-08-10'],
  ['app-bokang-pension', '9606303012379', 'pension_claim', 'pensions', 'approved', 'web', 'Claim approved after eligibility confirmation.', '2026-06-28', '2026-07-05'],
  ['app-kamohelo-vehicle', '8009214012380', 'vehicle_registration', 'traffic', 'pending_payment', 'web', 'Overdue traffic fine of M1,250 must be settled before transfer.', '2026-08-16', '2026-09-02'],
  ['app-puleng-passport', '0401085012381', 'passport_application', 'passport', 'in_review', 'web', 'Police status check completed; application under review.', '2026-08-20', '2026-08-22'],
  ['app-tsepo-license', '7704146012382', 'license_renewal', 'traffic', 'approved', 'staff_assisted', 'Renewal approved after identity pull.', '2026-07-30', '2026-08-01'],
  ['app-masego-id', '8906017012383', 'id_renewal', 'home_affairs', 'submitted', 'web', 'Application received and queued.', '2026-09-09', '2026-09-09'],
];

const verificationRequests = [
  ['verify-thabo', 'traffic', 'traffic.officer', '9804125012345', 'Verify identity for driver licence renewal', 'completed', '2026-08-28', '2026-08-28'],
  ['verify-kabelo', 'passport', 'passport.mokoena', '9207157012347', 'Verify identity for passport application', 'completed', '2026-09-02', '2026-09-02'],
  ['verify-lerato', 'pensions', 'pensions.officer', '7503018012348', 'Verify identity for pension claim', 'completed', '2026-07-14', '2026-07-14'],
  ['verify-palesa', 'passport', 'passport.mokoena', '9901289012349', 'Verify identity for duplicate passport review', 'completed', '2026-08-13', '2026-08-13'],
  ['verify-sello', 'traffic', 'traffic.officer', '9409304012353', 'Verify identity for vehicle registration', 'completed', '2026-03-18', '2026-03-18'],
  ['verify-teboho', 'passport', 'passport.mokoena', '8904106012355', 'Verify identity for passport production', 'completed', '2026-04-08', '2026-04-08'],
  ['verify-mpho', 'pensions', 'pensions.officer', '6308151012359', 'Verify identity for pension payment setup', 'completed', '2026-01-15', '2026-01-15'],
  ['verify-kamohelo', 'traffic', 'traffic.officer', '8009214012380', 'Verify identity for vehicle ownership transfer', 'completed', '2026-08-16', '2026-08-16'],
];

const notifications = [
  ['notice-mamello-pension', 'home_affairs', 'pensions', '8109236012346', 'death_registered', 'actioned', '2026-08-23', '2026-08-24', { deceasedName: 'Mokhehle Khumalo', caseStatus: 'Death benefit case opened' }],
  ['notice-mantsebo-pension', 'home_affairs', 'pensions', '6907111012377', 'death_registered', 'pending', '2026-04-20', null, { deceasedName: "Mants'ebo Khiba", caseStatus: 'Awaiting pension officer action' }],
  ['notice-lerato-finance', 'pensions', 'finance', '7503018012348', 'payment_arrears_review', 'pending', '2026-09-01', null, { arrearsCycles: 2, amount: 'M3,600' }],
  ['notice-kamohelo-finance', 'traffic', 'finance', '8009214012380', 'overdue_fine', 'actioned', '2026-09-02', '2026-09-03', { fineAmount: 'M1,250', dueDate: '2026-08-30' }],
  ['notice-thabo-traffic', 'home_affairs', 'traffic', '9804125012345', 'identity_verified', 'actioned', '2026-08-28', '2026-08-29', { service: 'Driver licence renewal' }],
];

const policeFlags = [
  ['flag-kabelo', '9207157012347', 'travel_watchlist', 'high', 'High-security travel review required. Case details remain restricted to Police.', 'police.officer', '2026-08-30', 1],
  ['flag-puleng', '0401085012381', 'identity_review', 'medium', 'Identity review flag; share flag status only with authorised departments.', 'police.officer', '2026-08-18', 1],
  ['flag-mokete-closed', '7409087012374', 'vehicle_inquiry', 'low', 'Historic inquiry resolved; retained for audit demonstration.', 'police.officer', '2026-02-10', 0],
];

const flagRequests = [
  ['flag-request-kabelo', 'passport', 'passport.mokoena', '9207157012347', 'approved', 'police.officer', '2026-09-03', '2026-09-04'],
  ['flag-request-puleng', 'passport', 'passport.mokoena', '0401085012381', 'approved', 'police.officer', '2026-08-20', '2026-08-21'],
  ['flag-request-palesa', 'passport', 'passport.mokoena', '9901289012349', 'pending', null, '2026-09-05', null],
];

const auditEntries = [
  ['audit-thabo-submit', '9804125012345', 'Thabo Mokoena', 'citizen', 'SERVICE_REQUEST_SUBMITTED', '9804125012345', 'traffic', 'Licence renewal submitted through web portal.', '2026-08-28'],
  ['audit-thabo-pull', 'traffic.officer', 'Traffic Officer', 'traffic', 'VERIFICATION_REQUEST_PULL', '9804125012345', 'traffic', 'Core identity data shared for licence renewal.', '2026-08-28'],
  ['audit-thabo-complete', 'traffic.officer', 'Traffic Officer', 'traffic', 'APPLICATION_STATUS_UPDATED', '9804125012345', 'traffic', 'Licence renewal confirmed after Home Affairs verification.', '2026-08-29'],
  ['audit-mamello-death', 'ha.officer', 'Home Affairs Officer', 'home_affairs', 'CITIZEN_RECORD_UPDATED', '8109236012346', 'home_affairs', 'Death certificate confirmation recorded.', '2026-08-23'],
  ['audit-mamello-push', 'ha.officer', 'Home Affairs Officer', 'home_affairs', 'AUTO_NOTIFICATION_SENT', '8109236012346', 'home_affairs', 'Death registration sent to Pensions.', '2026-08-23'],
  ['audit-mamello-case', 'pensions.officer', 'Pensions Officer', 'pensions', 'NOTIFICATION_ACTIONED', '8109236012346', 'pensions', 'Death benefit case opened.', '2026-08-24'],
  ['audit-kabelo-pull', 'passport.mokoena', 'Officer Mokoena', 'passport', 'VERIFICATION_REQUEST_PULL', '9207157012347', 'passport', 'Core identity retrieved for passport review.', '2026-09-02'],
  ['audit-kabelo-flag-request', 'passport.mokoena', 'Officer Mokoena', 'passport', 'POLICE_FLAG_CHECK_REQUESTED', '9207157012347', 'passport', 'Restricted police flag status requested.', '2026-09-03'],
  ['audit-kabelo-flag-response', 'police.officer', 'Police Officer', 'police', 'POLICE_FLAG_CHECK_RESPONDED', '9207157012347', 'police', 'Flag status approved for Passport Services; case details withheld.', '2026-09-04'],
  ['audit-lerato-pull', 'pensions.officer', 'Pensions Officer', 'pensions', 'VERIFICATION_REQUEST_PULL', '7503018012348', 'pensions', 'Identity and civil status verified for claim.', '2026-07-14'],
  ['audit-palesa-duplicate', 'passport.mokoena', 'Officer Mokoena', 'passport', 'APPLICATION_STATUS_UPDATED', '9901289012349', 'passport', 'Duplicate-looking passport submission placed in review.', '2026-08-14'],
  ['audit-kamohelo-fine', 'finance.officer', 'Finance Officer', 'finance', 'NOTIFICATION_ACTIONED', '8009214012380', 'finance', 'Overdue traffic fine notification actioned.', '2026-09-03'],
];

function sharedIdentity(nationalId) {
  const citizen = citizens.find((row) => row[0] === nationalId);
  return JSON.stringify({
    nationalId: citizen[0], fullName: citizen[1], dob: citizen[2], gender: citizen[3],
    address: citizen[4], district: citizen[5], phone: citizen[6], status: citizen[10],
  });
}

async function insertRows(connection, sql, rows) {
  for (const row of rows) await connection.execute(sql, row);
}

async function main() {
  const pool = mysql.createPool(dbConfig);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Reset dependent workflow data before the shared citizen identity anchor.
    for (const table of ['audit_log', 'flag_requests', 'police_flags', 'notifications', 'verification_requests', 'applications', 'users', 'citizens']) {
      await connection.query(`DELETE FROM ${table}`);
    }

    // 1. Verified citizen identity anchor and citizen/staff accounts.
    await insertRows(connection, `INSERT INTO citizens (national_id, full_name, dob, gender, address, district, phone, marital_status, marital_regime, dependents, status, deceased_date, preferred_channel, literacy_level, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, citizens.map((row) => [
      ...row.slice(0, 9), JSON.stringify(row[9]), ...row.slice(10), timestamp('2025-10-01'), timestamp('2026-09-09'),
    ]));

    const citizenUsers = citizens.map((citizen) => [uuidv4(), citizen[0], bcrypt.hashSync(citizen[0], 10), 'citizen', null, citizen[0], citizen[1], citizen[6], citizen[12] === 'ussd' ? 'st' : 'en', 0, 0, 1, timestamp('2025-10-01')]);
    const staffUsers = staff.map(([username, fullName, role, department, phone]) => [uuidv4(), username, bcrypt.hashSync(STAFF_PASSWORD, 10), role, department, null, fullName, phone, 'en', 0, 0, 1, timestamp('2025-10-01')]);
    await insertRows(connection, `INSERT INTO users (id, username, password_hash, role, department, national_id, full_name, phone, language, large_text, must_change_password, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [...citizenUsers, ...staffUsers]);

    // 2. Department service records, all linked to the identity anchor.
    await insertRows(connection, `INSERT INTO applications (id, national_id, service_type, department, status, channel, notes, submitted_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, applications.map((row) => [...row.slice(0, 7), timestamp(row[7]), timestamp(row[8])]));

    // 3. Pull verification history.
    await insertRows(connection, `INSERT INTO verification_requests (id, requester_department, requester_user, national_id, purpose, status, data_shared, requested_at, responded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, verificationRequests.map((row) => [...row.slice(0, 6), sharedIdentity(row[3]), timestamp(row[6]), timestamp(row[7])]));

    // 4. Push notifications received by Pensions, Finance, and Traffic.
    await insertRows(connection, `INSERT INTO notifications (id, source_department, target_department, national_id, type, status, created_at, actioned_at, payload)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, notifications.map((row) => [...row.slice(0, 6), timestamp(row[6]), row[7] ? timestamp(row[7]) : null, JSON.stringify(row[8])]));

    // 5. Restricted Police flag records and disclosure requests.
    await insertRows(connection, `INSERT INTO police_flags (id, national_id, flag_type, severity, notes, visible_flag_only, created_by, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`, policeFlags.map((row) => [
    row[0], ...row.slice(1, 5), row[5], timestamp(row[6]), row[7],
  ]));
    await insertRows(connection, `INSERT INTO flag_requests (id, requesting_department, requesting_user, national_id, status, responded_by, requested_at, responded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, flagRequests.map((row) => [...row.slice(0, 6), timestamp(row[6]), row[7] ? timestamp(row[7]) : null]));

    // 6. Citizen-visible audit trail for the demonstration flows.
    await insertRows(connection, `INSERT INTO audit_log (id, actor_user, actor_name, actor_role, action, national_id, department, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, auditEntries.map((row) => [row[0], ...row.slice(1, 8), timestamp(row[8])]));

    await connection.commit();
    console.log(`Seeded ${citizens.length} citizens, ${applications.length} applications, and ${staffUsers.length} staff/admin accounts.`);
    console.log('Citizen password: National ID. Staff/admin password: Password123!');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`MySQL seed failed: ${error.message}`);
  process.exitCode = 1;
});