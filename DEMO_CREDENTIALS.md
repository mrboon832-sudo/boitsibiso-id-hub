# Unity National ID Hub Demo Credentials

These are demo-only accounts currently seeded in the MySQL `boitsibiso` database.

## Application Login

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`

## Staff and Admin Accounts

All staff and admin accounts use the password `Password123!`.

| Username | Role | Department | Name |
|---|---|---|---|
| `ha.officer` | Home Affairs staff | Home Affairs | Home Affairs Officer |
| `traffic.officer` | Staff | Traffic | Traffic Officer |
| `finance.officer` | Staff | Finance | Finance Officer |
| `pensions.officer` | Staff | Pensions | Pensions Officer |
| `police.officer` | Staff | Police | Police Officer |
| `passport.mokoena` | Staff | Passport Services | Officer Mokoena |
| `admin` | Administrator | Admin | System Administrator |

## Citizen Accounts

For every citizen account:

- **Username:** National ID number
- **Password:** The same National ID number

| Name | National ID / Username | Preferred demo path |
|---|---|---|
| Thabo Mokoena | `9804125012345` | Traffic licence renewal and identity verification pull |
| Mamello Khumalo | `8109236012346` | USSD death-registration and Pensions notification |
| Kabelo Ntsoane | `9207157012347` | Passport review and Police flag disclosure |
| Lerato Masupha | `7503018012348` | Pension claim and payment arrears |
| Palesa Mofokeng | `9901289012349` | Duplicate passport submission review |
| Matshepo Radebe | `6805061012350` | Pension claim |
| Tumisang Molefe | `0308172012351` | National ID renewal |
| Nthabiseng Sebelisoa | `8702223012352` | Rejected licence renewal / outstanding fine |
| Sello Makhubedu | `9409304012353` | Vehicle registration |
| Mapaseka Mohapi | `7206145012354` | USSD ID renewal |
| Teboho Likotsi | `8904106012355` | Passport application |
| Lineo Phafoli | `9601197012356` | Licence renewal in review |
| Moeketsi Mothae | `7907278012357` | Vehicle registration pending payment |
| Refiloe Ntoabala | `0503119012358` | ID renewal |
| Mpho Ramakgopa | `6308151012359` | Pension payment setup |
| Senauoane Tsoeu | `9101262012360` | Rejected passport application |
| Mahlomola Qhobela | `8505293012361` | Approved licence renewal |
| Boitumelo Nteso | `9711044012362` | Confirmed ID renewal |
| Matsepo Hlaele | `7012165012363` | Pension claim in review |
| Tlotliso Khiba | `9306086012364` | Vehicle registration |
| Masebelisoa Monaheng | `8202177012365` | USSD ID renewal |
| Khotso Mokhehle | `9503258012366` | Completed passport application |
| Nteboheleng Rantso | `7609189012367` | USSD licence renewal |
| Lefu Matekane | `8807011012368` | Vehicle registration |
| Nokuthula Mokoena | `0104262012369` | ID renewal in review |
| Motlatsi Ralebese | `6601093012370` | Pension payment pending |
| Bontle Mothobi | `9008024012371` | Passport application |
| Tebello Tšita | `8405135012372` | Confirmed licence renewal |
| Nokwanda Mphahlele | `9802236012373` | Approved ID renewal |
| Mokete Mothae | `7409087012374` | Rejected vehicle registration |
| Lindokuhle Mokoena | `0206058012375` | Passport application pending |
| Katleho Nhlapo | `8603209012376` | Completed licence renewal |
| Mants'ebo Khiba | `6907111012377` | Deceased citizen and survivor benefit notification |
| Rethabile Tšolo | `9301252012378` | Confirmed ID renewal |
| Bokang Mofolo | `9606303012379` | Approved pension claim |
| Kamohelo Letuka | `8009214012380` | Overdue traffic fine |
| Puleng Radebe | `0401085012381` | Passport review with Police identity flag |
| Tšepo Mokoena | `7704146012382` | Approved licence renewal |
| Masego Khoabane | `8906017012383` | ID renewal |
| Karabo Mofokeng | `0711228012384` | Low-activity citizen record |

## USSD Phone Demo

Open the separate phone terminal at `http://localhost:5173/#/ussd`.

For the USSD flow, the citizen's **National ID is entered first**, then the **PIN is the same National ID number**:

| Citizen | National ID | USSD PIN | Best use |
|---|---|---|---|
| Mamello Khumalo | `8109236012346` | `8109236012346` | Accessible death-registration and pension-benefit story |
| Thabo Mokoena | `9804125012345` | `9804125012345` | Application tracking and licence-renewal status |
| Mants'ebo Khiba | `6907111012377` | `6907111012377` | Deceased-record and survivor-benefit scenario |
| Lerato Masupha | `7503018012348` | `7503018012348` | Pension claim and arrears scenario |
| Mapaseka Mohapi | `7206145012354` | `7206145012354` | Simple completed USSD ID renewal |

Example phone-terminal sequence:

1. Select **DIAL**.
2. Enter National ID: `8109236012346`.
3. Enter PIN: `8109236012346`.
4. Choose a numbered menu option, such as `1` for applications or `2` to request a service.

## Presentation Walkthrough Order

1. Log in as `9804125012345` / `9804125012345` to show Thabo's citizen dashboard, licence application, and data-sharing feed.
2. Log in as `traffic.officer` / `Password123!` to show the Traffic queue and Department Verification Request flow for Thabo.
3. Log in as `8109236012346` / `8109236012346` or use the USSD screen to demonstrate Mamello's accessible path.
4. Log in as `pensions.officer` / `Password123!` to show Mamello's death-registration notification and benefit case.
5. Log in as `passport.mokoena` / `Password123!` and search for `9207157012347` to demonstrate Kabelo's verified identity and restricted Police flag.
6. Log in as `police.officer` / `Password123!` to show the full Police-side flag while other departments see flag status only.
7. Search for `9901289012349` as Passport Services to demonstrate Palesa's duplicate-looking submissions.

## Resetting Demo Data

From the repository root:

```powershell
Push-Location backend
npm run migrate
npm run seed
Pop-Location
```

`npm run seed` clears and repopulates the MySQL demo tables in a transaction. It does not change the MySQL server account password.

> These credentials are for the local classroom prototype only. Do not use them in production or with real citizen data.
