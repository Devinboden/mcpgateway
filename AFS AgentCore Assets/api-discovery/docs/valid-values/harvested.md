# Harvested picklist code lists (dd3 UI · react-select + native-select extraction)

**155 coded fields · 3720 code→label rows**, pulled directly from the AFS origination UI — react-select `props.options` ({code,literal}) via React-fiber walk plus native `<select>` `<option>` scrape, across WP origination steps (no per-dropdown clicking). Keyed by the field's input id. Machine-readable source: `captured/harvested_picklists.json`. Extraction technique + the underlying picklist API (`/rs/pl/fixed` · `/rs/pl/dynamic`) in catalog.md and ../writes/picklist_api.md.

### `accountType` — Account Type  (31)

| code | label |
|------|-------|
| `0` | Not Entered |
| `01` | Secured |
| `02` | Unsecured |
| `2C` | Agriculture Real Estate |
| `03` | Partially Secured |
| `04` | Home Improvement |
| `05` | FHA Home Improvement |
| `5A` | Junior Real Estate Loan |
| `5B` | Second Mortgage |
| `6A` | Commercial Installment |
| `6B` | Commercial Mortgage |
| `6D` | Home Equity Line |
| `7A` | Commercial Credit Line |
| `7B` | Agriculture |
| `08` | Real Estate Type Unknown |
| `9A` | Secured Home Improvement |
| `9B` | Business Line Personal |
| `10` | Business Loan |
| `11` | Recreational Merchandise |
| `12` | Education |
| `15` | Line of Credit |
| `17` | Manufactured Housing |
| `19` | FHA Real Estate |
| `25` | VA Real Estate |
| `26` | Conventional Real Estate |
| `47` | Credit Line Secured |
| `65` | Government Unsecured |
| `66` | Government Secured |
| `67` | Home Equity Line |
| `0A` | Time Share Loan |
| `0F` | Construction Loan |

### `activeInProd` — Active In Production  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `advAftrMatOpt` — Advance After Maturity Option  (3)

| code | label |
|------|-------|
| `0` | Age as of Maturity Date |
| `1` | Age as of Maturity once Maturity has Billed |
| `2` | Age as of the Next Due Date |

### `amtPctInd` — Amount/Percent  (2)

| code | label |
|------|-------|
| `1` | Percent |
| `2` | Amount |

### `application` — Application  (2)

| code | label |
|------|-------|
| `1` | *Commercial Loan |
| `2` | *OTHER LOANS |

### `applicationCollected` — Application Collected  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `assignmentUnit` — Assignment Unit  (16)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1001500` | *Commercial Lending- East |
| `1002500` | *Commercial Lending- Central |
| `1003500` | *Commercial Lending- West |
| `1007500` | *Commercial Bank - UK |
| `2001500` | *Commercial Real Estate- East |
| `2002500` | *Commercial Real Estate- Central |
| `2003500` | *Commercial Real Estate- West |
| `3001500` | *Corporate Banking- East |
| `3002500` | *Corporate Banking- Central |
| `3003500` | *Corporate Banking- West |
| `4001500` | *SBA Lending- East |
| `4002500` | *SBA Lending- Central |
| `4003500` | *SBA Lending- West |
| `5005500` | *Automation AU |
| `5005999` | *Offset Entries Only |

### `autoWaiveInd` — Auto Waive Override  (2)

| code | label |
|------|-------|
| `0` | Auto Waive Processing Enabled |
| `1` | No Auto Waive Processing |

### `bankTaxCode` — Bank Tax Code  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Tax Exempt |
| `2` | Taxable |

### `baseRate` — Index Rate  (29)

| code | label |
|------|-------|
| `10` | 1 Mo LIBOR, Rd Up 1/16-2 Days Lookback |
| `7` | 1 Month LIBOR |
| `13` | 1 Month LIBOR - 2 Day Lookback UK |
| `9` | 1 Month LIBOR - 2 Days Lookback |
| `8` | 1 Month LIBOR Rounded upto nearest 16th |
| `38` | 1 year rate |
| `42` | 10 Year Rate |
| `33` | 180-Day Average SOFR |
| `39` | 2- Year Treasury Rate |
| `43` | 20 Year Rate |
| `40` | 3 Year Rate |
| `41` | 30 Year Rate |
| `31` | 30-Day Average SOFR |
| `44` | 5 Year Rate |
| `32` | 90-Day Average SOFR |
| `1` | AFS Bank Prime Rate |
| `2` | Fixed Rate |
| `36` | FTA Servicing Fee |
| `3` | LIBOR |
| `11` | London - 1 Month LIBOR - 2 Day Lookback |
| `12` | London - LIBOR Market Index (LMI) |
| `4` | Manual Fixed Rate |
| `6` | Manual Floating Rate |
| `14` | SBA FTA Servicing Fee - SYSTEM ASSIGNED |
| `37` | SOFR Accurate Rates |
| `34` | SOFR Daily Rate |
| `30` | SOFR Index |
| `35` | SOFR Rate |
| `5` | Wall Street Journal Prime Rate |

### `basis` — Basis  (7)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | 30/360 |
| `2` | 30/365 |
| `3` | 30/Actual |
| `4` | Actual/360 |
| `5` | Actual/365 |
| `6` | Actual/Actual |

### `billAloneCode` — Bill Alone Indicator  (3)

| code | label |
|------|-------|
| `1` | Bill obligation separately |
| `2` | Consolidate matching billing |
| `3` | Consolidated matching billing, except Maturity |

### `billTypeCode` — Bill Type Code  (4)

| code | label |
|------|-------|
| `1` | Detailed Bill |
| `3` | Summary Bill |
| `4` | Summary Bill with Escrow Detail |
| `5` | Detail Bill with Escrow Detail |

### `borrower` — Borrower  (1)

| code | label |
|------|-------|
| `9020000091488647` | Piedmont PCI - 34160 |

### `calc1` — Calculation Type 1  (5)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Add |
| `2` | Subtract |
| `3` | Multiply |
| `5` | Matrix |

### `calendarCode` — Calendar  (3)

| code | label |
|------|-------|
| `1` | *American Calendar |
| `2` | *London Calendar |
| `5` | *SOFR Calendar |

### `ceyFeeInd` — FASB?  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `chargeType` — Charge Type  (11)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Interest |
| `4` | Accrual Fee |
| `5` | Flat Fee |
| `7` | Cost of Funds |
| `8` | Escrow |
| `9` | Late Charge |
| `10` | Fixed Cost |
| `11` | Trade Discount |
| `12` | Trade Premium |
| `15` | Prepayment Premium |

### `closeOptionInd` — Auto Close Commitment Option  (3)

| code | label |
|------|-------|
| `0` | Do Not Automatically Close |
| `1` | Close Automatically if within Tolerance |
| `2` | Close Automatically at Maturity |

### `collateralType` — Collateral Type  (274)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1000` | UNSC - Unsecured |
| `1001` | Unsecured |
| `1100` | C&UST - Cash & Equiv Held This Bank |
| `1130` | C&UST - US Treasury Bonds |
| `1200` | AGRI - Agri-Crops/Livestock/Equip |
| `1206` | AGRI - Agricultural Processors |
| `1212` | AGRI - Agricultural Services |
| `1218` | AGRI - Other Agriculture Asset |
| `1224` | FARM - Convential Farm-Rural Agri |
| `1230` | FARM - Farm Assets |
| `1236` | FARM - Farm Products |
| `1242` | FARM - Farm Properties |
| `1248` | FARM - Farm/Agricl Incl Residence |
| `1254` | FARM - Farmland/Ranch Land |
| `1260` | FARM - Livestock |
| `1266` | FARM - Poultry |
| `1300` | ARIO - Accounts Receivable |
| `1305` | ARIO - Accounts Receivable-Trad & Rec Held |
| `1310` | ARIO - Accts Receivable And Inventory |
| `1315` | ARIO - Accts Recvble & Inven - Mach & Equip |
| `1320` | ARIO - All Business Assets |
| `1325` | ARIO - Bus Assets Secure Guar(Indir Coll) |
| `1330` | ARIO - Floor Planned Assets |
| `1335` | ARIO - Inventory |
| `1340` | ARIO - Inventory-Commod Traded-Intl Exchg |
| `1345` | ARIO - Inventory-Commod-Non Exchg-Traded |
| `1350` | ARIO - Inventory-Oil & Gas Reserves |
| `1355` | ARIO - Other Accts Receivable |
| `1360` | ARIO - Other Business Assets |
| `1365` | ARIO - Pledged Assets |
| `1370` | ARIO - Receivables From Subsidiaries |
| `1375` | ARIO - Receivables Supported By Bank |
| `1380` | ARIO - Trade Assets |
| `1385` | ARIO - Trade Receivables w/Guaranty Insurance |
| `1400` | ASGN - Agreement |
| `1405` | ASGN - Architect/Engineer/Genl Contr |
| `1410` | ASGN - CD Auto Renewable At This Bank |
| `1415` | ASGN - CD Non-Renewable At This Bank |
| `1420` | ASGN - Commissions & Other Related |
| `1425` | ASGN - Contracts& Licenses (Other) |
| `1430` | ASGN - Contracts/Licenses(Spec Perf) |
| `1435` | ASGN - Debt-Other Promissory Notes |
| `1440` | ASGN - Deeds Trust |
| `1445` | ASGN - Derivative Proceeds |
| `1450` | ASGN - Film Dist Cntrcts |
| `1455` | ASGN - Film/Recording Libraries/Copyright |
| `1460` | ASGN - General CD |
| `1465` | ASGN - Income |
| `1470` | ASGN - Inventory |
| `1475` | ASGN - Leased Assets |
| `1480` | ASGN - Leases |
| `1485` | ASGN - Letters of Credit |
| `1490` | ASGN - Life Insurance |
| `1495` | ASGN - Limited Liab Corporation Int |
| `1500` | ASGN - Money Market Accounts |
| `1505` | ASGN - Mortgages |
| `1510` | ASGN - Mutual Funds |
| `1515` | ASGN - Notes (Not RE Secd) |
| `1520` | ASGN - Other |
| `1525` | ASGN - Partnership Interest |
| `1530` | ASGN - Pension Fund Proceeds |
| `1535` | ASGN - Plans/Specs/Permits |
| `1540` | ASGN - Proceeds |
| `1545` | ASGN - Promissory Notes (Secd By Td) |
| `1550` | ASGN - Proprietary Lease RE (Co-Op) |
| `1555` | ASGN - Rents - RE Related |
| `1560` | ASGN - Rents/Leases/Profits |
| `1565` | ASGN - Trust |
| `2000` | CMRE - Assisted Living Facilities |
| `2001` | All Business Assets |
| `2004` | CMRE - Automotive Dealer |
| `2008` | CMRE - Bldgs w/Leasehold On Land |
| `2012` | CMRE - Commercial Condo |
| `2016` | CMRE - Commercial Co-Op |
| `2020` | CMRE - Comml Auto Dealerships |
| `2024` | CMRE - Comml Office Bldg/City Loc |
| `2028` | CMRE - Comml Office In Suburbs |
| `2032` | CMRE - Educational Properties |
| `2036` | CMRE - Full Service Hotel/Motel |
| `2040` | CMRE - Health Club |
| `2044` | CMRE - Healthcare Facilities |
| `2048` | CMRE - Hospitals |
| `2052` | CMRE - Industrial |
| `2056` | CMRE - Industrial Mfg Facility |
| `2060` | CMRE - Investor - Retail |
| `2064` | CMRE - Investor-Commercial |
| `2068` | CMRE - Investor-Office Building |
| `2072` | CMRE - Inv-Warehouse Bulk Storage |
| `2076` | CMRE - Manufacturing Facility Factory |
| `2080` | CMRE - Mini-Stor Facilities/Whse |
| `2084` | CMRE - Mixed Use - Non Residential |
| `2088` | CMRE - Mixed Use - Residential |
| `2092` | CMRE - Mixed Use Office |
| `2096` | CMRE - Modular Buildings - Commercial |
| `2100` | CMRE - Mortgage Banking-Construction |
| `2104` | CMRE - Mortgage Banking-Warehouse-Other |
| `2108` | CMRE - Mortgage Warehousing - Comml |
| `2112` | CMRE - Mortgage Warehousing - Convent |
| `2116` | CMRE - Mortgage Warehousing - FHA |
| `2120` | CMRE - Mortgage/Contracts On Energy Equip |
| `2124` | CMRE - Nursing Homes |
| `2128` | CMRE - Office Building Medical |
| `2132` | CMRE - Other Buildings |
| `2136` | CMRE - Other Industrial |
| `2140` | CMRE - Other Retail |
| `2144` | CMRE - Parking Properties |
| `2148` | CMRE - Recreational |
| `2152` | CMRE - Religious Purposes |
| `2156` | CMRE - Restaurant |
| `2160` | CMRE - Retail-Mall, Regional Center |
| `2164` | CMRE - Retail-Shop Ctr |
| `2168` | CMRE - Retail-Strip Center |
| `2172` | CMRE - Self Storage Facility |
| `2176` | CMRE - Shopping Center |
| `2180` | CMRE - Warehouse |
| `2184` | CMRE - Warehouse Bulk Storage |
| `2188` | CMRE - Winery |
| `2200` | RE14 - Investor 1-4 Fam Resid/Rent |
| `2204` | RE14 - Investor 1-4 Fam Residential |
| `2208` | RE14 - Leasehold Mortgage |
| `2212` | RE14 - Mobile Home |
| `2216` | RE14 - Mortgage |
| `2220` | RE14 - Mortgage Banking - Forclosures |
| `2224` | RE14 - Motor Home, RV's |
| `2228` | RE14 - Other 1-4 Fam |
| `2232` | RE14 - SFR 1-4 Fam Primary |
| `2236` | RE14 - SFR 1-4 Fam Primary Newly Built |
| `2240` | RE14 - SFR 1-4 Fam Secondary |
| `2244` | RE14 - SFR 1-4 Fam Secondary Newly Built |
| `2248` | RE14 - Townhouse 1-4 Fam |
| `2300` | RE5P - Apartments 5+ Fam |
| `2304` | RE5P - Apartments 5+ Fam Newly Built |
| `2308` | RE5P - Condominium 5+ Fam |
| `2312` | RE5P - Condominium 5+ Fam Newly Built |
| `2316` | RE5P - Inv-Multi Fam Resid/Rent |
| `2320` | RE5P - Inv-Multi Fam Residential |
| `2324` | RE5P - Low Rise Apt 5+Fam In Suburbs |
| `2328` | RE5P - Mobile Home Park |
| `2332` | RE5P - Ret-Nghbrhood Center<100M Sq Ft |
| `2336` | RE5P - Single Family Residences |
| `3000` | DEPO - Accts-Mixed-Cash & Other Coll This Bank |
| `3005` | DEPO - Cash & Equiv Held Other Bank |
| `3010` | DEPO - Cash-US Non Dep Credit Union/Brokerage |
| `3015` | DEPO - Cert of Deposit Other Bank |
| `3020` | DEPO - Cert of Deposit This Bank |
| `3025` | DEPO - Demand Deposit Account This Bank |
| `3030` | DEPO - Money Market Account Other Bank |
| `3035` | DEPO - Money Market Account This Bank |
| `3040` | DEPO - Savings Account Other Bank |
| `3045` | DEPO - Savings Account This Bank |
| `3050` | DEPO - Savings-Othr Fin'l Inst-Foreign Currcy |
| `3055` | DEPO - Time Deposit - Other Bank |
| `3060` | DEPO - Time Deposit - This Bank |
| `3065` | MARK - Bond Corporate, Investment Grade |
| `3070` | MARK - Debt Securities-Publicly Traded Sr Debt |
| `3075` | MARK - Government Securities |
| `3080` | MARK - Industrial Revenue Bonds |
| `3085` | MARK - Invest Portfolio At Othr Fin Inst-Mkt Sec |
| `3090` | MARK - Mixed Collat-Mkt Securities & Dep |
| `3095` | MARK - Multiple Markatable Securities |
| `3100` | MARK - Municipal Bonds |
| `3105` | MARK - Mutual Fund-Balanced Fund |
| `3110` | MARK - Mutual Fund-Money Market Fund |
| `3115` | MARK - Other Mkt Securities & Other Collateral |
| `3120` | MARK - Stock - Other Bank |
| `3125` | MARK - Stock - This Bank |
| `3130` | MARK - Stock, Major Exchange Listed |
| `3135` | MARK - Stock, Minor Exchange Listed |
| `3140` | NMRK - Bnkrs Acceptnce & Othr Negot Trade Instr |
| `3145` | NMRK - Bond Non Profit Organization |
| `3150` | NMRK - Bonds / Securities - Non USA |
| `3155` | NMRK - Bonds-Debt Sec-Muni Sec-Bds, Nts Issued |
| `3160` | NMRK - Debt Securities-Other Debt Instruments |
| `3165` | NMRK - Equty Intrst In Subsidiary Capital Stock |
| `3170` | NMRK - Hedge Funds |
| `3175` | NMRK - Other General Bonds |
| `3180` | NMRK - Other Investment Fortfolio |
| `3185` | NMRK - Privately Held Securities |
| `3190` | NMRK - Restricted Securities |
| `3195` | NMRK - Security Inerest In Capital Stock |
| `3200` | NMRK - Stock Options |
| `3205` | NMRK - Stock Special Handling |
| `3210` | NMRK - Stock Warrants |
| `3215` | NMRK - Stock, Non-Listed Stocks Incl Priv Held |
| `3220` | NMRK - Trust Account |
| `4000` | EQUP - Agricultural/Forestry |
| `4005` | EQUP - Aircraft |
| `4010` | EQUP - Aircraft - Piston |
| `4015` | EQUP - Aircraft - Turbine |
| `4020` | EQUP - Auto-Passenger Vehicles |
| `4025` | EQUP - Barges & Tanker Hulls |
| `4030` | EQUP - Commercial Vehicle (1 Ton Or Greater) |
| `4035` | EQUP - Communications, Oth Util Equip |
| `4040` | EQUP - Computers/Software |
| `4045` | EQUP - Construction Equipment |
| `4050` | EQUP - Container Vessels |
| `4055` | EQUP - Dry Bulk Carrier |
| `4060` | EQUP - Equipment & Furniture |
| `4065` | EQUP - Fire Truck |
| `4070` | EQUP - Furniture & Fixtures |
| `4075` | EQUP - Furniture Fixtures,Equipt & Mach |
| `4080` | EQUP - Furniture, Fixtures & Equip |
| `4085` | EQUP - Furniture, Fixtures & Leases |
| `4090` | EQUP - Furniture, Fixtures, Equipt & Leases |
| `4095` | EQUP - Heavy Mfg Equipmt & Fixtures |
| `4100` | EQUP - Leasehold Improve/Attached Fixtures |
| `4105` | EQUP - Light Mfg Equipmt & Fixtures |
| `4110` | EQUP - Machinery / Equipment - Non Farm |
| `4115` | EQUP - Machinery/Equipment - Farm |
| `4120` | EQUP - Manufacturing |
| `4125` | EQUP - Medical, Leased |
| `4130` | EQUP - Medical,Dental,Other Prof Equip |
| `4135` | EQUP - Mining, Oil, Natl Res Dev Equip |
| `4140` | EQUP - Motorcycles |
| `4145` | EQUP - Other Equipment |
| `4150` | EQUP - Other Vehicles |
| `4155` | EQUP - Other Vessel |
| `4160` | EQUP - Pleasure Boat - General |
| `4165` | EQUP - Preferred Ships Mortgage |
| `4170` | EQUP - Rail Car/Track/Etc |
| `4175` | EQUP - Recreational Vehicle |
| `4180` | EQUP - Service Industries Equipment |
| `4185` | EQUP - Small, Leased |
| `4190` | EQUP - Tools/Dyes/Molds |
| `4195` | EQUP - Tractor Trailers |
| `4200` | EQUP - Trailer |
| `4205` | EQUP - Transportation Equipment |
| `4210` | EQUP - Trucks |
| `5000` | LAND - (A&D Comml) Improvements |
| `5005` | LAND - (A&D Resid)Improvements |
| `5010` | LAND - Comml Development |
| `5015` | LAND - Developed Building Lots |
| `5020` | LAND - Golf Courses |
| `5025` | LAND - Non Resid-Unimproved/Vacant |
| `5030` | LAND - Other Lots |
| `5035` | LAND - Other Non-Residential |
| `5040` | LAND - Parkinglot |
| `5045` | LAND - Permitted Land |
| `5050` | LAND - Residential Development |
| `5055` | LAND - Residential Unimproved/Vacant |
| `5060` | LAND - Unpermitted Land |
| `5065` | LAND - Vineyard |
| `6001` | Real Estate - 1-4 Family |
| `9030` | OTHR - Antiques |
| `9060` | OTHR - Artwork |
| `9090` | OTHR - Cable TV System & Other Related Assets |
| `9120` | OTHR - Collectibles |
| `9150` | OTHR - Commercial Paper |
| `9180` | OTHR - Copyright Mortgage |
| `9210` | OTHR - Copyrights/Trademarks/Patents |
| `9240` | OTHR - Distribution Rights |
| `9270` | OTHR - General Intangibles |
| `9300` | OTHR - Intangible Assests - Film/Film Lib/TV/Etc |
| `9330` | OTHR - Intangibles-License, Right of Way |
| `9360` | OTHR - Intangibles-Taxi Medallion |
| `9390` | OTHR - Intellectual Property/Software |
| `9420` | OTHR - Jewelry |
| `9450` | OTHR - Letter of Credit - Foreign Bank |
| `9480` | OTHR - Letters of Credit |
| `9510` | OTHR - Negative Pledge w/ Real Estate |
| `9540` | OTHR - Oil/Gas/Mineral Reserves |
| `9600` | OTHR - Other Collateral Not Listed |
| `9610` | OTHR - Other Entertainment Collateral |
| `9620` | OTHR - Other Negative Pledge |
| `9630` | OTHR - Other Trust Agreement |
| `9640` | OTHR - Precious Metals |
| `9650` | OTHR - Private Insurance |
| `9660` | OTHR - Radio Brdcast Station(s) & Other Related Assets |
| `9670` | OTHR - Real Estate Investment Trust |
| `9680` | OTHR - Royalties |
| `9690` | OTHR - Trade Documents/Customer Lists |
| `9700` | OTHR - Trust Agreement This Bank |
| `9710` | OTHR - TV Broadcast Station(s) & Other Related Assets |

### `communityPoolNumber` — Subsidy Program  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `100` | Farm Service Agency |
| `200` | International Finance Corp |
| `9999` | Automation Testing |

### `contactOfficer1` — Officer 1  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `controllingInterest` — Controlling Interest  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `costCenter` — Assignment Unit  (16)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1001500` | *Commercial Lending- East |
| `1002500` | *Commercial Lending- Central |
| `1003500` | *Commercial Lending- West |
| `1007500` | *Commercial Bank - UK |
| `2001500` | *Commercial Real Estate- East |
| `2002500` | *Commercial Real Estate- Central |
| `2003500` | *Commercial Real Estate- West |
| `3001500` | *Corporate Banking- East |
| `3002500` | *Corporate Banking- Central |
| `3003500` | *Corporate Banking- West |
| `4001500` | *SBA Lending- East |
| `4002500` | *SBA Lending- Central |
| `4003500` | *SBA Lending- West |
| `5005500` | *Automation AU |
| `5005999` | *Offset Entries Only |

### `country` — Country of Origin  (265)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | UNITED STATES |
| `10` | AFGHANISTAN |
| `15` | AFRICAN ORGANIZATIONS |
| `20` | ALAND ISLANDS |
| `30` | ALBANIA |
| `40` | ALGERIA |
| `50` | AMERICAN SAMOA |
| `60` | ANDORRA |
| `70` | ANGOLA |
| `80` | ANGUILLA |
| `90` | ANTARCTICA |
| `100` | ANTIGUA AND BARBUDA |
| `110` | ARGENTINA |
| `120` | ARMENIA |
| `130` | ARUBA |
| `135` | ASIAN ORGANIZATIONS |
| `140` | AUSTRALIA |
| `150` | AUSTRIA |
| `160` | AZERBAIJAN |
| `180` | BAHAMAS |
| `190` | BAHRAIN |
| `200` | BANGLADESH |
| `210` | BARBADOS |
| `220` | BELARUS |
| `230` | BELGIUM |
| `240` | BELIZE |
| `250` | BENIN |
| `260` | BERMUDA |
| `270` | BHUTAN |
| `280` | BOLIVIA, PLURINATIONAL STATE OF |
| `290` | BONAIRE, SAINT EUSTATIUS AND SABA |
| `300` | BOSNIA AND HERZEGOVINA |
| `310` | BOTSWANA |
| `320` | BOUVET ISLAND |
| `330` | BRAZIL |
| `340` | BRITISH INDIAN OCEAN TERRITORY |
| `350` | BRUNEI DARUSSALAM |
| `360` | BULGARIA |
| `370` | BURKINA FASO |
| `380` | BURUNDI |
| `400` | CAMBODIA |
| `410` | CAMEROON |
| `420` | CANADA |
| `430` | CAPE VERDE |
| `434` | CARIBBEAN ORGANIZATIONS |
| `435` | EASTERN CARIBBEAN CENTRAL BANK |
| `440` | CAYMAN ISLANDS |
| `450` | CENTRAL AFRICAN REPUBLIC |
| `455` | BANK OF CENTRAL AFRICAN STATES (BEAC) |
| `460` | CHAD |
| `470` | CHILE |
| `480` | CHINA |
| `490` | CHRISTMAS ISLAND |
| `500` | COCOS (KEELING) ISLANDS |
| `510` | COLOMBIA |
| `520` | COMOROS |
| `530` | CONGO |
| `540` | CONGO, THE DEMOCRATIC REPUBLIC OF THE |
| `550` | COOK ISLANDS |
| `560` | COSTA RICA |
| `570` | COTE D'IVOIRE |
| `580` | CROATIA |
| `590` | CUBA |
| `600` | CURACAO |
| `610` | CYPRUS |
| `620` | CZECH REPUBLIC |
| `640` | DENMARK |
| `650` | DJIBOUTI |
| `660` | DOMINICA |
| `670` | DOMINICAN REPUBLIC |
| `690` | ECUADOR |
| `700` | EGYPT |
| `710` | EL SALVADOR |
| `720` | EQUATORIAL GUINEA |
| `730` | ERITREA |
| `740` | ESTONIA |
| `750` | ETHIOPIA |
| `755` | EUROPEAN CENTRAL BANK |
| `760` | EUROPEAN ORGANIZATIONS |
| `770` | FALKLAND ISLANDS (MALVINAS) |
| `780` | FAROE ISLANDS |
| `790` | FIJI |
| `800` | FINLAND |
| `810` | FRANCE |
| `820` | FRENCH GUIANA |
| `830` | FRENCH POLYNESIA |
| `840` | FRENCH SOUTHERN TERRITORIES |
| `860` | GABON |
| `870` | GAMBIA |
| `880` | GEORGIA |
| `890` | GERMANY |
| `900` | GHANA |
| `910` | GIBRALTAR |
| `920` | GREECE |
| `930` | GREENLAND |
| `940` | GRENADA |
| `950` | GUADELOUPE |
| `960` | GUAM |
| `970` | GUATEMALA |
| `980` | GUERNSEY |
| `990` | GUINEA |
| `1000` | GUINEA-BISSAU |
| `1010` | GUYANA |
| `1030` | HAITI |
| `1040` | HEARD ISLAND AND MCDONALD ISLANDS |
| `1050` | HOLY SEE (VATICAN CITY STATE) |
| `1060` | HONDURAS |
| `1070` | HONG KONG |
| `1080` | HUNGARY |
| `1100` | ICELAND |
| `1105` | INTERNATIONAL ORGANIZATIONS |
| `1110` | INDIA |
| `1120` | INDONESIA |
| `1125` | BANK OF INTERNATIONAL SETTLEMENTS |
| `1130` | IRAN, ISLAMIC REPUBLIC OF |
| `1140` | IRAQ |
| `1150` | IRELAND |
| `1160` | ISLE OF MAN |
| `1170` | ISRAEL |
| `1180` | ITALY |
| `1200` | JAMAICA |
| `1210` | JAPAN |
| `1220` | JERSEY |
| `1230` | JORDAN |
| `1250` | KAZAKHSTAN |
| `1260` | KENYA |
| `1270` | KIRIBATI |
| `1280` | KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF |
| `1290` | KOREA, REPUBLIC OF |
| `1295` | KOSOVO |
| `1300` | KUWAIT |
| `1310` | KYRGYZSTAN |
| `1330` | LAO PEOPLE'S DEMOCRATIC REPUBLIC |
| `1335` | LATIN AMERICAN ORGANIZATIONS |
| `1340` | LATVIA |
| `1350` | LEBANON |
| `1360` | LESOTHO |
| `1370` | LIBERIA |
| `1380` | LIBYAN ARAB JAMAHIRIYA |
| `1390` | LIECHTENSTEIN |
| `1400` | LITHUANIA |
| `1410` | LUXEMBOURG |
| `1430` | MACAO |
| `1440` | MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF |
| `1450` | MADAGASCAR |
| `1460` | MALAWI |
| `1470` | MALAYSIA |
| `1480` | MALDIVES |
| `1490` | MALI |
| `1500` | MALTA |
| `1510` | MARSHALL ISLANDS |
| `1520` | MARTINIQUE |
| `1530` | MAURITANIA |
| `1540` | MAURITIUS |
| `1550` | MAYOTTE |
| `1560` | MEXICO |
| `1570` | MICRONESIA, FEDERATED STATES OF |
| `1575` | MIDDLE EASTERN ORGANIZATIONS |
| `1580` | MOLDOVA, REPUBLIC OF |
| `1590` | MONACO |
| `1600` | MONGOLIA |
| `1610` | MONTENEGRO |
| `1620` | MONTSERRAT |
| `1630` | MOROCCO |
| `1640` | MOZAMBIQUE |
| `1650` | MYANMAR |
| `1670` | NAMIBIA |
| `1680` | NAURU |
| `1690` | NEPAL |
| `1700` | NETHERLANDS |
| `1710` | NEW CALEDONIA |
| `1720` | NEW ZEALAND |
| `1730` | NICARAGUA |
| `1740` | NIGER |
| `1750` | NIGERIA |
| `1760` | NIUE |
| `1770` | NORFOLK ISLAND |
| `1780` | NORTHERN MARIANA ISLANDS |
| `1790` | NORWAY |
| `1810` | OMAN |
| `1830` | PAKISTAN |
| `1840` | PALAU |
| `1850` | PALESTINIAN TERRITORY, OCCUPIED |
| `1860` | PANAMA |
| `1870` | PAPUA NEW GUINEA |
| `1880` | PARAGUAY |
| `1890` | PERU |
| `1900` | PHILIPPINES |
| `1910` | PITCAIRN |
| `1920` | POLAND |
| `1930` | PORTUGAL |
| `1940` | PUERTO RICO |
| `1960` | QATAR |
| `1980` | REUNION |
| `1990` | ROMANIA |
| `2000` | RUSSIAN FEDERATION |
| `2010` | RWANDA |
| `2030` | SAINT BARTHELEMY |
| `2040` | SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA |
| `2050` | SAINT KITTS AND NEVIS |
| `2060` | SAINT LUCIA |
| `2070` | SAINT MARTIN (FRENCH PART) |
| `2080` | SAINT PIERRE AND MIQUELON |
| `2090` | SAINT VINCENT AND THE GRENADINES |
| `2100` | SAMOA |
| `2110` | SAN MARINO |
| `2120` | SAO TOME AND PRINCIPE |
| `2130` | SAUDI ARABIA |
| `2140` | SENEGAL |
| `2150` | SERBIA |
| `2160` | SEYCHELLES |
| `2170` | SIERRA LEONE |
| `2180` | SINGAPORE |
| `2190` | SINT MAARTEN (DUTCH PART) |
| `2200` | SLOVAKIA |
| `2210` | SLOVENIA |
| `2220` | SOLOMON ISLANDS |
| `2230` | SOMALIA |
| `2240` | SOUTH AFRICA |
| `2250` | SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS |
| `2260` | SPAIN |
| `2270` | SRI LANKA |
| `2280` | SUDAN |
| `2285` | SOUTH SUDAN |
| `2290` | SURINAME |
| `2300` | SVALBARD AND JAN MAYEN |
| `2310` | SWAZILAND |
| `2320` | SWEDEN |
| `2330` | SWITZERLAND |
| `2340` | SYRIAN ARAB REPUBLIC |
| `2360` | TAIWAN, PROVINCE OF CHINA |
| `2370` | TAJIKISTAN |
| `2380` | TANZANIA, UNITED REPUBLIC OF |
| `2390` | THAILAND |
| `2400` | TIMOR-LESTE |
| `2410` | TOGO |
| `2420` | TOKELAU |
| `2430` | TONGA |
| `2440` | TRINIDAD AND TOBAGO |
| `2450` | TUNISIA |
| `2460` | TURKEY |
| `2470` | TURKMENISTAN |
| `2480` | TURKS AND CAICOS ISLANDS |
| `2490` | TUVALU |
| `2510` | UGANDA |
| `2520` | UKRAINE |
| `2530` | UNITED ARAB EMIRATES |
| `2540` | UNITED KINGDOM |
| `2560` | UNITED STATES MINOR OUTLYING ISLANDS |
| `2570` | URUGUAY |
| `2580` | UZBEKISTAN |
| `2600` | VANUATU |
| `2620` | VENEZUELA, BOLIVARIAN REPUBLIC OF |
| `2630` | VIETNAM |
| `2640` | VIRGIN ISLANDS, BRITISH |
| `2650` | VIRGIN ISLANDS, U.S. |
| `2670` | WALLIS AND FUTUNA |
| `2675` | CENTRAL BANK OF WEST AFRICAN STATES (BCEAO) |
| `2680` | WESTERN SAHARA |
| `2685` | WEST BANK AND GAZA |
| `2700` | YEMEN |
| `2720` | ZAMBIA |
| `2730` | ZIMBABWE |
| `2740` | NETHERLANDS ANTILIES |

### `countryCode` — Country Code  (264)

| code | label |
|------|-------|
| `AA` | African Organizations |
| `AB` | Asian Organizations |
| `AD` | Andorra |
| `AE` | United Arab Emirates |
| `AF` | Afghanistan |
| `AG` | Antigua and Barbuda |
| `AI` | Anguilla |
| `AL` | Albania |
| `AM` | Armenia |
| `AN` | Netherlands Antilles |
| `AO` | Angola |
| `AQ` | Antarctica |
| `AR` | Argentina |
| `AS` | American Samoa |
| `AT` | Austria |
| `AU` | Australia |
| `AW` | Aruba |
| `AX` | Åland Islands |
| `AZ` | Azerbaijan |
| `BA` | Bosnia and Herzegovina |
| `BB` | Barbados |
| `BC` | Bank of International Settlements |
| `BD` | Bangladesh |
| `BE` | Belgium |
| `BF` | Burkina Faso |
| `BG` | Bulgaria |
| `BH` | Bahrain |
| `BI` | Burundi |
| `BJ` | Benin |
| `BK` | Bank of Central African States (BEAC) |
| `BL` | Saint Barthélemy |
| `BM` | Bermuda |
| `BN` | Brunei Darussalam |
| `BO` | Bolivia |
| `BQ` | Bonaire, Saint Eustatius and Saba |
| `BR` | Brazil |
| `BS` | Bahamas |
| `BT` | Bhutan |
| `BV` | Bouvet Island |
| `BW` | Botswana |
| `BY` | Belarus |
| `BZ` | Belize |
| `CA` | Canada |
| `CB` | Eastern Caribbean Central Bank |
| `CC` | Cocos (Keeling) Islands |
| `CD` | Congo, The Democratic Republic of the |
| `CF` | Central African Republic |
| `CG` | Congo |
| `CH` | Switzerland |
| `CI` | Côte d'Ivoire |
| `CJ` | Caribbean Organizations |
| `CK` | Cook Islands |
| `CL` | Chile |
| `CM` | Cameroon |
| `CN` | China |
| `CO` | Colombia |
| `CR` | Costa Rica |
| `CU` | Cuba |
| `CV` | Cape Verde |
| `CW` | Curacao |
| `CX` | Christmas Island |
| `CY` | Cyprus |
| `CZ` | Czech Republic |
| `DE` | Germany |
| `DJ` | Djibouti |
| `DK` | Denmark |
| `DM` | Dominica |
| `DO` | Dominican Republic |
| `DZ` | Algeria |
| `EB` | European Central Bank |
| `EC` | Ecuador |
| `EE` | Estonia |
| `EG` | Egypt |
| `EH` | Western Saraha |
| `EO` | European Organizations |
| `ER` | Eritrea |
| `ES` | Spain |
| `ET` | Ethiopia |
| `FI` | Finland |
| `FJ` | Fiji |
| `FK` | Falkland Islands (Malvinas) |
| `FM` | Micronesia, Federated States of |
| `FO` | Faroe Islands |
| `FR` | France |
| `GA` | Gabon |
| `GB` | United Kingdom |
| `GD` | Grenada |
| `GE` | Georgia |
| `GF` | French Guiana |
| `GG` | Guernsey |
| `GH` | Ghana |
| `GI` | Gibraltar |
| `GL` | Greenland |
| `GM` | Gambia |
| `GN` | Guinea |
| `GP` | Guadeloupe |
| `GQ` | Equatorial Guinea |
| `GR` | Greece |
| `GS` | South Georgia and the South Sandwich Islands |
| `GT` | Guatemala |
| `GU` | Guam |
| `GW` | Guinea-Bissau |
| `GY` | Guyana |
| `HK` | Hong Kong |
| `HM` | Heard Island and McDonald Islands |
| `HN` | Honduras |
| `HR` | Croatia |
| `HT` | Haiti |
| `HU` | Hungary |
| `IA` | International Organizations |
| `ID` | Indonesia |
| `IE` | Ireland |
| `IL` | Israel |
| `IM` | Isle of Man |
| `IN` | India |
| `IO` | British Indian Ocean Territory |
| `IQ` | Iraq |
| `IR` | Iran, Islamic Republic of |
| `IS` | Iceland |
| `IT` | Italy |
| `JE` | Jersey |
| `JM` | Jamaica |
| `JO` | Jordan |
| `JP` | Japan |
| `KE` | Kenya |
| `KG` | Kyrgyzstan |
| `KH` | Cambodia |
| `KI` | Kiribati |
| `KM` | Comoros |
| `KN` | Saint Kitts and Nevis |
| `KP` | Korea, Democratic People's Republic of |
| `KR` | Korea, Republic of |
| `KS` | Kosovo |
| `KW` | Kuwait |
| `KY` | Cayman Islands |
| `KZ` | Kazakhstan |
| `LA` | Lao People's Democratic Republic |
| `LB` | Lebanon |
| `LC` | Saint Lucia |
| `LI` | Liechtenstein |
| `LK` | Sri Lanka |
| `LO` | Latin American Organizations |
| `LR` | Liberia |
| `LS` | Lesotho |
| `LT` | Lithuania |
| `LU` | Luxembourg |
| `LV` | Lativa |
| `LY` | Libyan Arab Jamahiriya |
| `MA` | Morocco |
| `MB` | Middle Eastern Organizations |
| `MC` | Monaco |
| `MD` | Moldova |
| `ME` | Montenegro |
| `MF` | Saint Martin |
| `MG` | Madagascar |
| `MH` | Marshall Islands |
| `MK` | Macedonia, The Former Yugoslav Republic of |
| `ML` | Mali |
| `MM` | Myanmar |
| `MN` | Mongolia |
| `MO` | Macao |
| `MP` | Northern Mariana Islands |
| `MQ` | Martinique |
| `MR` | Mauritania |
| `MS` | Montserrat |
| `MT` | Malta |
| `MU` | Mauritius |
| `MV` | Maldives |
| `MW` | Malawi |
| `MX` | Mexico |
| `MY` | Malaysia |
| `MZ` | Mozambique |
| `NA` | Namibia |
| `NC` | New Caledonia |
| `NE` | Niger |
| `NF` | Norfolk Island |
| `NG` | Nigeria |
| `NI` | Nicaragua |
| `NL` | Netherlands |
| `NO` | Norway |
| `NP` | Nepal |
| `NR` | Nauru |
| `NU` | Niue |
| `NZ` | New Zealand |
| `OM` | Oman |
| `PA` | Panama |
| `PE` | Peru |
| `PF` | French Polynesia |
| `PG` | Papua New Guinea |
| `PH` | Philippines |
| `PK` | Pakistan |
| `PL` | Poland |
| `PM` | Saint Pierre and Miquelon |
| `PN` | Pitcairn |
| `PR` | Puerto Rico |
| `PS` | Palestinian Territory, Occupied |
| `PT` | Portugal |
| `PW` | Palau |
| `PY` | Paraguay |
| `QA` | Qatar |
| `RE` | Réunion |
| `RO` | Romania |
| `RS` | Serbia |
| `RU` | Russian Federation |
| `RW` | Rwanda |
| `SA` | Saudi Arabia |
| `SB` | Solomon Islands |
| `SC` | Seychelles |
| `SD` | Sudan |
| `SE` | Sweden |
| `SG` | Singapore |
| `SH` | Saint Helena |
| `SI` | Slovenia |
| `SJ` | Svalbard and Jan Mayen |
| `SK` | Slovakia |
| `SL` | Sierra Leone |
| `SM` | San Marino |
| `SN` | Senegal |
| `SO` | Somalia |
| `SR` | Suriname |
| `SS` | South Sudan |
| `ST` | Sao Tome and Principe |
| `SV` | El Salvador |
| `SX` | Sint Maarten (Dutch Part) |
| `SY` | Syrian Arab Republic |
| `SZ` | Swaziland |
| `TC` | Turks and Caicos Islands |
| `TD` | Chad |
| `TF` | French Southern Territories |
| `TG` | Togo |
| `TH` | Thailand |
| `TJ` | Tajikistan |
| `TK` | Tokelau |
| `TL` | Timor-Leste |
| `TM` | Turkmenistan |
| `TN` | Tunisia |
| `TO` | Tonga |
| `TR` | Turkey |
| `TT` | Trinidad and Tobago |
| `TV` | Tuvalu |
| `TW` | Taiwan, Province of China |
| `TZ` | Tanzania, United Republic of |
| `UA` | Ukraine |
| `UG` | Uganda |
| `UM` | United States Minor Outlying Islands |
| `US` | United States |
| `UY` | Uruguay |
| `UZ` | Uzbekistan |
| `VA` | Holy See (Vatican City State) |
| `VC` | Saint Vincent and the Grenadines |
| `VE` | Venezuela, Bolivarian Republic of |
| `VG` | Virgin Islands, British |
| `VI` | Virgin Islands, U.S. |
| `VN` | Vietnam |
| `VU` | Vanuatu |
| `WA` | Central Bank of West African States (BCEAO) |
| `WF` | Wallis And Futuna |
| `WG` | West Bank and Gaza |
| `WS` | Samoa |
| `YE` | Yemen |
| `YT` | Mayotte |
| `ZA` | South Africa |
| `ZM` | Zambia |
| `ZW` | Zimbabwe |

### `crBurCode` — Credit Bureau  (10)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Individual |
| `2` | Joint contractual |
| `3` | Authorized User |
| `5` | Co-maker |
| `7` | Association with account terminated |
| `8` | Maker |
| `9` | Business/Commercial |
| `11` | Consumer Deceased - |
| `13` | Delete Borrower |

### `craInd` — CRA Indicator  (5)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Small Business |
| `2` | Small Farm |
| `3` | Rural Economic Development |
| `4` | Community Economic Development |

### `creditBureauReportInd` — Credit Report Indicator  (5)

| code | label |
|------|-------|
| `0` | Override No Report |
| `1` | To Be Reported |
| `4` | Reported |
| `8` | Report once more |
| `9` | No longer report |

### `currencyCategory` — Currency Category  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Currency Tier 1 |

### `currentOccupancyInd` — Current Occupancy Indicator  (3)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Applicable |
| `2` | Not applicable |

### `curtypeInt` — Currency Type  (46)

| code | label |
|------|-------|
| `AED` | United Arab Emirates, Dirhams |
| `ALL` | Lek |
| `ARS` | Argentina Peso |
| `AUD` | Australian Dollar |
| `BHD` | Bahraini Dinar |
| `BRL` | Brazilian Real |
| `CAD` | Canadian Dollar |
| `CHF` | Switzerland, Francs |
| `CNY` | Yuan Renminbi |
| `CZK` | Czech Koruna |
| `DEM` | Deutsch Marcs (for testing 1 decimal place) |
| `DKK` | Denmark, Kroner |
| `DOP` | Dominican Republic, Pesos |
| `DZD` | Algerian Dinar |
| `EUR` | Euro |
| `FRF` | French Franc (for testing of 3 decimal place |
| `GBP` | Pound Sterling |
| `HKD` | Hong Kong Dollar |
| `HUF` | Hungary, Forint |
| `IDR` | Indonesia, Rupiahs |
| `ILS` | Israel, New Shekels |
| `INR` | India, Rupees |
| `JPY` | Japan, Yen |
| `KRW` | Korea (South), Won |
| `KWD` | Kuwaiti Dinar |
| `LTL` | Lithuanian Litas |
| `MAD` | Moroccan Dirham |
| `MOP` | Pataca |
| `MXN` | Mexico, Pesos |
| `MYR` | Malaysian Ringgit |
| `NOK` | Norway, Krone |
| `NZD` | New Zealand, Dollars |
| `OMR` | Rial Omani |
| `PHP` | Philippines, Pesos |
| `PKR` | Pakistan, Rupees |
| `PLN` | Zloty |
| `QAR` | Qatari Rial |
| `RON` | New Leu |
| `RUB` | Russian Ruble |
| `SAR` | Saudi Arabia, Riyals |
| `SEK` | Swedish Krona |
| `SGD` | Singapore Dollar |
| `THB` | Thailand, Baht |
| `TRY` | New Turkish Lira |
| `USD` | United States Dollars |
| `ZAR` | South Africa Rand |

### `curtypeYr1` — Currency Type  (46)

| code | label |
|------|-------|
| `AED` | United Arab Emirates, Dirhams |
| `ALL` | Lek |
| `ARS` | Argentina Peso |
| `AUD` | Australian Dollar |
| `BHD` | Bahraini Dinar |
| `BRL` | Brazilian Real |
| `CAD` | Canadian Dollar |
| `CHF` | Switzerland, Francs |
| `CNY` | Yuan Renminbi |
| `CZK` | Czech Koruna |
| `DEM` | Deutsch Marcs (for testing 1 decimal place) |
| `DKK` | Denmark, Kroner |
| `DOP` | Dominican Republic, Pesos |
| `DZD` | Algerian Dinar |
| `EUR` | Euro |
| `FRF` | French Franc (for testing of 3 decimal place |
| `GBP` | Pound Sterling |
| `HKD` | Hong Kong Dollar |
| `HUF` | Hungary, Forint |
| `IDR` | Indonesia, Rupiahs |
| `ILS` | Israel, New Shekels |
| `INR` | India, Rupees |
| `JPY` | Japan, Yen |
| `KRW` | Korea (South), Won |
| `KWD` | Kuwaiti Dinar |
| `LTL` | Lithuanian Litas |
| `MAD` | Moroccan Dirham |
| `MOP` | Pataca |
| `MXN` | Mexico, Pesos |
| `MYR` | Malaysian Ringgit |
| `NOK` | Norway, Krone |
| `NZD` | New Zealand, Dollars |
| `OMR` | Rial Omani |
| `PHP` | Philippines, Pesos |
| `PKR` | Pakistan, Rupees |
| `PLN` | Zloty |
| `QAR` | Qatari Rial |
| `RON` | New Leu |
| `RUB` | Russian Ruble |
| `SAR` | Saudi Arabia, Riyals |
| `SEK` | Swedish Krona |
| `SGD` | Singapore Dollar |
| `THB` | Thailand, Baht |
| `TRY` | New Turkish Lira |
| `USD` | United States Dollars |
| `ZAR` | South Africa Rand |

### `curtypeYr2` — Currency Type  (46)

| code | label |
|------|-------|
| `AED` | United Arab Emirates, Dirhams |
| `ALL` | Lek |
| `ARS` | Argentina Peso |
| `AUD` | Australian Dollar |
| `BHD` | Bahraini Dinar |
| `BRL` | Brazilian Real |
| `CAD` | Canadian Dollar |
| `CHF` | Switzerland, Francs |
| `CNY` | Yuan Renminbi |
| `CZK` | Czech Koruna |
| `DEM` | Deutsch Marcs (for testing 1 decimal place) |
| `DKK` | Denmark, Kroner |
| `DOP` | Dominican Republic, Pesos |
| `DZD` | Algerian Dinar |
| `EUR` | Euro |
| `FRF` | French Franc (for testing of 3 decimal place |
| `GBP` | Pound Sterling |
| `HKD` | Hong Kong Dollar |
| `HUF` | Hungary, Forint |
| `IDR` | Indonesia, Rupiahs |
| `ILS` | Israel, New Shekels |
| `INR` | India, Rupees |
| `JPY` | Japan, Yen |
| `KRW` | Korea (South), Won |
| `KWD` | Kuwaiti Dinar |
| `LTL` | Lithuanian Litas |
| `MAD` | Moroccan Dirham |
| `MOP` | Pataca |
| `MXN` | Mexico, Pesos |
| `MYR` | Malaysian Ringgit |
| `NOK` | Norway, Krone |
| `NZD` | New Zealand, Dollars |
| `OMR` | Rial Omani |
| `PHP` | Philippines, Pesos |
| `PKR` | Pakistan, Rupees |
| `PLN` | Zloty |
| `QAR` | Qatari Rial |
| `RON` | New Leu |
| `RUB` | Russian Ruble |
| `SAR` | Saudi Arabia, Riyals |
| `SEK` | Swedish Krona |
| `SGD` | Singapore Dollar |
| `THB` | Thailand, Baht |
| `TRY` | New Turkish Lira |
| `USD` | United States Dollars |
| `ZAR` | South Africa Rand |

### `curtypeYr3` — Currency Type  (46)

| code | label |
|------|-------|
| `AED` | United Arab Emirates, Dirhams |
| `ALL` | Lek |
| `ARS` | Argentina Peso |
| `AUD` | Australian Dollar |
| `BHD` | Bahraini Dinar |
| `BRL` | Brazilian Real |
| `CAD` | Canadian Dollar |
| `CHF` | Switzerland, Francs |
| `CNY` | Yuan Renminbi |
| `CZK` | Czech Koruna |
| `DEM` | Deutsch Marcs (for testing 1 decimal place) |
| `DKK` | Denmark, Kroner |
| `DOP` | Dominican Republic, Pesos |
| `DZD` | Algerian Dinar |
| `EUR` | Euro |
| `FRF` | French Franc (for testing of 3 decimal place |
| `GBP` | Pound Sterling |
| `HKD` | Hong Kong Dollar |
| `HUF` | Hungary, Forint |
| `IDR` | Indonesia, Rupiahs |
| `ILS` | Israel, New Shekels |
| `INR` | India, Rupees |
| `JPY` | Japan, Yen |
| `KRW` | Korea (South), Won |
| `KWD` | Kuwaiti Dinar |
| `LTL` | Lithuanian Litas |
| `MAD` | Moroccan Dirham |
| `MOP` | Pataca |
| `MXN` | Mexico, Pesos |
| `MYR` | Malaysian Ringgit |
| `NOK` | Norway, Krone |
| `NZD` | New Zealand, Dollars |
| `OMR` | Rial Omani |
| `PHP` | Philippines, Pesos |
| `PKR` | Pakistan, Rupees |
| `PLN` | Zloty |
| `QAR` | Qatari Rial |
| `RON` | New Leu |
| `RUB` | Russian Ruble |
| `SAR` | Saudi Arabia, Riyals |
| `SEK` | Swedish Krona |
| `SGD` | Singapore Dollar |
| `THB` | Thailand, Baht |
| `TRY` | New Turkish Lira |
| `USD` | United States Dollars |
| `ZAR` | South Africa Rand |

### `deliveryInd` — Delivery Indicator  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `A` | Processing Department |
| `B` | Inquiry Unit |

### `derivitiveInd` — Derivative Indicator  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Not Applicable |
| `2` | Swap |

### `docStampTaxCd` — Doc Stamp Tax Code  (1)

| code | label |
|------|-------|
| `0` | Not Entered |

### `durationCode` — Duration Code  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Time |
| `3` | Term |
| `6` | Prevent Maturity Invoice |

### `earningType` — Tier/Earnings Type  (9)

| code | label |
|------|-------|
| `0` | Default (Accrue on whole balance or lump sum for Flat Fees) |
| `1` | Accrue on whole balance |
| `2` | Accrue at multiple rates, a rate for the dollar amount in a specific range |
| `3` | Accrue by one rate, dependent on dollar range |
| `4` | Accrue by multiple rates, a rate for each percentage of principal |
| `5` | Straight Line Over Assessment Period |
| `6` | Interest Method Accounting (IMA) |
| `7` | Earned When Paid |
| `8` | FASB Straight-line |

### `essentialGovernmentUse` — Essential Government Use  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `expirationDateLimit` — Expiration Date Limit  (10)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | End of month (EOM) |
| `2` | Business day EOM Else next business day |
| `3` | Stay on Day |
| `4` | Business day Else next business day |
| `5` | Business day else next business day;same month |
| `6` | Business Day EOM Else previous business day |
| `7` | Business day Else previous business day |
| `8` | Business Day Else Next Business Day - Stay On New Day |
| `9` | Business Day Else Previous Business Day, - Stay on New Day |

### `fallbackLang` — Fallback Language  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `fedClass` — Fed Class  (117)

| code | label |
|------|-------|
| `0` | Not entered |
| `100` | Invalid Fed Class |
| `101` | Intended Principal 1-4 Family |
| `102` | Principal for Multi-Family |
| `103` | Purpose Unknown Non-Resident |
| `104` | Non-Farmland Loan |
| `105` | Other Construction Loans, All Land Development and Other Land Loans Originate |
| `106` | Loans Secured By Multifamily (5 Or More) Res Properties Originated In Domestic |
| `108` | Loans Secured By Other Nonfarm Nonresidential Properties Originated In Domestic |
| `109` | Loans Secured By CRE Originated By Non-Domestic Office- exclude Non-farm Non-Res |
| `110` | Secured by Farmland-Include Home |
| `121` | Insured by FHA |
| `122` | Guaranteed by VA |
| `123` | Conventionally Financed |
| `124` | 1-4 Family Closed End Mortgage-Jr. Lien |
| `125` | 1-4 Family, Insured by FHA, Previously Occupied |
| `126` | 1-4 Family, Guaranteed by VA, Previously Occupied |
| `127` | 1-4 Family, Conventional Financing, Previously Occupied |
| `128` | Home Equity |
| `129` | 1-4 Family Home Equity Loan, Partially Secured |
| `131` | Multi-Family, Insured by FHA |
| `132` | Multi-Family, Conventional Loan |
| `133` | Multi-Family, Insured by FHA, Existing Structure |
| `134` | Multi-Family Conventional Financing, Existing Structure |
| `150` | Secured by Non-Farm, Non-Residential / Non Owner-Occupied |
| `151` | Secured by Non-Farm, Non-Residential / Owner-Occupied |
| `152` | Reverse Mortgages (Home Equity Conversion) |
| `153` | Reverse Mortgages (Proprietary) |
| `201` | Real Estate Investment Trusts |
| `202` | To Mortgage Companies |
| `205` | To U.S. Branches & Agents of Foreign Banks |
| `209` | Comm'l Bank - Fed Funds Sold, Etc. |
| `210` | Comm'l Bank - Not Fed Funds Sold |
| `215` | To Foreign Branches of Other U.S. Banks |
| `220` | Foreign Banks |
| `250` | To Other Financial Institutions |
| `251` | Non-Depository Financial Institutions |
| `260` | To Other Depository Institutions |
| `310` | Secured by U.S. Treasury Securities |
| `320` | Secured by Other Securities |
| `350` | For U.S. Treasury Securities |
| `361` | Stocks - Except with Subscript Rights |
| `362` | Convertible Bonds |
| `363` | Stocks Acq with Subscript Rights |
| `364` | Restricted Collateral in Part |
| `366` | Bank Stock Entirely or in Part |
| `367` | Other Restricted Collateral Entire |
| `368` | Other Restricted Collateral in Part |
| `369` | Loans to Purchase or Carry Securities |
| `370` | To Sell Investment Securities |
| `380` | To Purchase Mortgage Pool Securities |
| `381` | To Sell Mortgage Pool Securities |
| `382` | To Purchase FREDDIE MAC Participation Certificates |
| `383` | To Sell FREDDIE MAC Participation Certificates |
| `384` | To Purchase GNMA/FNMA Pools |
| `385` | To Sell GNMA/FNMA Pools |
| `390` | To Purchase Loans |
| `391` | To Sell Loans |
| `410` | Commodity Credit Corp Loans |
| `420` | Other Farm Loans |
| `511` | Primary Metals |
| `512` | Machinery |
| `513` | Transportation Equipment |
| `514` | Other Fabricated Metal Products |
| `515` | Other Durable Goods |
| `520` | Business Credit Cards |
| `521` | Food, Liquor, and Kindred Products |
| `522` | Tobacco Manufacturers |
| `523` | Textiles |
| `524` | Apparel and Leather |
| `525` | Petroleum |
| `526` | Chemicals and Rubber |
| `527` | Other Non-Durable Goods |
| `531` | Crude Petroleum and Natural Gas |
| `532` | All Other Mining |
| `541` | Commodity Dealers Trade |
| `542` | Other Wholesale-Trade |
| `543` | Retail Trade |
| `544` | Loans To Commercial Paper Conduits |
| `545` | Dealer Loans |
| `546` | Dealer Loans PRA Contra |
| `551` | Transportation |
| `552` | Communication |
| `553` | Public Utilities-Not Communication |
| `560` | Construction |
| `561` | Commercial Real Estate, Not Secured by Real Estate |
| `562` | Land Development, Not Secured by Real Estate |
| `570` | Services |
| `580` | Bankers Acceptances Dom/For |
| `585` | Acceptances of Foreign Banks-Domestic Office |
| `586` | Acceptances of Foreign Banks-Foreign Office |
| `590` | Foreign Commercial & Industrial Loans |
| `599` | Commercial & Industrial Loans-Other |
| `610` | Consumer Purchase Private Auto |
| `620` | Consumer Retail Credit Card |
| `630` | Check Credit/ Revolving Credit Plans |
| `640` | Retail Consumer Goods |
| `641` | Mobile Homes, No Travel Trailers |
| `642` | Travel Trailers |
| `650` | Repair/ Modernize Resident Property |
| `660` | Loans Household - Family - Person |
| `661` | Consumer Loans on Deposits |
| `670` | Single Payment Personal Loans |
| `690` | Education Loans |
| `710` | Loans to Foreign Govt/Banks/Institutions |
| `720` | All Other Loans Including Overdrafts |
| `800` | To States & Political Divisions |
| `801` | Non-Rated Industrial Development Obligations |
| `899` | Letters of Credit-Vision (Not on GTS) |
| `900` | Lease Financing Receivable |
| `901` | Non-Financing Leases |
| `902` | Financing Leases to States/Municipalities |
| `903` | Non-Financing Leases to State/Municipalities |
| `904` | Consumer Leases- Financed |
| `905` | Consumer Leases- Not Financed |
| `998` | GTS Trade Products |
| `999` | REO |

### `feeTitleCode` — Fee Title  (28)

| code | label |
|------|-------|
| `401` | Unused Facility Fee |
| `402` | Letter of Credit Commitment Fee |
| `403` | Other Accrual  Fee |
| `501` | Deposit for Searches |
| `502` | Prepayment Fee |
| `503` | Letter of Credit Issuance Fee |
| `504` | Annual Review Fee |
| `505` | Renewal Fee |
| `506` | Commitment Fee |
| `507` | Guarantee Fee |
| `508` | Origination Fee |
| `509` | Initial Application Fee |
| `510` | Overdraft Fee |
| `511` | Wire Fee |
| `512` | Review / Monitoring Fee |
| `513` | Rate Lock Fee |
| `514` | CB Finders Fee |
| `515` | Recovery of Appraisal Costs |
| `516` | Recovery of Title Costs |
| `517` | Recovery of Legal Costs |
| `518` | Other Fee |
| `519` | Participation Fee |
| `520` | Syndication Fee |
| `521` | Undercharge of Searches |
| `522` | Late Charge |
| `590` | FASB Cost |
| `593` | Fixed Cost |
| `700` | Cost of Funds |

### `formula` — Freeze Formula  (5)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | No Transactions |
| `2` | Advances/ Increases rejected |
| `3` | Indicative Only |
| `4` | Payments Only |

### `frequencyCode` — Frequency  (10)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Daily |
| `2` | Weekly |
| `3` | Semi-monthly |
| `4` | Monthly |
| `5` | Quarterly |
| `6` | Annually |
| `7` | Maturity |
| `8` | One Time |
| `10` | Semi-annual |

### `frozenFlag` — Frozen Status  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `generalLedger` — General Ledger  (5)

| code | label |
|------|-------|
| `10001` | Commercial Loans |
| `20001` | Commercial Real Estate |
| `30001` | Held for Sale |
| `40001` | SBA Loans |
| `99999` | Conversion Default |

### `govrnmtContctPurpse` — Government Contract Purpose  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `hasAppraisalInfo` — Appraisal Information  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `hasInspectionInfo` — Inspection Information  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `hasInsuranceInfo` — Insurance Information  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `hasLienInfo` — Filing Information  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `hasTenantInfo` — Tenant Information  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `highlylevTrans` — Highly Leveraged Transaction  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `improvementAmountSource` — Improvement Amount Source  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Hazard Insurance Policy |

### `indBusInd` — Individual or Business  (2)

| code | label |
|------|-------|
| `0` | Individual |
| `1` | Business |

### `indicator` — Indicator  (2)

| code | label |
|------|-------|
| `0` | Amount |
| `1` | Percent |

### `industryCode` — Industry Code  (6)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Agriculture |
| `2` | Metals |
| `3` | Forest Products |
| `4` | Real Estate |
| `5` | Miscellaneous |

### `infrastructureAccess` — Infrastructure Access  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `initialApplSource` — Initial Application Source  (3)

| code | label |
|------|-------|
| `100` | Verbal |
| `110` | In Person |
| `120` | Online Application |

### `initiallPayableInd` — Initially Payable Indicator  (3)

| code | label |
|------|-------|
| `1` | Initially payable to your institution  |
| `2` | Not initially payable to your institution |
| `3` | Not applicable |

### `integrator` — Integrator  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `15` | Perdue Farms |

### `irrigated` — Irrigated  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `isDataAccurate` — Is the data in the above fields accurate?  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `isTiers` — Is Pricing Based on Tiers?  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `jurisdictionCode` — Jurisdiction  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Federal |

### `landContamination` — Land Contamination  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `landUseRestriction` — Land Use Restrictions  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `latChgModelCc` — Model Billing Charge Code  (205)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1000` | Interest |
| `1001` | Interest |
| `1002` | Interest |
| `1003` | Interest |
| `1004` | Interest |
| `1005` | Interest |
| `1020` | Deferred Interest |
| `1093` | Interest- Compounded Balance |
| `1099` | Penalty Interest |
| `1501` | Prepayment Premium |
| `1800` | Escrow Interest |
| `1801` | Escrow Interest |
| `1802` | Escrow Interest |
| `1803` | Escrow Interest |
| `1804` | Escrow Interest |
| `1805` | Escrow Interest |
| `1806` | Escrow Interest |
| `1900` | Penalty Interest |
| `3000` | FASB Origination Cost |
| `3001` | FASB Origination Cost |
| `3002` | FASB Origination Cost |
| `3003` | FASB Origination Cost |
| `3004` | FASB Origination Cost |
| `3005` | FASB Renewal Cost |
| `3006` | FASB Renewal Cost |
| `3007` | FASB Renewal Cost |
| `3008` | FASB Renewal Cost |
| `3009` | FASB Renewal Cost |
| `3010` | FASB Miscellaneous Cost |
| `3011` | FASB Miscellaneous Cost |
| `3012` | FASB Miscellaneous Cost |
| `3013` | FASB Miscellaneous Cost |
| `3014` | FASB Miscellaneous Cost |
| `3996` | FASB Origination Cost (cv only |
| `3997` | FASB Origination Cost (cv only |
| `3998` | FASB Renewal Cost  (cv only) |
| `3999` | FASB Renewal Cost  (cv only) |
| `4000` | Accrual Fee |
| `4001` | Accrual Fee |
| `4002` | Accrual Fee |
| `4003` | Accrual Fee |
| `4004` | Accrual Fee |
| `4052` | Default Int on past due prin |
| `4053` | Default Int on past due prin |
| `4054` | Default Int on past due prin |
| `4055` | Default Int on past due prin |
| `4500` | Non-SBA Participation Service |
| `4501` | Non-SBA Participation Service |
| `4600` | SBA Participation Service Fee |
| `4700` | SBA FTA Servicing Fee |
| `5000` | Documentation Fee |
| `5001` | Documentation Fee |
| `5002` | Annual Review Fee |
| `5003` | Annual Review Fee |
| `5004` | Reconveyance/ Payoff Fee |
| `5005` | Reconveyance/ Payoff Fee |
| `5006` | Demand Fee |
| `5007` | Demand Fee |
| `5008` | Manual Prepayment Fee |
| `5009` | Manual Prepayment Fee |
| `5010` | Returned Payment Fee |
| `5011` | Returned Payment Fee |
| `5012` | Standby Letter of Credit Fee |
| `5013` | Standby Letter of Credit Fee |
| `5014` | Agency Fee |
| `5015` | Agency Fee |
| `5016` | Miscellaneous Income Fee |
| `5017` | Miscellaneous Income Fee |
| `5300` | Legal/ Attorney Fee |
| `5301` | Legal/ Attorney Fee |
| `5302` | Appraisal Cost/ Review |
| `5303` | Appraisal Cost/ Review |
| `5304` | Outside Inspection |
| `5305` | Outside Inspection |
| `5306` | Title Insurance |
| `5307` | Title Insurance |
| `5308` | UCC Continuation/ Filing Fee |
| `5309` | UCC Continuation/ Filing Fee |
| `5310` | Discharge/ Satisfaction Fee |
| `5311` | Discharge/ Satisfaction Fee |
| `5312` | Flood Certification Fee |
| `5313` | Flood Certification Fee |
| `5314` | Property Taxes |
| `5315` | Property Taxes |
| `5316` | Force Placed Flood Insurance |
| `5317` | Force Placed Flood Insurance |
| `5318` | Force Placed Hazard Insurance |
| `5319` | Force Placed Hazard Insurance |
| `5320` | Doc Stamp Tax |
| `5321` | Doc Stamp Tax |
| `5322` | Miscellaneous Expense |
| `5323` | Miscellaneous Expense |
| `5400` | Assignor Fee- assignor |
| `5401` | Assignee Fee- assignor |
| `5402` | Assignee Fee- assignor |
| `5403` | Assignee Fee- assignor |
| `5405` | Other Fees- assignor |
| `5406` | Other Fees- assignor |
| `5407` | Cost of Carry- assignor |
| `5408` | Cost of Carry- assignor |
| `5409` | Economic Benefit- assignor |
| `5410` | Economic Benefit- assignor |
| `5411` | Amendment Fee- assignor |
| `5412` | Amendment Fee- assignor |
| `5413` | Break Funding Fee- assignor |
| `5414` | Break Funding Fee- assignor |
| `5415` | Consent Fee- assignor |
| `5416` | Consent Fee- assignor |
| `5417` | Delayed Comp Funded- assignor |
| `5418` | Delayed Comp Funded- assignor |
| `5419` | Delayed Comp Unfund- assignor |
| `5420` | Delayed Comp Unfund- assignor |
| `5421` | Prepayment Fee- assignor |
| `5422` | Prepayment Fee- assignor |
| `5423` | Waiver Fee- assignor |
| `5424` | Waiver Fee- assignor |
| `5425` | Ticking Fee- assignor |
| `5426` | Ticking Fee- assignor |
| `5427` | Upfront Fee- assignor |
| `5428` | Upfront Fee- assignor |
| `5440` | Assignor Fee- assignee |
| `5441` | Assignor Fee- assignee |
| `5442` | Assignee Fee- assignee |
| `5443` | Assignee Fee- assignee |
| `5444` | Other Fees- assignee |
| `5445` | Other Fees- assignee |
| `5446` | Cost of Carry- assignee |
| `5447` | Cost of Carry- assignee |
| `5448` | Economic Benefit- assignee |
| `5449` | Economic Benefit- assignee |
| `5450` | Amendment Fee- assignee |
| `5451` | Amendment Fee- assignee |
| `5452` | Break Funding Fee- assignee |
| `5453` | Break Funding Fee- assignee |
| `5454` | Consent Fee- assignee |
| `5455` | Consent Fee- assignee |
| `5456` | Delayed Comp Funded- assignee |
| `5457` | Delayed Comp Funded- assignee |
| `5458` | Delayed Comp Unfunded- assgnor |
| `5459` | Delayed Comp Unfunded- assgnor |
| `5460` | Prepayment Fee- assignee |
| `5461` | Prepayment Fee- assignee |
| `5462` | Waiver Fee- assignee |
| `5463` | Waiver Fee- assignee |
| `5464` | Ticking Fee- assignee |
| `5465` | Ticking Fee- assignee |
| `5466` | Upfront Fee- assignee |
| `5467` | Upfront Fee- assignee |
| `5468` | Broker Fee- assignor |
| `5469` | Broker Fee- assignor |
| `5470` | Broker Fee- assignee |
| `5471` | Broker Fee- assignee |
| `5600` | FASB Origination |
| `5601` | FASB Origination |
| `5602` | FASB Origination |
| `5603` | FASB Origination |
| `5604` | FASB Origination |
| `5605` | FASB Commitment |
| `5606` | FASB Commitment |
| `5607` | FASB Commitment |
| `5608` | FASB Commitment |
| `5609` | FASB Commitment |
| `5610` | FASB Renewal/ Major Mod |
| `5611` | FASB Renewal/ Major Mod |
| `5612` | FASB Renewal/ Major Mod |
| `5613` | FASB Renewal/ Major Mod |
| `5614` | FASB Renewal/ Major Mod |
| `5615` | FASB Amendment/ Minor Mod |
| `5616` | FASB Amendment/ Minor Mod |
| `5617` | FASB Amendment/ Minor Mod |
| `5618` | FASB Amendment/ Minor Mod |
| `5619` | FASB Amendment/ Minor Mod |
| `5620` | FASB In House Appraise/Inspect |
| `5621` | FASB In House Appraise/Inspect |
| `5622` | FASB In House Appraise/Inspect |
| `5623` | FASB In House Appraise/Inspect |
| `5624` | FASB In House Appraise/Inspect |
| `5990` | FASB Origination (cv only) |
| `5991` | FASB Origination (cv only) |
| `5992` | FASB Commitment (cv only) |
| `5993` | FASB Commitment (cv only) |
| `5994` | FASBRenew/ Major Mod (cv only) |
| `5995` | FASBRenew/ Major Mod (cv only) |
| `5996` | FASBAmend/Minor Mod (cv only) |
| `5997` | FASBAmend/Minor Mod (cv only) |
| `5998` | FASBInHouseAppr/Insp (cv only) |
| `5999` | FASBInHouseAppr/Insp (cv only) |
| `6100` | Discount on Purchased Loan |
| `6101` | Discount on Purchased Loan |
| `6102` | Discount on Purchased Loan |
| `6103` | Discount on Purchased Loan |
| `6104` | Discount on Purchased Loan |
| `6200` | Premium on Purchased Loan |
| `6201` | Premium on Purchased Loan |
| `6202` | Premium on Purchased Loan |
| `6203` | Premium on Purchased Loan |
| `6204` | Premium on Purchased Loan |
| `7000` | Cost of Funds |
| `8000` | Escrow |
| `8001` | Tax and Insurance |
| `8010` | Replacement Reserves |
| `8051` | Replacement Reserves |
| `8520` | Replacement Reserves |
| `9001` | Late Charges |

### `lateChargeFormulaType` — Late Charge Formula  (16)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | 5% no min/max 15 days |
| `2` | 5% $10 min/no max 15 days |
| `3` | 5% $15 min/$100 max 15 days |
| `4` | 5% $2.50 min/$5 max 12 days |
| `5` | $2.50 Flat 15 days |
| `6` | $25 Flat 15 days |
| `7` | 10% $25 min/no max 19 days |
| `8` | .25% no min/max 15 days |
| `9` | Conversion Default |
| `10` | $50 Flat 10 days |
| `11` | Late Charge Assess/ Waive Flat Amount |
| `50` | Wkly bill 30 day late |
| `77` | Assess and Waive Percent |
| `1000` | AT Late Charge-$25-15 Days |
| `1001` | AT Late Charge |

### `letterOfCredit` — Letter of Credit Type  (2)

| code | label |
|------|-------|
| `C` | Commercial |
| `S` | Standby L/C |

### `limitCode` — Limit  (10)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | End of month (EOM) |
| `2` | Business day EOM Else next business day |
| `3` | Stay on Day |
| `4` | Business day Else next business day |
| `5` | Business day else next business day;same month |
| `6` | Business Day EOM Else previous business day |
| `7` | Business day Else previous business day |
| `8` | Business Day Else Next Business Day - Stay On New Day |
| `9` | Business Day Else Previous Business Day, - Stay on New Day |

### `loanBalanceInd` — Balance Indicator  (2)

| code | label |
|------|-------|
| `B` | Basic |
| `S` | Scheduled Balance |

### `loanSprdPmtOpt` — Loan Spread Payment  (9)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Effective Date - Int, Prin, LC, Fee, Escrow |
| `2` | Oldest Invoice - Int, Prin, Escrow, LC, Fees |
| `3` | Oldest Invoice - Int, Prin, LC, Escrow, Fees |
| `10` | Individual Passes |
| `11` | SBA Payment |
| `12` | Eff Date - Fees, Interest, Principal |
| `13` | Oldest Invoice First |
| `14` | AFS - Individual Payments - Effective Date |

### `lobOverride` — Line of Business Override  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `managementCd` — Management Code  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `31` | Revol-SecBySFR-SFR-Condo (Use For All Condos) |

### `maturityInd` — Maturity Period  (3)

| code | label |
|------|-------|
| `1` | 1 Year or Less |
| `2` | Greater Than 1 Year |
| `3` | Demand |

### `methOfCollection` — Method of Collection  (9)

| code | label |
|------|-------|
| `11` | Mail |
| `12` | Hold |
| `13` | Email |
| `31` | DDA- On Us |
| `32` | DDA- Not On Us |
| `41` | Savings- On Us |
| `42` | Savings- Not On Us |
| `90` | Auto Interest Reserve |
| `91` | Manual Interest Reserve |

### `naics` — NAICS Code  (500)

| code | label |
|------|-------|
| `0` | Not Entered |
| `4522` | Department Stores |
| `4523` | General Merchandise Stores, including Warehouse Clubs and Supercenters |
| `5173` | Wired and Wireless Telecommunications Carriers |
| `21112` | Crude Petroleum Extraction |
| `21113` | Natural Gas Extraction |
| `45221` | Department Stores |
| `45231` | General Merchandise Stores, including Warehouse Clubs and Supercenters |
| `51225` | Record Production and Distribution |
| `51731` | Wired and Wireless Telecommunications Carriers |
| `53228` | Other Consumer Goods Rental |
| `111110` | Soybean Farming |
| `111120` | Oilseed (except Soybean) Farming |
| `111130` | Dry Pea and Bean Farming |
| `111140` | Wheat Farming |
| `111150` | Corn Farming |
| `111160` | Rice Farming |
| `111191` | Oilseed and Grain Combination Farming |
| `111199` | All Other Grain Farming |
| `111211` | Potato Farming |
| `111219` | Other Vegetable (except Potato) and Melon Farming |
| `111310` | Orange Groves |
| `111320` | Citrus (except Orange) Groves |
| `111331` | Apple Orchards |
| `111332` | Grape Vineyards |
| `111333` | Strawberry Farming |
| `111334` | Berry (except Strawberry) Farming |
| `111335` | Tree Nut Farming |
| `111336` | Fruit and Tree Nut Combination Farming |
| `111339` | Other Noncitrus Fruit Farming |
| `111411` | Mushroom Production |
| `111419` | Other Food Crops Grown Under Cover |
| `111421` | Nursery and Tree Production |
| `111422` | Floriculture Production |
| `111910` | Tobacco Farming |
| `111920` | Cotton Farming |
| `111930` | Sugarcane Farming |
| `111940` | Hay Farming |
| `111991` | Sugar Beet Farming |
| `111992` | Peanut Farming |
| `111998` | All Other Miscellaneous Crop Farming |
| `112111` | Beef Cattle Ranching and Farming |
| `112112` | Cattle Feedlots |
| `112120` | Dairy Cattle and Milk Production |
| `112130` | Dual-Purpose Cattle Ranching and Farming |
| `112210` | Hog and Pig Farming |
| `112310` | Chicken Egg Production |
| `112320` | Broilers and Other Meat Type Chicken Production |
| `112330` | Turkey Production |
| `112340` | Poultry Hatcheries |
| `112390` | Other Poultry Production |
| `112410` | Sheep Farming |
| `112420` | Goat Farming |
| `112511` | Finfish Farming and Fish Hatcheries |
| `112512` | Shellfish Farming |
| `112519` | Other Aquaculture |
| `112910` | Apiculture |
| `112920` | Horses and Other Equine Production |
| `112930` | Fur-Bearing Animal and Rabbit Production |
| `112990` | All Other Animal Production |
| `113110` | Timber Tract Operations |
| `113210` | Forest Nurseries and Gathering of Forest Products |
| `113310` | Logging |
| `114111` | Finfish Fishing |
| `114112` | Shellfish Fishing |
| `114119` | Other Marine Fishing |
| `114210` | Hunting and Trapping |
| `115111` | Cotton Ginning |
| `115112` | Soil Preparation, Planting, and Cultivating |
| `115113` | Crop Harvesting, Primarily by Machine |
| `115114` | Postharvest Crop Activities (except Cotton Ginning) |
| `115115` | Farm Labor Contractors and Crew Leaders |
| `115116` | Farm Management Services |
| `115210` | Support Activities for Animal Production |
| `115310` | Support Activities for Forestry |
| `211120` | Crude Petroleum Extraction |
| `211130` | Natural Gas Extraction |
| `212111` | Bituminous Coal and Lignite Surface Mining |
| `212112` | Bituminous Coal Underground Mining |
| `212113` | Anthracite Mining |
| `212114` | Surface Coal Mining |
| `212115` | Underground Coal Mining |
| `212210` | Iron Ore Mining |
| `212220` | Gold Ore and Silver Ore Mining |
| `212221` | Gold Ore Mining |
| `212222` | Silver Ore Mining |
| `212230` | Copper, Nickel, Lead, and Zinc Mining |
| `212290` | Other Metal Ore Mining |
| `212291` | Uranium-Radium-Vanadium Ore Mining |
| `212299` | All Other Metal Ore Mining |
| `212311` | Dimension Stone Mining and Quarrying |
| `212312` | Crushed and Broken Limestone Mining and Quarrying |
| `212313` | Crushed and Broken Granite Mining and Quarrying |
| `212319` | Other Crushed and Broken Stone Mining and Quarrying |
| `212321` | Construction Sand and Gravel Mining |
| `212322` | Industrial Sand Mining |
| `212323` | Kaolin, Clay, and Ceramic and Refractory Minerals Mining |
| `212324` | Kaolin and Ball Clay Mining |
| `212325` | Clay and Ceramic and Refractory Minerals Mining |
| `212390` | Other Nonmetallic Mineral Mining and Quarrying |
| `212391` | Potash, Soda, and Borate Mineral Mining |
| `212392` | Phosphate Rock Mining |
| `212393` | Other Chemical and Fertilizer Mineral Mining |
| `212399` | All Other Nonmetallic Mineral Mining |
| `213111` | Drilling Oil and Gas Wells |
| `213112` | Support Activities for Oil and Gas Operations |
| `213113` | Support Activities for Coal Mining |
| `213114` | Support Activities for Metal Mining |
| `213115` | Support Activities for Nonmetallic Minerals (except Fuels) Mining |
| `221111` | Hydroelectric Power Generation |
| `221112` | Fossil Fuel Electric Power Generation |
| `221113` | Nuclear Electric Power Generation |
| `221114` | Solar Electric Power Generation |
| `221115` | Wind Electric Power Generation |
| `221116` | Geothermal Electric Power Generation |
| `221117` | Biomass Electric Power Generation |
| `221118` | Other Electric Power Generation |
| `221121` | Electric Bulk Power Transmission and Control |
| `221122` | Electric Power Distribution |
| `221210` | Natural Gas Distribution |
| `221310` | Water Supply and Irrigation Systems |
| `221320` | Sewage Treatment Facilities |
| `221330` | Steam and Air-Conditioning Supply |
| `236115` | New Single-Family Housing Construction (except For-Sale Builders) |
| `236116` | New Multifamily Housing Construction (except For-Sale Builders) |
| `236117` | New Housing For-Sale Builders |
| `236118` | Residential Remodelers |
| `236210` | Industrial Building Construction |
| `236220` | Commercial and Institutional Building Construction |
| `237110` | Water and Sewer Line and Related Structures Construction |
| `237120` | Oil and Gas Pipeline and Related Structures Construction |
| `237130` | Power and Communication Line and Related Structures Construction |
| `237210` | Land Subdivision |
| `237310` | Highway, Street, and Bridge Construction |
| `237990` | Other Heavy and Civil Engineering Construction |
| `238110` | Poured Concrete Foundation and Structure Contractors |
| `238120` | Structural Steel and Precast Concrete Contractors |
| `238130` | Framing Contractors |
| `238140` | Masonry Contractors |
| `238150` | Glass and Glazing Contractors |
| `238160` | Roofing Contractors |
| `238170` | Siding Contractors |
| `238190` | Other Foundation, Structure, and Building Exterior Contractors |
| `238210` | Electrical Contractors and Other Wiring Installation Contractors |
| `238220` | Plumbing, Heating, and Air-Conditioning Contractors |
| `238290` | Other Building Equipment Contractors |
| `238310` | Drywall and Insulation Contractors |
| `238320` | Painting and Wall Covering Contractors |
| `238330` | Flooring Contractors |
| `238340` | Tile and Terrazzo Contractors |
| `238350` | Finish Carpentry Contractors |
| `238390` | Other Building Finishing Contractors |
| `238910` | Site Preparation Contractors |
| `238990` | All Other Specialty Trade Contractors |
| `311111` | Dog and Cat Food Manufacturing |
| `311119` | Other Animal Food Manufacturing |
| `311211` | Flour Milling |
| `311212` | Rice Milling |
| `311213` | Malt Manufacturing |
| `311221` | Wet Corn Milling |
| `311224` | Soybean and Other Oilseed Processing |
| `311225` | Fats and Oils Refining and Blending |
| `311230` | Breakfast Cereal Manufacturing |
| `311313` | Beet Sugar Manufacturing |
| `311314` | Cane Sugar Manufacturing |
| `311340` | Nonchocolate Confectionery Manufacturing |
| `311351` | Chocolate and Confectionery Manufacturing from Cacao Beans |
| `311352` | Confectionery Manufacturing from Purchased Chocolate |
| `311411` | Frozen Fruit, Juice, and Vegetable Manufacturing |
| `311412` | Frozen Specialty Food Manufacturing |
| `311421` | Fruit and Vegetable Canning |
| `311422` | Specialty Canning |
| `311423` | Dried and Dehydrated Food Manufacturing |
| `311511` | Fluid Milk Manufacturing |
| `311512` | Creamery Butter Manufacturing |
| `311513` | Cheese Manufacturing |
| `311514` | Dry, Condensed, and Evaporated Dairy Product Manufacturing |
| `311520` | Ice Cream and Frozen Dessert Manufacturing |
| `311611` | Animal (except Poultry) Slaughtering |
| `311612` | Meat Processed from Carcasses |
| `311613` | Rendering and Meat Byproduct Processing |
| `311615` | Poultry Processing |
| `311710` | Seafood Product Preparation and Packaging |
| `311811` | Retail Bakeries |
| `311812` | Commercial Bakeries |
| `311813` | Frozen Cakes, Pies, and Other Pastries Manufacturing |
| `311821` | Cookie and Cracker Manufacturing |
| `311824` | Dry Pasta, Dough, and Flour Mixes Manufacturing from Purchased Flour |
| `311830` | Tortilla Manufacturing |
| `311911` | Roasted Nuts and Peanut Butter Manufacturing |
| `311919` | Other Snack Food Manufacturing |
| `311920` | Coffee and Tea Manufacturing |
| `311930` | Flavoring Syrup and Concentrate Manufacturing |
| `311941` | Mayonnaise, Dressing, and Other Prepared Sauce Manufacturing |
| `311942` | Spice and Extract Manufacturing |
| `311991` | Perishable Prepared Food Manufacturing |
| `311999` | All Other Miscellaneous Food Manufacturing |
| `312111` | Soft Drink Manufacturing |
| `312112` | Bottled Water Manufacturing |
| `312113` | Ice Manufacturing |
| `312120` | Breweries |
| `312130` | Wineries |
| `312140` | Distilleries |
| `312230` | Tobacco Manufacturing |
| `313110` | Fiber, Yarn, and Thread Mills |
| `313210` | Broadwoven Fabric Mills |
| `313220` | Narrow Fabric Mills and Schiffli Machine Embroidery |
| `313230` | Nonwoven Fabric Mills |
| `313240` | Knit Fabric Mills |
| `313310` | Textile and Fabric Finishing Mills |
| `313320` | Fabric Coating Mills |
| `314110` | Carpet and Rug Mills |
| `314120` | Curtain and Linen Mills |
| `314910` | Textile Bag and Canvas Mills |
| `314994` | Rope, Cordage, Twine, Tire Cord, and Tire Fabric Mills |
| `314999` | All Other Miscellaneous Textile Product Mills |
| `315110` | Hosiery and Sock Mills |
| `315120` | Apparel Knitting Mills |
| `315190` | Other Apparel Knitting Mills |
| `315210` | Cut and Sew Apparel Contractors |
| `315220` | Men’s and Boys’ Cut and Sew Apparel Manufacturing |
| `315240` | Women’s, Girls’, and Infants’ Cut and Sew Apparel Manufacturing |
| `315250` | Cut and Sew Apparel Manufacturing (except Contractors) |
| `315280` | Other Cut and Sew Apparel Manufacturing |
| `315990` | Apparel Accessories and Other Apparel Manufacturing |
| `316110` | Leather and Hide Tanning and Finishing |
| `316210` | Footwear Manufacturing |
| `316990` | Other Leather and Allied Product Manufacturing |
| `316992` | Women's Handbag and Purse Manufacturing |
| `316998` | All Other Leather Good and Allied Product Manufacturing |
| `321113` | Sawmills |
| `321114` | Wood Preservation |
| `321211` | Hardwood Veneer and Plywood Manufacturing |
| `321212` | Softwood Veneer and Plywood Manufacturing |
| `321213` | Engineered Wood Member (except Truss) Manufacturing |
| `321214` | Truss Manufacturing |
| `321215` | Engineered Wood Member Manufacturing |
| `321219` | Reconstituted Wood Product Manufacturing |
| `321911` | Wood Window and Door Manufacturing |
| `321912` | Cut Stock, Resawing Lumber, and Planing |
| `321918` | Other Millwork (including Flooring) |
| `321920` | Wood Container and Pallet Manufacturing |
| `321991` | Manufactured Home (Mobile Home) Manufacturing |
| `321992` | Prefabricated Wood Building Manufacturing |
| `321999` | All Other Miscellaneous Wood Product Manufacturing |
| `322110` | Pulp Mills |
| `322120` | Paper Mills |
| `322121` | Paper (except Newsprint) Mills |
| `322122` | Newsprint Mills |
| `322130` | Paperboard Mills |
| `322211` | Corrugated and Solid Fiber Box Manufacturing |
| `322212` | Folding Paperboard Box Manufacturing |
| `322219` | Other Paperboard Container Manufacturing |
| `322220` | Paper Bag and Coated and Treated Paper Manufacturing |
| `322230` | Stationery Product Manufacturing |
| `322291` | Sanitary Paper Product Manufacturing |
| `322299` | All Other Converted Paper Product Manufacturing |
| `323111` | Commercial Printing (except Screen and Books) |
| `323113` | Commercial Screen Printing |
| `323117` | Books Printing |
| `323120` | Support Activities for Printing |
| `324110` | Petroleum Refineries |
| `324121` | Asphalt Paving Mixture and Block Manufacturing |
| `324122` | Asphalt Shingle and Coating Materials Manufacturing |
| `324191` | Petroleum Lubricating Oil and Grease Manufacturing |
| `324199` | All Other Petroleum and Coal Products Manufacturing |
| `325110` | Petrochemical Manufacturing |
| `325120` | Industrial Gas Manufacturing |
| `325130` | Synthetic Dye and Pigment Manufacturing |
| `325180` | Other Basic Inorganic Chemical Manufacturing |
| `325193` | Ethyl Alcohol Manufacturing |
| `325194` | Cyclic Crude, Intermediate, and Gum and Wood Chemical Manufacturing |
| `325199` | All Other Basic Organic Chemical Manufacturing |
| `325211` | Plastics Material and Resin Manufacturing |
| `325212` | Synthetic Rubber Manufacturing |
| `325220` | Artificial and Synthetic Fibers and Filaments Manufacturing |
| `325311` | Nitrogenous Fertilizer Manufacturing |
| `325312` | Phosphatic Fertilizer Manufacturing |
| `325314` | Fertilizer (Mixing Only) Manufacturing |
| `325315` | Compost Manufacturing |
| `325320` | Pesticide and Other Agricultural Chemical Manufacturing |
| `325411` | Medicinal and Botanical Manufacturing |
| `325412` | Pharmaceutical Preparation Manufacturing |
| `325413` | In-Vitro Diagnostic Substance Manufacturing |
| `325414` | Biological Product (except Diagnostic) Manufacturing |
| `325510` | Paint and Coating Manufacturing |
| `325520` | Adhesive Manufacturing |
| `325611` | Soap and Other Detergent Manufacturing |
| `325612` | Polish and Other Sanitation Good Manufacturing |
| `325613` | Surface Active Agent Manufacturing |
| `325620` | Toilet Preparation Manufacturing |
| `325910` | Printing Ink Manufacturing |
| `325920` | Explosives Manufacturing |
| `325991` | Custom Compounding of Purchased Resins |
| `325992` | Photographic Film, Paper, Plate, and Chemical Manufacturing |
| `325998` | All Other Miscellaneous Chemical Product and Preparation Manufacturing |
| `326111` | Plastics Bag and Pouch Manufacturing |
| `326112` | Plastics Packaging Film and Sheet (including Laminated) Manufacturing |
| `326113` | Unlaminated Plastics Film and Sheet (except Packaging) Manufacturing |
| `326121` | Unlaminated Plastics Profile Shape Manufacturing |
| `326122` | Plastics Pipe and Pipe Fitting Manufacturing |
| `326130` | Laminated Plastics Plate, Sheet (except Packaging), and Shape Manufacturing |
| `326140` | Polystyrene Foam Product Manufacturing |
| `326150` | Urethane and Other Foam Product (except Polystyrene) Manufacturing |
| `326160` | Plastics Bottle Manufacturing |
| `326191` | Plastics Plumbing Fixture Manufacturing |
| `326199` | All Other Plastics Product Manufacturing |
| `326211` | Tire Manufacturing (except Retreading) |
| `326212` | Tire Retreading |
| `326220` | Rubber and Plastics Hoses and Belting Manufacturing |
| `326291` | Rubber Product Manufacturing for Mechanical Use |
| `326299` | All Other Rubber Product Manufacturing |
| `327110` | Pottery, Ceramics, and Plumbing Fixture Manufacturing |
| `327120` | Clay Building Material and Refractories Manufacturing |
| `327211` | Flat Glass Manufacturing |
| `327212` | Other Pressed and Blown Glass and Glassware Manufacturing |
| `327213` | Glass Container Manufacturing |
| `327215` | Glass Product Manufacturing Made of Purchased Glass |
| `327310` | Cement Manufacturing |
| `327320` | Ready-Mix Concrete Manufacturing |
| `327331` | Concrete Block and Brick Manufacturing |
| `327332` | Concrete Pipe Manufacturing |
| `327390` | Other Concrete Product Manufacturing |
| `327410` | Lime Manufacturing |
| `327420` | Gypsum Product Manufacturing |
| `327910` | Abrasive Product Manufacturing |
| `327991` | Cut Stone and Stone Product Manufacturing |
| `327992` | Ground or Treated Mineral and Earth Manufacturing |
| `327993` | Mineral Wool Manufacturing |
| `327999` | All Other Miscellaneous Nonmetallic Mineral Product Manufacturing |
| `331110` | Iron and Steel Mills and Ferroalloy Manufacturing |
| `331210` | Iron and Steel Pipe and Tube Manufacturing from Purchased Steel |
| `331221` | Rolled Steel Shape Manufacturing |
| `331222` | Steel Wire Drawing |
| `331313` | Alumina Refining and Primary Aluminum Production |
| `331314` | Secondary Smelting and Alloying of Aluminum |
| `331315` | Aluminum Sheet, Plate, and Foil Manufacturing |
| `331318` | Other Aluminum Rolling, Drawing, and Extruding |
| `331410` | Nonferrous Metal (except Aluminum) Smelting and Refining |
| `331420` | Copper Rolling, Drawing, Extruding, and Alloying |
| `331491` | Nonferrous Metal (except Copper and Aluminum) Rolling, Drawing, and Extruding |
| `331492` | Secondary Smelting, Refining, and Alloying of Nonferrous Metal (except Copper an |
| `331511` | Iron Foundries |
| `331512` | Steel Investment Foundries |
| `331513` | Steel Foundries (except Investment) |
| `331523` | Nonferrous Metal Die-Casting Foundries |
| `331524` | Aluminum Foundries (except Die-Casting) |
| `331529` | Other Nonferrous Metal Foundries (except Die-Casting) |
| `332111` | Iron and Steel Forging |
| `332112` | Nonferrous Forging |
| `332114` | Custom Roll Forming |
| `332117` | Powder Metallurgy Part Manufacturing |
| `332119` | Metal Crown, Closure, and Other Metal Stamping (except Automotive) |
| `332215` | Metal Kitchen Cookware, Utensil, Cutlery, and Flatware (except Precious) Manufac |
| `332216` | Saw Blade and Handtool Manufacturing |
| `332311` | Prefabricated Metal Building and Component Manufacturing |
| `332312` | Fabricated Structural Metal Manufacturing |
| `332313` | Plate Work Manufacturing |
| `332321` | Metal Window and Door Manufacturing |
| `332322` | Sheet Metal Work Manufacturing |
| `332323` | Ornamental and Architectural Metal Work Manufacturing |
| `332410` | Power Boiler and Heat Exchanger Manufacturing |
| `332420` | Metal Tank (Heavy Gauge) Manufacturing |
| `332431` | Metal Can Manufacturing |
| `332439` | Other Metal Container Manufacturing |
| `332510` | Hardware Manufacturing |
| `332613` | Spring Manufacturing |
| `332618` | Other Fabricated Wire Product Manufacturing |
| `332710` | Machine Shops |
| `332721` | Precision Turned Product Manufacturing |
| `332722` | Bolt, Nut, Screw, Rivet, and Washer Manufacturing |
| `332811` | Metal Heat Treating |
| `332812` | Metal Coating, Engraving (except Jewelry and Silverware), and Allied Services to |
| `332813` | Electroplating, Plating, Polishing, Anodizing, and Coloring |
| `332911` | Industrial Valve Manufacturing |
| `332912` | Fluid Power Valve and Hose Fitting Manufacturing |
| `332913` | Plumbing Fixture Fitting and Trim Manufacturing |
| `332919` | Other Metal Valve and Pipe Fitting Manufacturing |
| `332991` | Ball and Roller Bearing Manufacturing |
| `332992` | Small Arms Ammunition Manufacturing |
| `332993` | Ammunition (except Small Arms) Manufacturing |
| `332994` | Small Arms, Ordnance, and Ordnance Accessories Manufacturing |
| `332996` | Fabricated Pipe and Pipe Fitting Manufacturing |
| `332999` | All Other Miscellaneous Fabricated Metal Product Manufacturing |
| `333111` | Farm Machinery and Equipment Manufacturing |
| `333112` | Lawn and Garden Tractor and Home Lawn and Garden Equipment Manufacturing |
| `333120` | Construction Machinery Manufacturing |
| `333131` | Mining Machinery and Equipment Manufacturing |
| `333132` | Oil and Gas Field Machinery and Equipment Manufacturing |
| `333241` | Food Product Machinery Manufacturing |
| `333242` | Semiconductor Machinery Manufacturing |
| `333243` | Sawmill, Woodworking, and Paper Machinery Manufacturing |
| `333244` | Printing Machinery and Equipment Manufacturing |
| `333248` | All Other Industrial Machinery Manufacturing |
| `333249` | Other Industrial Machinery Manufacturing |
| `333310` | Commercial and Service Industry Machinery Manufacturing |
| `333314` | Optical Instrument and Lens Manufacturing |
| `333316` | Photographic and Photocopying Equipment Manufacturing |
| `333318` | Other Commercial and Service Industry Machinery Manufacturing |
| `333413` | Industrial and Commercial Fan and Blower and Air Purification Equipment Manufact |
| `333414` | Heating Equipment (except Warm Air Furnaces) Manufacturing |
| `333415` | Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Re |
| `333511` | Industrial Mold Manufacturing |
| `333514` | Special Die and Tool, Die Set, Jig, and Fixture Manufacturing |
| `333515` | Cutting Tool and Machine Tool Accessory Manufacturing |
| `333517` | Machine Tool Manufacturing |
| `333519` | Rolling Mill and Other Metalworking Machinery Manufacturing |
| `333611` | Turbine and Turbine Generator Set Units Manufacturing |
| `333612` | Speed Changer, Industrial High-Speed Drive, and Gear Manufacturing |
| `333613` | Mechanical Power Transmission Equipment Manufacturing |
| `333618` | Other Engine Equipment Manufacturing |
| `333912` | Air and Gas Compressor Manufacturing |
| `333914` | Measuring, Dispensing, and Other Pumping Equipment Manufacturing |
| `333921` | Elevator and Moving Stairway Manufacturing |
| `333922` | Conveyor and Conveying Equipment Manufacturing |
| `333923` | Overhead Traveling Crane, Hoist, and Monorail System Manufacturing |
| `333924` | Industrial Truck, Tractor, Trailer, and Stacker Machinery Manufacturing |
| `333991` | Power-Driven Handtool Manufacturing |
| `333992` | Welding and Soldering Equipment Manufacturing |
| `333993` | Packaging Machinery Manufacturing |
| `333994` | Industrial Process Furnace and Oven Manufacturing |
| `333995` | Fluid Power Cylinder and Actuator Manufacturing |
| `333996` | Fluid Power Pump and Motor Manufacturing |
| `333997` | Scale and Balance Manufacturing |
| `333998` | All Other Miscellaneous General Purpose Machinery Manufacturing |
| `333999` | All Other Miscellaneous General Purpose Machinery Manufacturing |
| `334111` | Electronic Computer Manufacturing |
| `334112` | Computer Storage Device Manufacturing |
| `334118` | Computer Terminal and Other Computer Peripheral Equipment Manufacturing |
| `334210` | Telephone Apparatus Manufacturing |
| `334220` | Radio and Television Broadcasting and Wireless Communications Equipment Manufact |
| `334290` | Other Communications Equipment Manufacturing |
| `334310` | Audio and Video Equipment Manufacturing |
| `334412` | Bare Printed Circuit Board Manufacturing |
| `334413` | Semiconductor and Related Device Manufacturing |
| `334416` | Capacitor, Resistor, Coil, Transformer, and Other Inductor Manufacturing |
| `334417` | Electronic Connector Manufacturing |
| `334418` | Printed Circuit Assembly (Electronic Assembly) Manufacturing |
| `334419` | Other Electronic Component Manufacturing |
| `334510` | Electromedical and Electrotherapeutic Apparatus Manufacturing |
| `334511` | Search, Detection, Navigation, Guidance, Aeronautical, and Nautical System and I |
| `334512` | Automatic Environmental Control Manufacturing for Residential, Commercial, and A |
| `334513` | Instruments and Related Products Manufacturing for Measuring, Displaying, and Co |
| `334514` | Totalizing Fluid Meter and Counting Device Manufacturing |
| `334515` | Instrument Manufacturing for Measuring and Testing Electricity and Electrical Si |
| `334516` | Analytical Laboratory Instrument Manufacturing |
| `334517` | Irradiation Apparatus Manufacturing |
| `334519` | Other Measuring and Controlling Device Manufacturing |
| `334610` | Manufacturing and Reproducing Magnetic and Optical Media |
| `334613` | Blank Magnetic and Optical Recording Media Manufacturing |
| `334614` | Software and Other Prerecorded Compact Disc, Tape, and Record Reproducing |
| `335110` | Electric Lamp Bulb and Part Manufacturing |
| `335121` | Residential Electric Lighting Fixture Manufacturing |
| `335122` | Commercial, Industrial, and Institutional Electric Lighting Fixture Manufacturin |
| `335129` | Other Lighting Equipment Manufacturing |
| `335131` | Residential Electric Lighting Fixture Manufacturing |
| `335132` | Commercial, Industrial, and Institutional Electric Lighting Fixture Manufacturin |
| `335139` | Electric Lamp Bulb and Other Lighting Equipment Manufacturing |
| `335210` | Small Electrical Appliance Manufacturing |
| `335220` | Major Household Appliance Manufacturing |
| `335311` | Power, Distribution, and Specialty Transformer Manufacturing |
| `335312` | Motor and Generator Manufacturing |
| `335313` | Switchgear and Switchboard Apparatus Manufacturing |
| `335314` | Relay and Industrial Control Manufacturing |
| `335910` | Battery Manufacturing |
| `335911` | Storage Battery Manufacturing |
| `335912` | Primary Battery Manufacturing |
| `335921` | Fiber Optic Cable Manufacturing |
| `335929` | Other Communication and Energy Wire Manufacturing |
| `335931` | Current-Carrying Wiring Device Manufacturing |
| `335932` | Noncurrent-Carrying Wiring Device Manufacturing |
| `335991` | Carbon and Graphite Product Manufacturing |
| `335999` | All Other Miscellaneous Electrical Equipment and Component Manufacturing |
| `336110` | Automobile and Light Duty Motor Vehicle Manufacturing |
| `336111` | Automobile Manufacturing |
| `336112` | Light Truck and Utility Vehicle Manufacturing |
| `336120` | Heavy Duty Truck Manufacturing |
| `336211` | Motor Vehicle Body Manufacturing |
| `336212` | Truck Trailer Manufacturing |
| `336213` | Motor Home Manufacturing |
| `336214` | Travel Trailer and Camper Manufacturing |
| `336310` | Motor Vehicle Gasoline Engine and Engine Parts Manufacturing |
| `336320` | Motor Vehicle Electrical and Electronic Equipment Manufacturing |
| `336330` | Motor Vehicle Steering and Suspension Components (except Spring) Manufacturing |
| `336340` | Motor Vehicle Brake System Manufacturing |
| `336350` | Motor Vehicle Transmission and Power Train Parts Manufacturing |
| `336360` | Motor Vehicle Seating and Interior Trim Manufacturing |
| `336370` | Motor Vehicle Metal Stamping |
| `336390` | Other Motor Vehicle Parts Manufacturing |
| `336411` | Aircraft Manufacturing |
| `336412` | Aircraft Engine and Engine Parts Manufacturing |
| `336413` | Other Aircraft Parts and Auxiliary Equipment Manufacturing |
| `336414` | Guided Missile and Space Vehicle Manufacturing |
| `336415` | Guided Missile and Space Vehicle Propulsion Unit and Propulsion Unit Parts Manuf |
| `336419` | Other Guided Missile and Space Vehicle Parts and Auxiliary Equipment Manufacturi |
| `336510` | Railroad Rolling Stock Manufacturing |
| `336611` | Ship Building and Repairing |
| `336612` | Boat Building |
| `336991` | Motorcycle, Bicycle, and Parts Manufacturing |
| `336992` | Military Armored Vehicle, Tank, and Tank Component Manufacturing |

### `noiIndicator` — NOI Indicator  (3)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Applicable |
| `2` | Not applicable |

### `obligationType` — Obligation Type  (21)

| code | label |
|------|-------|
| `0` | Not Entered |
| `114` | Mortgage Loans |
| `3000` | Bridge Loan |
| `3010` | Facility to Term |
| `3015` | Loan- Term |
| `3020` | Loan- Time |
| `3025` | Loan- Demand |
| `3030` | Swing Line |
| `3035` | Non- Revolving Facility |
| `3040` | Revolving Facility |
| `3045` | Guidance Line |
| `3100` | Banker's Acceptances Domestic Discounted |
| `3105` | Banker's Acceptances Domestic Unfunded |
| `3110` | Banker's Acceptances International Discounted |
| `3115` | Banker's Acceptances International Unfunded |
| `3120` | Letter of Credit Domestic Standby - Financial |
| `3125` | Letter of Credit Domestic Standby - Performance |
| `3130` | Letter of Credit Domestic Commercial |
| `3135` | Letter of Credit International Standby - Financial |
| `3140` | Letter of Credit International Standby - Performance |
| `3145` | Letter of Credit International Commercial |

### `onlineBankEligInd` — Online Banking Eligibility  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `orgId` — Organization ID  (2)

| code | label |
|------|-------|
| `9020000091946207` | 1 - *AFS Bank N.A. |
| `9020000091946208` | 2 - *AFS Global Organization |

### `orgLevels0` — User Defined 1  (4)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `1100` | *Eastern |
| `2200` | *Central |
| `3300` | *Western |

### `orgLevels1` — User Defined 2  (68)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `1` | *Alabama |
| `2` | *Alaska |
| `3` | *Arizona |
| `4` | *Arkansas |
| `5` | *California |
| `6` | *Colorado |
| `7` | *Connecticut |
| `8` | *Delaware |
| `9` | *District of Columbia |
| `10` | *Florida |
| `11` | *Georgia |
| `12` | *Hawaii |
| `13` | *Idaho |
| `14` | *Illinois |
| `15` | *Indiana |
| `16` | *Iowa |
| `17` | *Kansas |
| `18` | *Kentucky |
| `19` | *Louisiana |
| `20` | *Maine |
| `21` | *Maryland |
| `22` | *Massachusetts |
| `23` | *Michigan |
| `24` | *Minnesota |
| `25` | *Mississippi |
| `26` | *Missouri |
| `27` | *Montana |
| `28` | *Nebraska |
| `29` | *Nevada |
| `30` | *New Hampshire |
| `31` | *New Jersey |
| `32` | *New Mexico |
| `33` | *New York |
| `34` | *North Carolina |
| `35` | *North Dakota |
| `36` | *Ohio |
| `37` | *Oklahoma |
| `38` | *Oregon |
| `39` | *Pennsylvania |
| `40` | *Rhode Island |
| `41` | *South Carolina |
| `42` | *South Dakota |
| `43` | *Tennessee |
| `44` | *Texas |
| `45` | *Utah |
| `46` | *Vermont |
| `47` | *Virginia |
| `48` | *Washington |
| `49` | *West Virginia |
| `50` | *Wisconsin |
| `51` | *Wyoming |
| `52` | *Guam |
| `53` | *Puerto Rico |
| `54` | *Virgin Islands (US) |
| `55` | *Alberta |
| `56` | *British Columbia |
| `57` | *Manitoba |
| `58` | *New Brunswick |
| `59` | *Newfoundland and Labrador |
| `60` | *Northwest Territories |
| `61` | *Nova Scotia |
| `62` | *Nunavut |
| `63` | *Ontario |
| `64` | *Prince Edward Island |
| `65` | *Quebec |
| `66` | *Saskatchewan |
| `67` | *Yukon |

### `orgLevels10` — Officer 1  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels11` — Officer 2  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels12` — Officer 3  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels13` — Officer 4  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels14` — Officer 5  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels15` — Officer 6  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels16` — Officer 7  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels17` — Officer 8  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels18` — Officer 9  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels19` — Officer 10  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `orgLevels2` — User Defined 3  (5)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `1550` | *Commercial Lending |
| `2550` | *Commercial Real Estate |
| `3550` | *Corporate Lending |
| `4550` | *SBA Lending |

### `orgLevels3` — User Defined 4  (1)

| code | label |
|------|-------|
| `0` | *Not Entered |

### `orgLevels4` — User Defined 5  (1)

| code | label |
|------|-------|
| `0` | *Not Entered |

### `orgLevels5` — User Defined 6  (1)

| code | label |
|------|-------|
| `0` | *Not Entered |

### `orgLevels6` — User Defined 7  (1)

| code | label |
|------|-------|
| `0` | *Not Entered |

### `orgLevels7` — User Defined 8  (1)

| code | label |
|------|-------|
| `0` | *Not Entered |

### `orgLevels8` — Assignment Unit  (16)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1001500` | *Commercial Lending- East |
| `1002500` | *Commercial Lending- Central |
| `1003500` | *Commercial Lending- West |
| `1007500` | *Commercial Bank - UK |
| `2001500` | *Commercial Real Estate- East |
| `2002500` | *Commercial Real Estate- Central |
| `2003500` | *Commercial Real Estate- West |
| `3001500` | *Corporate Banking- East |
| `3002500` | *Corporate Banking- Central |
| `3003500` | *Corporate Banking- West |
| `4001500` | *SBA Lending- East |
| `4002500` | *SBA Lending- Central |
| `4003500` | *SBA Lending- West |
| `5005500` | *Automation AU |
| `5005999` | *Offset Entries Only |

### `orgLevels9` — Service Unit  (7)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `15` | *Loan Services - CLCS |
| `1000` | *Commercial Loan Services |
| `2000` | *Specialty Assets Group |
| `5000` | *Automation SU |
| `9800` | *Inbound Interfaces |
| `9900` | *System Generated Transactions |

### `overrideFASBCost` — Override FASB Cost  (2)

| code | label |
|------|-------|
| `1` | Yes |
| `2` | No |

### `ownershipInterest` — Ownership Interest  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Fee Simple |
| `2` | Leasehold |

### `paidLoanEligibility` — Paid Loan Indicator  (6)

| code | label |
|------|-------|
| `0` | Not Entered (Same as Not Available) |
| `1` | Not Available for Paid Loan processing |
| `2` | Available for Paid Loan processing |
| `3` | Meets criteria for Paid Loan processing |
| `8` | Paid Loan processing complete - obligation in dormant status |
| `9` | Paid Loan processing complete - obligation no longer viewable |

### `partSyndi` — Participation / Syndication  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `pastDueNotice` — Past Due Notice to Indirect  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `paymentTypeCode` — Payment Type  (4)

| code | label |
|------|-------|
| `I` | Interest |
| `P` | Principal |
| `P&I` | Principal&Interest |
| `P+I` | Principal+Interest |

### `pctAmtSelector` — Limit by Percent or Amount  (2)

| code | label |
|------|-------|
| `1` | Percent |
| `2` | Amount |

### `penaltyFormulaType` — Prepayment Premium Formula Type  (19)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | 5 Yrs. 100% 5-4-3-2-1 |
| `2` | 5 Yrs. 10% 5-4-3-2-1 |
| `3` | 3 Yrs. 100% 3-2-1 |
| `4` | 5 Yrs. 100% 2% |
| `5` | Manual |
| `6` | Break Funding |
| `7` | SBA - 20% 5-3-1 |
| `8` | SBA - 25% 5-3-1 |
| `102` | AT - SBA - 20% 5-3-1 |
| `308` | Opt 14 TS 4 |
| `530` | PR14 - Term- OP - 10% - Orig Eff- 5-4-3-2-1 |
| `11010` | PR YM - 10% min - 14 |
| `13000` | Yield Maintenance |
| `14000` | Calc Opt 7 Tp 0 Td 0 |
| `14003` | Calc Opt 8 Tp 0 Td 0 |
| `14017` | Calc Opt 7 Tp 0 Td 1 |
| `14019` | Calc Opt 8 Tp 0 Td 1 |
| `14020` | Calc Opt 8 Tp 0 Td  2 |

### `permanentWaiveReason` — Permanent Waive Reason  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Acquired through Conversion |
| `2` | Approved by Credit Officer |
| `3` | Contractual Stipulation |

### `poolEligibility` — Loss Allowance Pool Eligibility  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | FASB Eligible |
| `2` | IASB Eligible |
| `4` | Not Eligible |

### `portfolioType` — Portfolio Type  (6)

| code | label |
|------|-------|
| `0` | Not Entered |
| `C` | Line of Credit |
| `I` | Installment (Term Loan) |
| `M` | Mortgage |
| `O` | Open |
| `R` | Revolving |

### `prepayCode` — Prepay Code  (3)

| code | label |
|------|-------|
| `0` | Do Not Credit Pre-Payment to Next Bill |
| `1` | Credit Pre-Payment to Next Bill |
| `5` | Do Not Credit Pre-payment to Next Bill - Net Past Dues |

### `pricingMethod` — Pricing Method  (2)

| code | label |
|------|-------|
| `N` | Non-Tiered |
| `T` | Tiered |

### `pricingOption` — Pricing Option  (2)

| code | label |
|------|-------|
| `0` | Variable |
| `3` | Fixed |

### `primaryBorrower` — Primary Borrower  (1)

| code | label |
|------|-------|
| `9020000091488647` | *Piedmont Precision Components, Inc. - 34160 |

### `primaryOccupancy` — Primary Occupancy  (14)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10` | OO-Owner Occupied Residential-Primary |
| `11` | OO-Owner Occupied Residential-Secondary |
| `12` | OO-Owner Occupied Non-Residential |
| `14` | NOO-Single Tenant-Non Credit |
| `15` | NOO-Single Tenant-Credit |
| `20` | NOO-Multitenant-Credit Anchored |
| `22` | NOO-Multitenant-Non-Credit Anchored |
| `24` | NOO-Multitenant-Non-Anchored |
| `30` | NOO-Franchised |
| `32` | NOO-Independent |
| `34` | NOO-Residential |
| `40` | Land |
| `99` | Conversion Default |

### `primaryState` — Primary State  (82)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Alabama |
| `2` | Alaska |
| `3` | Arizona |
| `4` | Arkansas |
| `5` | California |
| `6` | Colorado |
| `7` | Connecticut |
| `8` | Delaware |
| `9` | District of Columbia |
| `10` | Florida |
| `11` | Georgia |
| `12` | Hawaii |
| `13` | Idaho |
| `14` | Illinois |
| `15` | Indiana |
| `16` | Iowa |
| `17` | Kansas |
| `18` | Kentucky |
| `19` | Louisiana |
| `20` | Maine |
| `21` | Maryland |
| `22` | Massachusetts |
| `23` | Michigan |
| `24` | Minnesota |
| `25` | Mississippi |
| `26` | Missouri |
| `27` | Montana |
| `28` | Nebraska |
| `29` | Nevada |
| `30` | New Hampshire |
| `31` | New Jersey |
| `32` | New Mexico |
| `33` | New York |
| `34` | North Carolina |
| `35` | North Dakota |
| `36` | Ohio |
| `37` | Oklahoma |
| `38` | Oregon |
| `39` | Pennsylvania |
| `40` | Rhode Island |
| `41` | South Carolina |
| `42` | South Dakota |
| `43` | Tennessee |
| `44` | Texas |
| `45` | Utah |
| `46` | Vermont |
| `47` | Virginia |
| `48` | Washington |
| `49` | West Virginia |
| `50` | Wisconsin |
| `51` | Wyoming |
| `52` | Guam |
| `53` | Puerto Rico |
| `54` | Virgin Islands (US) |
| `55` | Alberta |
| `56` | British Columbia |
| `57` | Manitoba |
| `58` | New Brunswick |
| `59` | Newfoundland and Labrador |
| `60` | Northwest Territories |
| `61` | Nova Scotia |
| `62` | Nunavut |
| `63` | Ontario |
| `64` | Prince Edward Island |
| `65` | Quebec |
| `66` | Saskatchewan |
| `67` | Yukon |
| `99` | Conversion Default |
| `100` | AB |
| `101` | BC |
| `102` | MB |
| `103` | NB |
| `104` | NL |
| `105` | NT |
| `106` | NS |
| `107` | NU |
| `108` | ON |
| `109` | PE |
| `110` | QC |
| `111` | SK |
| `112` | YT |

### `prinRepayInd` — Principal Repayment?  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `prnBalPmntOrder` — Principal Spread Option  (6)

| code | label |
|------|-------|
| `1` | Ratable by balance |
| `2` | Ascending effective date |
| `3` | Descending effective date |
| `4` | Ascending balance |
| `5` | Descending balance |
| `6` | Balance priority code |

### `product` — Product  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `200` | AFS products |
| `201` | Line of Credit (Committed) |
| `900` | Non AFS products |

### `productStructure` — Product  (3)

| code | label |
|------|-------|
| `C` | Standalone Loan |
| `F` | Commitment |
| `L` | Letter Of Credit |

### `programLendingLocation` — Program Lending Location  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1001` | REFG-FL - Tampa Bay |

### `programType` — Program Type  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1000` | RECAD |

### `propertyCategory` — Property Category  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1000` | Building and Land |
| `2000` | Building Only |
| `3000` | Land |

### `propertyType` — Property Type  (4)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1101` | Residential Buildings |
| `1201` | Commercial Buildings |
| `1301` | Land Only |

### `purposeCategory` — Purpose Category  (5)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10` | OO-Owner Occupied |
| `20` | NOO-Single Tenant-Credit |
| `25` | NOO-Other Non-Owner Occupied |
| `99` | Conversion Default |

### `purposeCode` — Purpose Code  (219)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1035` | Acquisition Business Loans |
| `1070` | Acquisition Cap Expenditures-Business |
| `1105` | Acquisition Other |
| `1140` | Acquisition Real Estate-Dev'T Properties |
| `1175` | Acquisition Real Estate-Improved Prop. Develop |
| `1210` | Acquisition Real Estate-Improved Prop. Invest |
| `1245` | Acquisition Real Estate-Raw Land  Devlopment |
| `1280` | Acquisition Real Estate-Raw Land  Investment |
| `1315` | Business Expansion |
| `1350` | Business Finance |
| `1385` | Buy Out Partner Or Major Stockholder |
| `1420` | Capital Improvements |
| `1455` | Capital Improvements - Agricultural |
| `1490` | Capital Investment In Owned Business |
| `1525` | Career Development - Dds Or Md |
| `1560` | Cash Advance |
| `1595` | Charitable Institutions |
| `1630` | Church/Religious Facility |
| `1665` | Civic/Comm/Gov'T/Not For Profit |
| `1700` | Comm/Inc Prop Used In Business |
| `1735` | Comm/Ind Prop Not Used In Bus |
| `1770` | Commercial Loans Not Secured By Re |
| `1805` | Commercial Loans Secured By Real Estate |
| `1840` | Commercial Muni Real Estate |
| `1875` | Commercial Paper |
| `1910` | Commercial, Industrial |
| `1945` | Communications,Oth Util Equip |
| `1980` | Company Stock Repurchase |
| `2015` | Construction Apartments |
| `2050` | Construction Expansion Loans |
| `2085` | Construction For Sale-Housing |
| `2120` | Construction For Sale-New |
| `2155` | Construction For Sale-Other |
| `2190` | Construction For Sale-Rehab |
| `2225` | Construction Hotel/Motel |
| `2260` | Construction Industrial |
| `2295` | Construction Municipal |
| `2330` | Construction Non-Speculative |
| `2365` | Construction Office |
| `2400` | Construction Other |
| `2435` | Construction Resturant |
| `2470` | Construction Retail |
| `2505` | Construction Speculative |
| `2540` | Consumer Bridge Loan |
| `2575` | Consumer Loans Other |
| `2610` | Corporate Credit Card |
| `2645` | Corporate Taxes |
| `2680` | Counter Party Exposure |
| `2715` | Credit Card Guarantee |
| `2750` | Crop Loan |
| `2785` | Day Loan / Overnight Loan |
| `2820` | Daycare/School |
| `2855` | Dealerships - Auto/Truck/Equip |
| `2890` | Domestic Shipments |
| `2925` | Energy Loans |
| `2960` | Equipment & Fixtures Heavy Mfg |
| `2995` | Equipment & Fixtures Light Mfg |
| `3030` | Equipment Construction |
| `3065` | Equipment Other |
| `3100` | Equipment Service Industries |
| `3135` | Equipment Transportation |
| `3170` | Esop Loans |
| `3205` | Export Financing |
| `3240` | Fed Fund Lines |
| `3275` | Film Industry Loan |
| `3310` | Film Production |
| `3345` | Finance Accounts Receivable |
| `3380` | Finance Education - Personal |
| `3415` | Finance Inventory |
| `3450` | Finance Payables / Inventory |
| `3485` | Finance Receivables/Inventory |
| `3520` | Financed Real Estate Owner Occupied - Cash Out |
| `3555` | Financed Real Estate Owner Occupied - No Cash Out |
| `3590` | Financial Institutions |
| `3625` | Financial Other |
| `3660` | Fitness/Recreational Facility |
| `3695` | Floor Planning Auto |
| `3730` | Floor Planning Other |
| `3765` | Foreign Currency |
| `3800` | Foreign Exchange Contracts |
| `3835` | Foreign Shipment |
| `3870` | Former Reo - New Buyer |
| `3905` | Funeral Home |
| `3940` | Fx Exposure |
| `3975` | General Business Purposes |
| `4010` | Golf Course/Country Club |
| `4045` | Goods In Process Of Production |
| `4080` | Govt Guaranteed Loans Bought |
| `4115` | Govt Securities Oth Than Dealr |
| `4150` | Guarantee Letters Of Credit |
| `4185` | Health Care - Const |
| `4220` | Import Financing |
| `4255` | Improvement-Comml Property |
| `4290` | Improvement-Resid Property |
| `4325` | Industrial - Const |
| `4360` | Industrial - Perm |
| `4395` | Insider Loans |
| `4430` | Insurance |
| `4465` | Interim Financing |
| `4500` | International Trade Financing |
| `4535` | Investment |
| `4570` | Land Development Loans |
| `4605` | Leases Oil,Minl,Natl Res Prodn |
| `4640` | Leases Other |
| `4675` | Leases Vehicle |
| `4710` | Leveraged Buyout |
| `4745` | Loan On Deposits |
| `4780` | Loans To Carry Financial Derivatives |
| `4815` | Loans To Professionals Program |
| `4850` | Long Term Financing |
| `4885` | Marketable Securities |
| `4920` | Merchant Card Processing |
| `4955` | Mini Storage |
| `4990` | Mobile Home Park |
| `5025` | Mortgage Warehousing |
| `5060` | New Business Start-Up |
| `5095` | Note Purchased |
| `5130` | Office - Bldgs,Apts,Income Prop |
| `5165` | Office - Const |
| `5200` | Office - Perm |
| `5235` | Operating Expenses |
| `5270` | Overdraft |
| `5305` | Personal Accommodation Loans |
| `5340` | Personal Aircraft |
| `5375` | Personal Auto |
| `5410` | Personal Boat/Vessel |
| `5445` | Personal Expenses |
| `5480` | Personal Line Of Credit |
| `5515` | Personal Other |
| `5550` | Personal Other Investment |
| `5585` | Personal Rec Vehicle |
| `5620` | Personal Taxes |
| `5655` | Personal Term |
| `5690` | Pollution Control |
| `5725` | Precious Metals |
| `5760` | Pre-Development |
| `5795` | Pre-Sold Single Family Mortgages |
| `5830` | Purchase Agricultural Equipment |
| `5865` | Purchase And Develop Land -Comml Purpose |
| `5900` | Purchase Bonds |
| `5935` | Purchase Business |
| `5970` | Purchase Cattle Or Oth Livestk |
| `6005` | Purchase Commercial Property |
| `6040` | Purchase Corporate Airplane |
| `6075` | Purchase Corporate Vehicle |
| `6110` | Purchase Corporate Vessel |
| `6145` | Purchase Equipment - Cap Expenditures |
| `6180` | Purchase Equipment For Lease To Others |
| `6215` | Purchase Equipment For Medical, Dental, Other Prof Equ |
| `6250` | Purchase Equipment For Mining/Oil Prod/Nat Res |
| `6285` | Purchase Equipment For Sale |
| `6320` | Purchase Equipment For Use In Business |
| `6355` | Purchase Equipment Other |
| `6390` | Purchase Farm/Ranch/Other Agri Property |
| `6425` | Purchase Government Securities |
| `6460` | Purchase Industrial Property / Structure |
| `6495` | Purchase Inventory - Cap Expenditures |
| `6530` | Purchase Investment Property |
| `6565` | Purchase Land For Commercial Purpose |
| `6600` | Purchase Land For Personal Use |
| `6635` | Purchase Land Not For Development |
| `6670` | Purchase Listed Securities |
| `6705` | Purchase Medical / Care Facility |
| `6740` | Purchase Mobile Home With Land |
| `6775` | Purchase Mortgage Pool Securities |
| `6810` | Purchase Non Real Estate Assets |
| `6845` | Purchase Or Carry Hedge Funds |
| `6880` | Purchase Or Carry Securities |
| `6915` | Purchase Or Warehse Finished Goods |
| `6950` | Purchase Property Not Classified Elsewhe |
| `6985` | Purchase Raw Material |
| `7020` | Purchase Real Estate |
| `7055` | Purchase Residential Property |
| `7090` | Purchase Retail Property |
| `7125` | Purchase Securities |
| `7160` | Purchase Stock Options |
| `7195` | Purchase Treasury Stock |
| `7230` | Purchase Units Of A Partnership |
| `7265` | Real Estate Bridge Loan |
| `7300` | Real Estate Equity Line Of Credit |
| `7335` | Real Estate Market-Risk Loans |
| `7370` | Real Estate Other |
| `7405` | Recapitalization |
| `7440` | Refinance Existing Debt-No Cash Out |
| `7475` | Refinance Existing Debt-Other Bank |
| `7510` | Refinance Existing Debt-This Bank |
| `7545` | Refinance Farm/Ranch/Other Agri Property |
| `7580` | Refinance Livestock |
| `7615` | Refinance Other |
| `7650` | Refinance Real Estate  - No Cash Out |
| `7685` | Refinance Real Estate - Cash Out |
| `7720` | Refinance Real Estate Debt |
| `7755` | Repair |
| `7790` | Restaurant |
| `7825` | Seasonal Incr In Working Capital |
| `7860` | Sell Bonds |
| `7895` | Sell Government Securities |
| `7930` | Sell Loans |
| `7965` | Sell Mortgage Pool Securities |
| `8000` | Sell Securities |
| `8035` | Sell Stock Options |
| `8070` | Shoppng Cntr / Retail - Const |
| `8105` | Shoppng Cntr / Retail - Perm |
| `8140` | State Guaranteed Loans |
| `8175` | Subordinated Debt |
| `8210` | Tax Anticipation |
| `8245` | Tax Credit Loans |
| `8280` | Tenant/Leasehold Improvements |
| `8315` | Tender Draws |
| `8350` | Trade Financing |
| `8385` | Treasury Management |
| `8420` | Truck Stop/Gas/Service Station |
| `8455` | Venture Capital |
| `8490` | Warehouse Inv Const |
| `8525` | Warehouse Inv Perm |
| `8560` | Working Capital Coml/Industrial |
| `8595` | Working Capital Other |
| `9999` | Conversion Default |

### `ratingFrequency` — Rating Frequency  (10)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Daily |
| `2` | Weekly |
| `3` | Semi-monthly |
| `4` | Monthly |
| `5` | Quarterly |
| `6` | Annually |
| `7` | Maturity |
| `8` | One Time |
| `10` | Semi-annual |

### `react-select-24-input`  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `reasonCode` — Reason Code  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10` | Amount owed on accounts is too high |
| `11` | Level of delinquency on accounts |

### `recourse` — Recourse  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | 100% Recourse Relied Upon |

### `release` — Release  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `requestType` — Request Type  (4)

| code | label |
|------|-------|
| `MO` | Modification |
| `NA` | New Approval |
| `RN` | Renewal |
| `RV` | Review |

### `requestedApprover` — Requested Approver  (160)

| code | label |
|------|-------|
| `181` | AFSDD342, AFSDD342 (AFSDD342) |
| `182` | AFSDD343, AFSDD343 (AFSDD343) |
| `183` | AFSDD344, AFSDD344 (AFSDD344) |
| `184` | AFSDD345, AFSDD345 (AFSDD345) |
| `185` | AFSDD346, AFSDD346 (AFSDD346) |
| `186` | AFSDD347, AFSDD347 (AFSDD347) |
| `187` | AFSDD348, AFSDD348 (AFSDD348) |
| `188` | AFSDD349, AFSDD349 (AFSDD349) |
| `189` | AFSDD350, AFSDD350 (AFSDD350) |
| `190` | AFSDD351, AFSDD351 (AFSDD351) |
| `191` | AFSDD352, AFSDD352 (AFSDD352) |
| `192` | AFSDD353, AFSDD353 (AFSDD353) |
| `193` | AFSDD354, AFSDD354 (AFSDD354) |
| `314` | AFSDD355, AFSDD355 (AFSDD355) |
| `315` | AFSDD356, AFSDD356 (AFSDD356) |
| `317` | AFSDD357, AFSDD357 (AFSDD357) |
| `318` | AFSDD358, AFSDD358 (AFSDD358) |
| `319` | AFSDD359, AFSDD359 (AFSDD359) |
| `320` | AFSDD360, AFSDD360 (AFSDD360) |
| `321` | AFSDD361, AFSDD361 (AFSDD361) |
| `322` | AFSDD362, AFSDD362 (AFSDD362) |
| `323` | AFSDD363, AFSDD363 (AFSDD363) |
| `324` | AFSDD364, AFSDD364 (AFSDD364) |
| `325` | AFSDD365, AFSDD365 (AFSDD365) |
| `326` | AFSDD366, AFSDD366 (AFSDD366) |
| `229` | AFSDD370, AFSDD370 (AFSDD370) |
| `230` | AFSDD371, AFSDD371 (AFSDD371) |
| `246` | AFSDD372, AFSDD372 (AFSDD372) |
| `247` | AFSDD373, AFSDD373 (AFSDD373) |
| `248` | AFSDD374, AFSDD374 (AFSDD374) |
| `249` | AFSDD375, AFSDD375 (AFSDD375) |
| `250` | AFSDD376, AFSDD376 (AFSDD376) |
| `251` | AFSDD377, AFSDD377 (AFSDD377) |
| `252` | AFSDD378, AFSDD378 (AFSDD378) |
| `253` | AFSDD379, AFSDD379 (AFSDD379) |
| `254` | AFSDD380, AFSDD380 (AFSDD380) |
| `255` | AFSDD381, AFSDD381 (AFSDD381) |
| `256` | AFSDD382, AFSDD382 (AFSDD382) |
| `257` | AFSDD383, AFSDD383 (AFSDD383) |
| `258` | AFSDD384, AFSDD384 (AFSDD384) |
| `259` | AFSDD385, AFSDD385 (AFSDD385) |
| `260` | AFSDD386, AFSDD386 (AFSDD386) |
| `261` | AFSDD387, AFSDD387 (AFSDD387) |
| `262` | AFSDD388, AFSDD388 (AFSDD388) |
| `263` | AFSDD389, AFSDD389 (AFSDD389) |
| `264` | AFSDD390, AFSDD390 (AFSDD390) |
| `265` | AFSDD391, AFSDD391 (AFSDD391) |
| `266` | AFSDD392, AFSDD392 (AFSDD392) |
| `267` | AFSDD393, AFSDD393 (AFSDD393) |
| `268` | AFSDD394, AFSDD394 (AFSDD394) |
| `269` | AFSDD395, AFSDD395 (AFSDD395) |
| `270` | AFSDD396, AFSDD396 (AFSDD396) |
| `281` | AFSKP301, AFSKP301 (AFSKP301) |
| `282` | AFSKP302, AFSKP302 (AFSKP302) |
| `283` | AFSKP303, AFSKP303 (AFSKP303) |
| `284` | AFSKP304, AFSKP304 (AFSKP304) |
| `285` | AFSKP305, AFSKP305 (AFSKP305) |
| `286` | AFSKP306, AFSKP306 (AFSKP306) |
| `287` | AFSKP307, AFSKP307 (AFSKP307) |
| `288` | AFSKP308, AFSKP308 (AFSKP308) |
| `289` | AFSKP309, AFSKP309 (AFSKP309) |
| `290` | AFSKP310, AFSKP310 (AFSKP310) |
| `165` | Approver, Automation (AutoAppr) |
| `15` | Bagga, Sapna (sbagga) |
| `147` | Burkhardt, Drew (aburkhar) |
| `214` | Butryn, Bill (bbutryn) |
| `105` | Clark, Sharon (sclark) |
| `12` | Cooper, Jerry (jcooper) |
| `272` | Crescenzo, Sam (screscen) |
| `309` | Desmarais, Heather (hdesmara) |
| `209` | Doyle, Michael (mdoyle) |
| `146` | Flowers, Jason (jflowers) |
| `312` | Flynn, Jennifer (jflynn) |
| `241` | Friedman, Ben (bfriedma) |
| `308` | Gandoori, Sindhuja (sgandoor) |
| `174` | Generic, AFS DD3 Event (AFSDD335) |
| `178` | Generic, API (AFSDD339) |
| `179` | Generic, API (AFSDD340) |
| `175` | Generic, Generic (AFSDD336) |
| `176` | Generic, Generic (AFSDD337) |
| `177` | Generic, Generic (AFSDD338) |
| `180` | Generic, Generic (AFSDD341) |
| `173` | Generic Account, Generic (AFSDD334) |
| `166` | Generic Account, Test (AFSDD327) |
| `167` | Generic Account, Test (AFSDD328) |
| `168` | Generic Account, Test (AFSDD329) |
| `169` | Generic Account, Test (AFSDD330) |
| `170` | Generic Account, Test (AFSDD331) |
| `171` | Generic Account, Test (AFSDD332) |
| `172` | Generic Account, Test (AFSDD333) |
| `221` | Gupta, Leena (lgupta) |
| `90` | Horshaw, Anthony (ahorshaw) |
| `36` | ID1, AFS DD3 Event (AFSDD301) |
| `37` | ID2, AFS DD3 Event (AFSDD302) |
| `38` | ID3, AFS DD3 Event (AFSDD303) |
| `39` | ID4, AFS DD3 Event (AFSDD304) |
| `40` | ID5, AFS DD3 Event (AFSDD305) |
| `41` | ID6, AFS DD3 Event (AFSDD306) |
| `42` | ID7, AFS DD3 Event (AFSDD307) |
| `43` | ID8, AFS DD3 Event (AFSDD308) |
| `44` | ID9, AFS DD3 Event (AFSDD309) |
| `45` | ID10, AFS DD3 Event (AFSDD310) |
| `46` | ID11, AFS DD3 Event (AFSDD311) |
| `47` | ID12, AFS DD3 Event (AFSDD312) |
| `48` | ID13, AFS DD3 Event (AFSDD313) |
| `49` | ID14, AFS DD3 Event (AFSDD314) |
| `50` | ID15, AFS DD3 Event (AFSDD315) |
| `93` | ID16, AFS DD3 Event (AFSDD316) |
| `94` | ID17, AFS DD3 Event (AFSDD317) |
| `95` | ID18, AFS DD3 Event (AFSDD318) |
| `96` | ID19, AFS DD3 Event (AFSDD319) |
| `97` | ID20, AFS DD3 Event (AFSDD320) |
| `98` | ID21, AFS DD3 Event (AFSDD321) |
| `99` | ID22, AFS DD3 Event (AFSDD322) |
| `100` | ID23, AFS DD3 Event (AFSDD323) |
| `101` | ID24, AFS DD3 Event (AFSDD324) |
| `102` | ID25, AFS DD3 Event (AFSDD325) |
| `310` | Jakkam, Srinivasa (sjakkam) |
| `298` | Jellapuram, Kushsmitha (kjellapu) |
| `23` | Jones, Rasul (rjones) |
| `302` | Kale, Sangeetha (skale) |
| `311` | Kaminski, Chris (ckaminsk) |
| `280` | Kinder, Ryan (rkinder) |
| `91` | Kohlbrenner, Michael (mkohlbre) |
| `295` | Kothala, Chinmayi (ckothala) |
| `89` | Kull, Michael (mkull) |
| `22` | McCarry, Scott (smccarry) |
| `148` | McCormick, Rich (rmccormi) |
| `103` | McGuire, Chris (cmcguire) |
| `4` | Minder, Carmina (cminder) |
| `303` | Moyer, Alyssa (amoyer) |
| `316` | Murray, Jean (jmurray) |
| `273` | Nowaki, Adrienne (ANOWAKI) |
| `226` | Oakes, Ed (eoakes) |
| `304` | Obenski, Bob (robenski) |
| `24` | Oddo, Jennifer (joddo) |
| `116` | Parham, Jill (jparham) |
| `54` | Pasquella, Gus (dpasquel) |
| `163` | Potti, Roja (rpotti) |
| `194` | Raj, Porkodi (praj) |
| `27` | Richey, Kendrick (krichey) |
| `220` | Rivera, Alex (arivera) |
| `210` | Roth, Andrew (aroth) |
| `104` | Saracino, Carolyn (csaracin) |
| `208` | Sathyavan, Binoy (bsathyav) |
| `271` | Schassberger, Cathy (cschassb) |
| `297` | Shaik, Jeelani (jshaik) |
| `106` | Smith, Mona (msmith) |
| `294` | Snyder, Dean (dsnyder) |
| `109` | Testing, Automated (AutoUser) |
| `212` | Turner, Ray (rturner) |
| `217` | Varghese, Jancy (jvarghes) |
| `291` | Viars, Tyler (tviars) |
| `87` | Walker, Matthew (mwalker) |
| `57` | Wambua, Charles (cwambua) |
| `20` | Ward, Brian (bward) |
| `29` | Web ServicesID, Web ServicesID (afsd3ws) |
| `279` | Wentzel, Austin (awentzel) |
| `19` | Wise, Derrick (dwise) |
| `157` | Young, Scott (syoung) |

### `revolvingType` — Revolve/Non-Revolve  (2)

| code | label |
|------|-------|
| `N` | Non-Revolving |
| `R` | Revolving |

### `safeKeepingCode` — Safekeeping Code  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

### `sbaProgram` — SBA  (2)

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `searchType` — Search By  (2)

| code | label |
|------|-------|
| `1` | Indirect Liabilities |
| `2` | Indirect Supports |

### `securedCode` — Secured Code  (5)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Unsecured |
| `2` | Secured (with margining) |
| `3` | Partially or Over Secured |
| `4` | Secured (no margining) |

### `serviceUnit` — Service Unit  (7)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `15` | *Loan Services - CLCS |
| `1000` | *Commercial Loan Services |
| `2000` | *Specialty Assets Group |
| `5000` | *Automation SU |
| `9800` | *Inbound Interfaces |
| `9900` | *System Generated Transactions |

### `sicCode` — SIC Code  (500)

| code | label |
|------|-------|
| `0` | NOT ENTERED |
| `111` | WHEAT |
| `112` | RICE |
| `115` | CORN |
| `116` | SOYBEANS |
| `119` | CASH GRAINS, NOT ELSEWHERE CLASSIFIED |
| `131` | COTTON |
| `132` | TOBACCO |
| `133` | SUGARCANE AND SUGAR BEETS |
| `134` | IRISH POTATOES |
| `139` | FIELD CROPS, EXCEPT CASH GRAINS, NOT ELSEWHERE CLASSIFIED |
| `161` | VEGETABLES AND MELONS |
| `171` | BERRY CROPS |
| `172` | GRAPES |
| `173` | TREE NUTS |
| `174` | CITRUS FRUITS |
| `175` | DECIDUOUS TREE FRUITS |
| `179` | FRUITS AND TREE NUTS, NOT ELSEWHERE CLASSIFIED |
| `181` | ORNAMENTAL FLORICULTURE AND NURSERY PRODUCTS |
| `182` | FOOD CROPS GROWN UNDER COVER |
| `191` | GENERAL FARMS, PRIMARILY CROP |
| `211` | BEEF CATTLE FEEDLOTS |
| `212` | BEEF CATTLE, EXCEPT FEEDLOTS |
| `213` | HOGS |
| `214` | SHEEP AND GOATS |
| `219` | GENERAL LIVESTOCK, EXCEPT DAIRY AND POULTRY |
| `241` | DAIRY FARMS |
| `251` | BROILER, FRYER, AND ROASTER CHICKENS |
| `252` | CHICKEN EGGS |
| `253` | TURKEYS AND TURKEY EGGS |
| `254` | POULTRY HATCHERIES |
| `259` | POULTRY AND EGGS, NOT ELSEWHERE CLASSIFIED |
| `271` | FUR-BEARING ANIMALS AND RABBITS |
| `272` | HORSES AND OTHER EQUINES |
| `273` | ANIMAL AQUACULTURE |
| `279` | ANIMAL SPECIALTIES, NOT ELSEWHERE CLASSIFIED |
| `291` | GENERAL FARMS, PRIMARILY LIVESTOCK AND ANIMAL SPECIALTIES |
| `711` | SOIL PREPARATION SERVICES |
| `721` | CROP PLANTING, CULTIVATING, AND PROTECTING |
| `722` | CROP HARVESTING, PRIMARILY BY MACHINE |
| `723` | CROP PREPARATION SERVICES FOR MARKET, EXCEPT COTTON GINNING |
| `724` | COTTON GINNING |
| `741` | VETERINARY SERVICES FOR LIVESTOCK |
| `742` | VETERINARY SERVICES FOR ANIMAL SPECIALTIES |
| `751` | LIVESTOCK SERVICES, EXCEPT VETERINARY |
| `752` | ANIMAL SPECIALTY SERVICES, EXCEPT VETERINARY |
| `761` | FARM LABOR CONTRACTORS AND CREW LEADERS |
| `762` | FARM MANAGEMENT SERVICES |
| `781` | LANDSCAPE COUNSELING AND PLANNING |
| `782` | LAWN AND GARDEN SERVICES |
| `783` | ORNAMENTAL SHRUB AND TREE SERVICES |
| `811` | TIMBER TRACTS |
| `831` | FOREST NURSERIES AND GATHERING OF FOREST PRODUCTS |
| `851` | FORESTRY SERVICES |
| `912` | FINFISH |
| `913` | SHELLFISH |
| `919` | MISCELLANEOUS MARINE PRODUCTS |
| `921` | FISH HATCHERIES AND PRESERVES |
| `971` | HUNTING AND TRAPPING, AND GAME PROPAGATION |
| `1011` | IRON ORES |
| `1021` | COPPER ORES |
| `1031` | LEAD AND ZINC ORES |
| `1041` | GOLD ORES |
| `1044` | SILVER ORES |
| `1061` | FERROALLOY ORES, EXCEPT VANADIUM |
| `1081` | METAL MINING SERVICES |
| `1094` | URANIUM-RADIUM-VANADIUM ORES |
| `1099` | MISCELLANEOUS METAL ORES, NOT ELSEWHERE CLASSIFIED |
| `1221` | BITUMINOUS COAL AND LIGNITE SURFACE MINING |
| `1222` | BITUMINOUS COAL UNDERGROUND MINING |
| `1231` | ANTHRACITE MINING |
| `1241` | COAL MINING SERVICES |
| `1311` | CRUDE PETROLEUM AND NATURAL GAS |
| `1321` | NATURAL GAS LIQUIDS |
| `1381` | DRILLING OIL AND GAS WELLS |
| `1382` | OIL AND GAS FIELD EXPLORATION SERVICES |
| `1389` | OIL AND GAS FIELD SERVICES, NOT ELSEWHERE CLASSIFIED |
| `1411` | DIMENSION STONE |
| `1422` | CRUSHED AND BROKEN LIMESTONE |
| `1423` | CRUSHED AND BROKEN GRANITE |
| `1429` | CRUSHED AND BROKEN STONE, NOT ELSEWHERE CLASSIFIED |
| `1442` | CONSTRUCTION SAND AND GRAVEL |
| `1446` | INDUSTRIAL SAND |
| `1455` | KAOLIN AND BALL CLAY |
| `1459` | CLAY, CERAMIC, AND REFRACTORY MINERALS, NOT ELSEWHERE CLASSIFIED |
| `1474` | POTASH, SODA, AND BORATE MINERALS |
| `1475` | PHOSPHATE ROCK |
| `1479` | CHEMICAL AND FERTILIZER MINERAL MINING, NOT ELSEWHERE CLASSIFIED |
| `1481` | NONMETALLIC MINERALS SERVICES, EXCEPT FUELS |
| `1499` | MISCELLANEOUS NONMETALLIC MINERALS, EXCEPT FUELS |
| `1521` | GENERAL CONTRACTORS-SINGLE-FAMILY HOUSES |
| `1522` | GENERAL CONTRACTORS-RESIDENTIAL BUILDINGS, OTHER THAN SINGLE-FAMI |
| `1531` | OPERATIVE BUILDERS |
| `1541` | GENERAL CONTRACTORS-INDUSTRIAL BUILDINGS AND WAREHOUSES |
| `1542` | GENERAL CONTRACTORS-NONRESIDENTIAL BUILDINGS, OTHER THAN INDUSTRI |
| `1611` | HIGHWAY AND STREET CONSTRUCTION, EXCEPT ELEVATED HIGHWAYS |
| `1622` | BRIDGE, TUNNEL, AND ELEVATED HIGHWAY CONSTRUCTION |
| `1623` | WATER, SEWER, PIPELINE, AND COMMUNICATIONS AND POWER LINE CONSTRU |
| `1629` | HEAVY CONSTRUCTION, NOT ELSEWHERE CLASSIFIED |
| `1711` | PLUMBING, HEATING AND AIR-CONDITIONING |
| `1721` | PAINTING AND PAPER HANGING |
| `1731` | ELECTRICAL WORK |
| `1741` | MASONRY, STONE SETTING, AND OTHER STONE WORK |
| `1742` | PLASTERING, DRYWALL, ACOUSTICAL, AND INSULATION WORK |
| `1743` | TERRAZZO, TILE, MARBLE, AND MOSAIC WORK |
| `1751` | CARPENTRY WORK |
| `1752` | FLOOR LAYING AND OTHER FLOOR WORK, NOT ELSEWHERE CLASSIFIED |
| `1761` | ROOFING, SIDING, AND SHEET METAL WORK |
| `1771` | CONCRETE WORK |
| `1781` | WATER WELL DRILLING |
| `1791` | STRUCTURAL STEEL ERECTION |
| `1793` | GLASS INSTALLATION, EXCEPT AUTOMOTIVE-CONTRACTORS |
| `1794` | EXCAVATION WORK |
| `1795` | WRECKING AND DEMOLITION WORK |
| `1796` | INSTALLATION OR ERECTION OF BUILDING EQUIPMENT, NOT ELSEWHERE CLA |
| `1799` | SPECIAL TRADE CONTRACTORS, NOT ELSEWHERE CLASSIFIED |
| `2011` | MEAT PACKING PLANTS |
| `2013` | SAUSAGES AND OTHER PREPARED MEAT PRODUCTS |
| `2015` | POULTRY SLAUGHTERING AND PROCESSING |
| `2021` | CREAMERY BUTTER |
| `2022` | NATURAL, PROCESSED, AND IMITATION CHEESE |
| `2023` | DRY, CONDENSED, AND EVAPORATED DAIRY PRODUCTS |
| `2024` | ICE CREAM AND FROZEN DESSERTS |
| `2026` | FLUID MILK |
| `2032` | CANNED SPECIALTIES |
| `2033` | CANNED FRUITS, VEGETABLES, PRESERVES, JAMS, AND JELLIES |
| `2034` | DRIED AND DEHYDRATED FRUITS, VEGETABLES, AND SOUP MIXES |
| `2035` | PICKLED FRUITS AND VEGETABLES, VEGETABLE SAUCES AND SEASONINGS, A |
| `2037` | FROZEN FRUITS, FRUIT JUICES, AND VEGETABLES |
| `2038` | FROZEN SPECIALTIES, NOT ELSEWHERE CLASSIFIED |
| `2041` | FLOUR AND OTHER GRAIN MILL PRODUCTS |
| `2043` | CEREAL BREAKFAST FOODS |
| `2044` | RICE MILLING |
| `2045` | PREPARED FLOUR MIXES AND DOUGHS |
| `2046` | WET CORN MILLING |
| `2047` | DOG AND CAT FOOD |
| `2048` | PREPARED FEEDS AND FEED INGREDIENTS FOR ANIMALS AND FOWLS, EXCEPT |
| `2051` | BREAD AND OTHER BAKERY PRODUCTS, EXCEPT COOKIES AND CRACKERS |
| `2052` | COOKIES AND CRACKERS |
| `2053` | FROZEN BAKERY PRODUCTS, EXCEPT BREAD |
| `2061` | CANE SUGAR, EXCEPT REFINING |
| `2062` | CANE SUGAR REFINING |
| `2063` | BEET SUGAR |
| `2064` | CANDY AND OTHER CONFECTIONERY PRODUCTS |
| `2066` | CHOCOLATE AND COCOA PRODUCTS |
| `2067` | CHEWING GUM |
| `2068` | SALTED AND ROASTED NUTS AND SEEDS |
| `2074` | COTTONSEED OIL MILLS |
| `2075` | SOYBEAN OIL MILLS |
| `2076` | VEGETABLE OIL MILLS, EXCEPT CORN, COTTONSEED, AND SOYBEAN |
| `2077` | ANIMAL AND MARINE FATS AND OILS |
| `2079` | SHORTENING, TABLE OILS, MARGARINE, AND OTHER EDIBLE FATS AND OILS |
| `2082` | MALT BEVERAGES |
| `2083` | MALT |
| `2084` | WINES, BRANDY, AND BRANDY SPIRITS |
| `2085` | DISTILLED AND BLENDED LIQUORS |
| `2086` | BOTTLED AND CANNED SOFT DRINKS AND CARBONATED WATERS |
| `2087` | FLAVORING EXTRACTS AND FLAVORING SYRUPS, NOT ELSEWHERE CLASSIFIED |
| `2091` | CANNED AND CURED FISH AND SEAFOODS |
| `2092` | PREPARED FRESH OR FROZEN FISH AND SEAFOODS |
| `2095` | ROASTED COFFEE |
| `2096` | POTATO CHIPS, CORN CHIPS, AND SIMILAR SNACKS |
| `2097` | MANUFACTURED ICE |
| `2098` | MACARONI, SPAGHETTI, VERMICELLI, AND NOODLES |
| `2099` | FOOD PREPARATIONS, NOT ELSEWHERE CLASSIFIED |
| `2111` | CIGARETTES |
| `2121` | CIGARS |
| `2131` | CHEWING AND SMOKING TOBACCO AND SNUFF |
| `2141` | TOBACCO STEMMING AND REDRYING |
| `2211` | BROADWOVEN FABRIC MILLS, COTTON |
| `2221` | BROADWOVEN FABRIC MILLS, MANMADE FIBER AND SILK |
| `2231` | BROADWOVEN FABRIC MILLS, WOOL (INCLUDING DYEING AND FINISHING) |
| `2241` | NARROW FABRIC AND OTHER SMALLWARES MILLS: COTTON, WOOL, SILK, AND |
| `2251` | WOMEN'S FULL-LENGTH AND KNEE-LENGTH HOSIERY, EXCEPT SOCKS |
| `2252` | HOSIERY, NOT ELSEWHERE CLASSIFIED |
| `2253` | KNIT OUTERWEAR MILLS |
| `2254` | KNIT UNDERWEAR AND NIGHTWEAR MILLS |
| `2257` | WEFT KNIT FABRIC MILLS |
| `2258` | LACE AND WARP KNIT FABRIC MILLS |
| `2259` | KNITTING MILLS, NOT ELSEWHERE CLASSIFIED |
| `2261` | FINISHERS OF BROADWOVEN FABRICS OF COTTON |
| `2262` | FINISHERS OF BROADWOVEN FABRICS OF MANMADE FIBER AND SILK |
| `2269` | FINISHERS OF TEXTILES, NOT ELSEWHERE CLASSIFIED |
| `2273` | CARPETS AND RUGS |
| `2281` | YARN SPINNING MILLS |
| `2282` | YARN TEXTURIZING, THROWING, TWISTING, AND WINDING MILLS |
| `2284` | THREAD MILLS |
| `2295` | COATED FABRICS, NOT RUBBERIZED |
| `2296` | TIRE CORD AND FABRICS |
| `2297` | NONWOVEN FABRICS |
| `2298` | CORDAGE AND TWINE |
| `2299` | TEXTILE GOODS, NOT ELSEWHERE CLASSIFIED |
| `2311` | MEN'S AND BOYS' SUITS, COATS, AND OVERCOATS |
| `2321` | MEN'S AND BOYS' SHIRTS, EXCEPT WORK SHIRTS |
| `2322` | MEN'S AND BOYS' UNDERWEAR AND NIGHTWEAR |
| `2323` | MEN'S AND BOYS' NECKWEAR |
| `2325` | MEN'S AND BOYS' SEPARATE TROUSERS AND SLACKS |
| `2326` | MEN'S AND BOYS' WORK CLOTHING |
| `2329` | MEN'S AND BOYS' CLOTHING, NOT ELSEWHERE CLASSIFIED |
| `2331` | WOMEN'S, MISSES', AND JUNIORS' BLOUSES AND SHIRTS |
| `2335` | WOMEN'S, MISSES', AND JUNIORS' DRESSES |
| `2337` | WOMEN'S, MISSES', AND JUNIORS' SUITS, SKIRTS, AND COATS |
| `2339` | WOMEN'S, MISSES', AND JUNIORS' OUTERWEAR, NOT ELSEWHERE CLASSIFIED |
| `2341` | WOMEN'S, MISSES', CHILDREN'S, AND INFANTS' UNDERWEAR AND NIGHTWEAR |
| `2342` | BRASSIERES, GIRDLES, AND ALLIED GARMENTS |
| `2353` | HATS, CAPS, AND MILLINERY |
| `2361` | GIRLS', CHILDREN'S, AND INFANTS' DRESSES, BLOUSES, AND SHIRTS |
| `2369` | GIRLS', CHILDREN'S, AND INFANTS' OUTERWEAR, NOT ELSEWHERE CLASSIFIED |
| `2371` | FUR GOODS |
| `2381` | DRESS AND WORK GLOVES, EXCEPT KNIT AND ALL-LEATHER |
| `2384` | ROBES AND DRESSING GOWNS |
| `2385` | WATERPROOF OUTERWEAR |
| `2386` | LEATHER AND SHEEP-LINED CLOTHING |
| `2387` | APPAREL BELTS |
| `2389` | APPAREL AND ACCESSORIES, NOT ELSEWHERE CLASSIFIED |
| `2391` | CURTAINS AND DRAPERIES |
| `2392` | HOUSEFURNISHINGS, EXCEPT CURTAINS AND DRAPERIES |
| `2393` | TEXTILE BAGS |
| `2394` | CANVAS AND RELATED PRODUCTS |
| `2395` | PLEATING, DECORATIVE AND NOVELTY STITCHING, AND TUCKING FOR THE T |
| `2396` | AUTOMOTIVE TRIMMINGS, APPAREL FINDINGS, AND RELATED PRODUCTS |
| `2397` | SCHIFFLI MACHINE EMBROIDERIES |
| `2399` | FABRICATED TEXTILE PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `2411` | LOGGING |
| `2421` | SAWMILLS AND PLANING MILLS, GENERAL |
| `2426` | HARDWOOD DIMENSION AND FLOORING MILLS |
| `2429` | SPECIAL PRODUCT SAWMILLS, NOT ELSEWHERE CLASSIFIED |
| `2431` | MILLWORK |
| `2434` | WOOD KITCHEN CABINETS |
| `2435` | HARDWOOD VENEER AND PLYWOOD |
| `2436` | SOFTWOOD VENEER AND PLYWOOD |
| `2439` | STRUCTURAL WOOD MEMBERS, NOT ELSEWHERE CLASSIFIED |
| `2441` | NAILED AND LOCK CORNER WOOD BOXES AND SHOOK |
| `2448` | WOOD PALLETS AND SKIDS |
| `2449` | WOOD CONTAINERS, NOT ELSEWHERE CLASSIFIED |
| `2451` | MOBILE HOMES |
| `2452` | PREFABRICATED WOOD BUILDINGS AND COMPONENTS |
| `2491` | WOOD PRESERVING |
| `2493` | RECONSTITUTED WOOD PRODUCTS |
| `2499` | WOOD PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `2511` | WOOD HOUSEHOLD FURNITURE, EXCEPT UPHOLSTERED |
| `2512` | WOOD HOUSEHOLD FURNITURE, UPHOLSTERED |
| `2514` | METAL HOUSEHOLD FURNITURE |
| `2515` | MATTRESSES, FOUNDATIONS, AND CONVERTIBLE BEDS |
| `2517` | WOOD TELEVISION, RADIO, PHONOGRAPH, AND SEWING MACHINE CABINETS |
| `2519` | HOUSEHOLD FURNITURE, NOT ELSEWHERE CLASSIFIED |
| `2521` | WOOD OFFICE FURNITURE |
| `2522` | OFFICE FURNITURE, EXCEPT WOOD |
| `2531` | PUBLIC BUILDING AND RELATED FURNITURE |
| `2541` | WOOD OFFICE AND STORE FIXTURES, PARTITIONS, SHELVING, AND LOCKERS |
| `2542` | OFFICE AND STORE FIXTURES, PARTITIONS, SHELVING, AND LOCKERS, EXC |
| `2591` | DRAPERY HARDWARE AND WINDOW BLINDS AND SHADES |
| `2599` | FURNITURE AND FIXTURES, NOT ELSEWHERE CLASSIFIED |
| `2611` | PULP MILLS |
| `2621` | PAPER MILLS |
| `2631` | PAPERBOARD MILLS |
| `2652` | SETUP PAPERBOARD BOXES |
| `2653` | CORRUGATED AND SOLID FIBER BOXES |
| `2655` | FIBER CANS, TUBES, DRUMS, AND SIMILAR PRODUCTS |
| `2656` | SANITARY FOOD CONTAINERS, EXCEPT FOLDING |
| `2657` | FOLDING PAPERBOARD BOXES, INCLUDING SANITARY |
| `2671` | PACKAGING PAPER AND PLASTICS FILM, COATED AND LAMINATED |
| `2672` | COATED AND LAMINATED PAPER, NOT ELSEWHERE CLASSIFIED |
| `2673` | PLASTICS, FOIL, AND COATED PAPER BAGS |
| `2674` | UNCOATED PAPER AND MULTIWALL BAGS |
| `2675` | DIE-CUT PAPER AND PAPERBOARD AND CARDBOARD |
| `2676` | SANITARY PAPER PRODUCTS |
| `2677` | ENVELOPES |
| `2678` | STATIONERY, TABLETS, AND RELATED PRODUCTS |
| `2679` | CONVERTED PAPER AND PAPERBOARD PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `2711` | NEWSPAPERS: PUBLISHING, OR PUBLISHING AND PRINTING |
| `2721` | PERIODICALS: PUBLISHING, OR PUBLISHING AND PRINTING |
| `2731` | BOOKS: PUBLISHING, OR PUBLISHING AND PRINTING |
| `2732` | BOOK PRINTING |
| `2741` | MISCELLANEOUS PUBLISHING |
| `2752` | COMMERCIAL PRINTING, LITHOGRAPHIC |
| `2754` | COMMERCIAL PRINTING, GRAVURE |
| `2759` | COMMERCIAL PRINTING, NOT ELSEWHERE CLASSIFIED |
| `2761` | MANIFOLD BUSINESS FORMS |
| `2771` | GREETING CARDS |
| `2782` | BLANKBOOKS, LOOSELEAF BINDERS AND DEVICES |
| `2789` | BOOKBINDING AND RELATED WORK |
| `2791` | TYPESETTING |
| `2796` | PLATEMAKING AND RELATED SERVICES |
| `2812` | ALKALIES AND CHLORINE |
| `2813` | INDUSTRIAL GASES |
| `2816` | INORGANIC PIGMENTS |
| `2819` | INDUSTRIAL INORGANIC CHEMICALS, NOT ELSEWHERE CLASSIFIED |
| `2821` | PLASTICS MATERIALS, SYNTHETIC RESINS, AND NONVULCANIZABLE ELASTOM |
| `2822` | SYNTHETIC RUBBER (VULCANIZABLE ELASTOMERS) |
| `2823` | CELLULOSIC MANMADE FIBERS |
| `2824` | MANMADE ORGANIC FIBERS, EXCEPT CELLULOSIC |
| `2833` | MEDICINAL CHEMICALS AND BOTANICAL PRODUCTS |
| `2834` | PHARMACEUTICAL PREPARATIONS |
| `2835` | IN VITRO AND IN VIVO DIAGNOSTIC SUBSTANCES |
| `2836` | BIOLOGICAL PRODUCTS, EXCEPT DIAGNOSTIC SUBSTANCES |
| `2841` | SOAP AND OTHER DETERGENTS, EXCEPT SPECIALTY CLEANERS |
| `2842` | SPECIALTY CLEANING, POLISHING, AND SANITATION PREPARATIONS |
| `2843` | SURFACE ACTIVE AGENTS, FINISHING AGENTS, SULFONATED OILS |
| `2844` | PERFUMES, COSMETICS, AND OTHER TOILET PREPARATIONS |
| `2851` | PAINTS, VARNISHES, LACQUERS, ENAMELS, AND ALLIED PRODUCTS |
| `2861` | GUM AND WOOD CHEMICALS |
| `2865` | CYCLIC ORGANIC CRUDES AND INTERMEDIATES, AND ORGANIC DYES |
| `2869` | INDUSTRIAL ORGANIC CHEMICALS, NOT ELSEWHERE CLASSIFIED |
| `2873` | NITROGENOUS FERTILIZERS |
| `2874` | PHOSPHATIC FERTILIZERS |
| `2875` | FERTILIZERS, MIXING ONLY |
| `2879` | PESTICIDES AND AGRICULTURAL CHEMICALS, NOT ELSEWHERE CLASSIFIED |
| `2891` | ADHESIVES AND SEALANTS |
| `2892` | EXPLOSIVES |
| `2893` | PRINTING INK |
| `2895` | CARBON BLACK |
| `2899` | CHEMICALS AND CHEMICAL PREPARATIONS, NOT ELSEWHERE CLASSIFIED |
| `2911` | PETROLEUM REFINING |
| `2951` | ASPHALT PAVING MIXTURES AND BLOCKS |
| `2952` | ASPHALT FELTS AND COATINGS |
| `2992` | LUBRICATING OILS AND GREASES |
| `2999` | PRODUCTS OF PETROLEUM AND COAL, NOT ELSEWHERE CLASSIFIED |
| `3011` | TIRES AND INNER TUBES |
| `3021` | RUBBER AND PLASTICS FOOTWEAR |
| `3052` | RUBBER AND PLASTICS HOSE AND BELTING |
| `3053` | GASKETS, PACKING, AND SEALING DEVICES |
| `3061` | MOLDED, EXTRUDED, AND LATHE-CUT MECHANICAL RUBBER GOODS |
| `3069` | FABRICATED RUBBER PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3081` | UNSUPPORTED PLASTICS FILM AND SHEET |
| `3082` | UNSUPPORTED PLASTICS PROFILE SHAPES |
| `3083` | LAMINATED PLASTICS PLATE, SHEET, AND PROFILE SHAPES |
| `3084` | PLASTICS PIPE |
| `3085` | PLASTICS BOTTLES |
| `3086` | PLASTICS FOAM PRODUCTS |
| `3087` | CUSTOM COMPOUNDING OF PURCHASED PLASTICS RESINS |
| `3088` | PLASTICS PLUMBING FIXTURES |
| `3089` | PLASTICS PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3111` | LEATHER TANNING AND FINISHING |
| `3131` | BOOT AND SHOE CUT STOCK AND FINDINGS |
| `3142` | HOUSE SLIPPERS |
| `3143` | MEN'S FOOTWEAR, EXCEPT ATHLETIC |
| `3144` | WOMEN'S FOOTWEAR, EXCEPT ATHLETIC |
| `3149` | FOOTWEAR, EXCEPT RUBBER, NOT ELSEWHERE CLASSIFIED |
| `3151` | LEATHER GLOVES AND MITTENS |
| `3161` | LUGGAGE |
| `3171` | WOMEN'S HANDBAGS AND PURSES |
| `3172` | PERSONAL LEATHER GOODS, EXCEPT WOMEN'S HANDBAGS AND PURSES |
| `3199` | LEATHER GOODS, NOT ELSEWHERE CLASSIFIED |
| `3211` | FLAT GLASS |
| `3221` | GLASS CONTAINERS |
| `3229` | PRESSED AND BLOWN GLASS AND GLASSWARE, NOT ELSEWHERE CLASSIFIED |
| `3231` | GLASS PRODUCTS, MADE OF PURCHASED GLASS |
| `3241` | CEMENT, HYDRAULIC |
| `3251` | BRICK AND STRUCTURAL CLAY TILE |
| `3253` | CERAMIC WALL AND FLOOR TILE |
| `3255` | CLAY REFRACTORIES |
| `3259` | STRUCTURAL CLAY PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3261` | VITREOUS CHINA PLUMBING FIXTURES AND CHINA AND EARTHENWARE FITTING |
| `3262` | VITREOUS CHINA TABLE AND KITCHEN ARTICLES |
| `3263` | FINE EARTHENWARE (WHITEWARE) TABLE AND KITCHEN ARTICLES |
| `3264` | PORCELAIN ELECTRICAL SUPPLIES |
| `3269` | POTTERY PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3271` | CONCRETE BLOCK AND BRICK |
| `3272` | CONCRETE PRODUCTS, EXCEPT BLOCK AND BRICK |
| `3273` | READY-MIXED CONCRETE |
| `3274` | LIME |
| `3275` | GYPSUM PRODUCTS |
| `3281` | CUT STONE AND STONE PRODUCTS |
| `3291` | ABRASIVE PRODUCTS |
| `3292` | ASBESTOS PRODUCTS |
| `3295` | MINERALS AND EARTHS, GROUND OR OTHERWISE TREATED |
| `3296` | MINERAL WOOL |
| `3297` | NONCLAY REFRACTORIES |
| `3299` | NONMETALLIC MINERAL PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3312` | STEEL WORKS, BLAST FURNACES (INCLUDING COKE OVENS), AND ROLLING MILLS |
| `3313` | ELECTROMETALLURGICAL PRODUCTS, EXCEPT STEEL |
| `3315` | STEEL WIREDRAWING AND STEEL NAILS AND SPIKES |
| `3316` | COLD-ROLLED STEEL SHEET, STRIP, AND BARS |
| `3317` | STEEL PIPE AND TUBES |
| `3321` | GRAY AND DUCTILE IRON FOUNDRIES |
| `3322` | MALLEABLE IRON FOUNDRIES |
| `3324` | STEEL INVESTMENT FOUNDRIES |
| `3325` | STEEL FOUNDRIES, NOT ELSEWHERE CLASSIFIED |
| `3331` | PRIMARY SMELTING AND REFINING OF COPPER |
| `3334` | PRIMARY PRODUCTION OF ALUMINUM |
| `3339` | PRIMARY SMELTING AND REFINING OF NONFERROUS METALS, EXCEPT COPPER |
| `3341` | SECONDARY SMELTING AND REFINING OF NONFERROUS METALS |
| `3351` | ROLLING, DRAWING, AND EXTRUDING OF COPPER |
| `3353` | ALUMINUM SHEET, PLATE, AND FOIL |
| `3354` | ALUMINUM EXTRUDED PRODUCTS |
| `3355` | ALUMINUM ROLLING AND DRAWING, NOT ELSEWHERE CLASSIFIED |
| `3356` | ROLLING, DRAWING, AND EXTRUDING OF NONFERROUS METALS, EXCEPT COPPER |
| `3357` | DRAWING AND INSULATING OF NONFERROUS WIRE |
| `3363` | ALUMINUM DIE-CASTINGS |
| `3364` | NONFERROUS DIE-CASTINGS, EXCEPT ALUMINUM |
| `3365` | ALUMINUM FOUNDRIES |
| `3366` | COPPER FOUNDRIES |
| `3369` | NONFERROUS FOUNDRIES, EXCEPT ALUMINUM AND COPPER |
| `3398` | METAL HEAT TREATING |
| `3399` | PRIMARY METAL PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3411` | METAL CANS |
| `3412` | METAL SHIPPING BARRELS, DRUMS, KEGS, AND PAILS |
| `3421` | CUTLERY |
| `3423` | HAND AND EDGE TOOLS, EXCEPT MACHINE TOOLS AND HANDSAWS |
| `3425` | SAW BLADES AND HANDSAWS |
| `3429` | HARDWARE, NOT ELSEWHERE CLASSIFIED |
| `3431` | ENAMELED IRON AND METAL SANITARY WARE |
| `3432` | PLUMBING FIXTURE FITTINGS AND TRIM |
| `3433` | HEATING EQUIPMENT, EXCEPT ELECTRIC AND WARM AIR FURNACES |
| `3441` | FABRICATED STRUCTURAL METAL |
| `3442` | METAL DOORS, SASH, FRAMES, MOLDING, AND TRIM |
| `3443` | FABRICATED PLATE WORK (BOILER SHOPS) |
| `3444` | SHEET METALWORK |
| `3446` | ARCHITECTURAL AND ORNAMENTAL METALWORK |
| `3448` | PREFABRICATED METAL BUILDINGS AND COMPONENTS |
| `3449` | MISCELLANEOUS STRUCTURAL METALWORK |
| `3451` | SCREW MACHINE PRODUCTS |
| `3452` | BOLTS, NUTS, SCREWS, RIVETS, AND WASHERS |
| `3462` | IRON AND STEEL FORGINGS |
| `3463` | NONFERROUS FORGINGS |
| `3465` | AUTOMOTIVE STAMPINGS |
| `3466` | CROWNS AND CLOSURES |
| `3469` | METAL STAMPINGS, NOT ELSEWHERE CLASSIFIED |
| `3471` | ELECTROPLATING, PLATING, POLISHING, ANODIZING, AND COLORING |
| `3479` | COATING, ENGRAVING, AND ALLIED SERVICES, NOT ELSEWHERE CLASSIFIED |
| `3482` | SMALL ARMS AMMUNITION |
| `3483` | AMMUNITION, EXCEPT FOR SMALL ARMS |
| `3484` | SMALL ARMS |
| `3489` | ORDNANCE AND ACCESSORIES, NOT ELSEWHERE CLASSIFIED |
| `3491` | INDUSTRIAL VALVES |
| `3492` | FLUID POWER VALVES AND HOSE FITTINGS |
| `3493` | STEEL SPRINGS, EXCEPT WIRE |
| `3494` | VALVES AND PIPE FITTINGS, NOT ELSEWHERE CLASSIFIED |
| `3495` | WIRE SPRINGS |
| `3496` | MISCELLANEOUS FABRICATED WIRE PRODUCTS |
| `3497` | METAL FOIL AND LEAF |
| `3498` | FABRICATED PIPE AND PIPE FITTINGS |
| `3499` | FABRICATED METAL PRODUCTS, NOT ELSEWHERE CLASSIFIED |
| `3511` | STEAM, GAS, AND HYDRAULIC TURBINES, AND TURBINE GENERATOR SET UNI |
| `3519` | INTERNAL COMBUSTION ENGINES, NOT ELSEWHERE CLASSIFIED |
| `3523` | FARM MACHINERY AND EQUIPMENT |
| `3524` | LAWN AND GARDEN TRACTORS AND HOME LAWN AND GARDEN EQUIPMENT |
| `3531` | CONSTRUCTION MACHINERY AND EQUIPMENT |
| `3532` | MINING MACHINERY AND EQUIPMENT, EXCEPT OIL AND GAS FIELD MACHINERY |
| `3533` | OIL AND GAS FIELD MACHINERY AND EQUIPMENT |
| `3534` | ELEVATORS AND MOVING STAIRWAYS |
| `3535` | CONVEYORS AND CONVEYING EQUIPMENT |
| `3536` | OVERHEAD TRAVELING CRANES, HOISTS, AND MONORAIL SYSTEMS |
| `3537` | INDUSTRIAL TRUCKS, TRACTORS, TRAILERS, AND STACKERS |
| `3541` | MACHINE TOOLS, METAL CUTTING TYPES |
| `3542` | MACHINE TOOLS, METAL FORMING TYPES |
| `3543` | INDUSTRIAL PATTERNS |
| `3544` | SPECIAL DIES AND TOOLS, DIE SETS, JIGS AND FIXTURES, AND INDUSTRIES |
| `3545` | CUTTING TOOLS, MACHINE TOOL ACCESSORIES, AND MACHINISTS' PRECISION |
| `3546` | POWER-DRIVEN HANDTOOLS |
| `3547` | ROLLING MILL MACHINERY AND EQUIPMENT |
| `3548` | ELECTRIC AND GAS WELDING AND SOLDERING EQUIPMENT |
| `3549` | METALWORKING MACHINERY, NOT ELSEWHERE CLASSIFIED |
| `3552` | TEXTILE MACHINERY |
| `3553` | WOODWORKING MACHINERY |
| `3554` | PAPER INDUSTRIES MACHINERY |
| `3555` | PRINTING TRADES MACHINERY AND EQUIPMENT |
| `3556` | FOOD PRODUCTS MACHINERY |
| `3559` | SPECIAL INDUSTRY MACHINERY, NOT ELSEWHERE CLASSIFIED |
| `3561` | PUMPS AND PUMPING EQUIPMENT |
| `3562` | BALL AND ROLLER BEARINGS |
| `3563` | AIR AND GAS COMPRESSORS |
| `3564` | INDUSTRIAL AND COMMERCIAL FANS AND BLOWERS AND AIR PURIFICATION EQUIPMENT |
| `3565` | PACKAGING MACHINERY |
| `3566` | SPEED CHANGERS, INDUSTRIAL HIGH-SPEED DRIVES, AND GEARS |
| `3567` | INDUSTRIAL PROCESS FURNACES AND OVENS |
| `3568` | MECHANICAL POWER TRANSMISSION EQUIPMENT, NOT ELSEWHERE CLASSIFIED |
| `3569` | GENERAL INDUSTRIAL MACHINERY AND EQUIPMENT, NOT ELSEWHERE CLASSIFIED |
| `3571` | ELECTRONIC COMPUTERS |
| `3572` | COMPUTER STORAGE DEVICES |
| `3575` | COMPUTER TERMINALS |
| `3577` | COMPUTER PERIPHERAL EQUIPMENT, NOT ELSEWHERE CLASSIFIED |
| `3578` | CALCULATING AND ACCOUNTING MACHINES, EXCEPT ELECTRONIC COMPUTERS |
| `3579` | OFFICE MACHINES, NOT ELSEWHERE CLASSIFIED |
| `3581` | AUTOMATIC VENDING MACHINES |
| `3582` | COMMERCIAL LAUNDRY, DRYCLEANING, AND PRESSING MACHINES |
| `3585` | AIR-CONDITIONING AND WARM AIR HEATING EQUIPMENT AND COMMERCIAL AN |
| `3586` | MEASURING AND DISPENSING PUMPS |
| `3589` | SERVICE INDUSTRY MACHINERY, NOT ELSEWHERE CLASSIFIED |
| `3592` | CARBURETORS, PISTONS, PISTON RINGS, AND VALVES |
| `3593` | FLUID POWER CYLINDERS AND ACTUATORS |
| `3594` | FLUID POWER PUMPS AND MOTORS |
| `3596` | SCALES AND BALANCES, EXCEPT LABORATORY |
| `3599` | INDUSTRIAL AND COMMERCIAL MACHINERY AND EQUIPMENT, NOT ELSEWHERE |
| `3612` | POWER, DISTRIBUTION, AND SPECIALTY TRANSFORMERS |
| `3613` | SWITCHGEAR AND SWITCHBOARD APPARATUS |
| `3621` | MOTORS AND GENERATORS |
| `3624` | CARBON AND GRAPHITE PRODUCTS |
| `3625` | RELAYS AND INDUSTRIAL CONTROLS |
| `3629` | ELECTRICAL INDUSTRIAL APPARATUS, NOT ELSEWHERE CLASSIFIED |
| `3631` | HOUSEHOLD COOKING EQUIPMENT |
| `3632` | HOUSEHOLD REFRIGERATORS AND HOME AND FARM FREEZERS |
| `3633` | HOUSEHOLD LAUNDRY EQUIPMENT |
| `3634` | ELECTRIC HOUSEWARES AND FANS |
| `3635` | HOUSEHOLD VACUUM CLEANERS |
| `3639` | HOUSEHOLD APPLIANCES, NOT ELSEWHERE CLASSIFIED |
| `3641` | ELECTRIC LAMP BULBS AND TUBES |
| `3643` | CURRENT-CARRYING WIRING DEVICES |
| `3644` | NONCURRENT-CARRYING WIRING DEVICES |

### `siteId` — FX Site ID  (2)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Domestic |

### `state` — State/Province  (82)

| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Alabama |
| `2` | Alaska |
| `3` | Arizona |
| `4` | Arkansas |
| `5` | California |
| `6` | Colorado |
| `7` | Connecticut |
| `8` | Delaware |
| `9` | District of Columbia |
| `10` | Florida |
| `11` | Georgia |
| `12` | Hawaii |
| `13` | Idaho |
| `14` | Illinois |
| `15` | Indiana |
| `16` | Iowa |
| `17` | Kansas |
| `18` | Kentucky |
| `19` | Louisiana |
| `20` | Maine |
| `21` | Maryland |
| `22` | Massachusetts |
| `23` | Michigan |
| `24` | Minnesota |
| `25` | Mississippi |
| `26` | Missouri |
| `27` | Montana |
| `28` | Nebraska |
| `29` | Nevada |
| `30` | New Hampshire |
| `31` | New Jersey |
| `32` | New Mexico |
| `33` | New York |
| `34` | North Carolina |
| `35` | North Dakota |
| `36` | Ohio |
| `37` | Oklahoma |
| `38` | Oregon |
| `39` | Pennsylvania |
| `40` | Rhode Island |
| `41` | South Carolina |
| `42` | South Dakota |
| `43` | Tennessee |
| `44` | Texas |
| `45` | Utah |
| `46` | Vermont |
| `47` | Virginia |
| `48` | Washington |
| `49` | West Virginia |
| `50` | Wisconsin |
| `51` | Wyoming |
| `52` | Guam |
| `53` | Puerto Rico |
| `54` | Virgin Islands (US) |
| `55` | Alberta |
| `56` | British Columbia |
| `57` | Manitoba |
| `58` | New Brunswick |
| `59` | Newfoundland and Labrador |
| `60` | Northwest Territories |
| `61` | Nova Scotia |
| `62` | Nunavut |
| `63` | Ontario |
| `64` | Prince Edward Island |
| `65` | Quebec |
| `66` | Saskatchewan |
| `67` | Yukon |
| `99` | Conversion Default |
| `100` | AB |
| `101` | BC |
| `102` | MB |
| `103` | NB |
| `104` | NL |
| `105` | NT |
| `106` | NS |
| `107` | NU |
| `108` | ON |
| `109` | PE |
| `110` | QC |
| `111` | SK |
| `112` | YT |

### `submissionInd` — Submission Indicator  (3)

| code | label |
|------|-------|
| `1` | Submitted directly to your institution |
| `2` | Not submitted directly to your institution |
| `3` | Not applicable |

### `supportType` — Support Type  (9)

| code | label |
|------|-------|
| `0` | Not Entered |
| `40` | Co-Borrower |
| `44` | Co-Maker |
| `48` | Endorser |
| `52` | Guarantor |
| `60` | Authorized Signer |
| `65` | Co-Owner of Collateral |
| `98` | Type Not Classified Elsewhere |
| `99` | Conversion Default |

### `sweepInd` — Sweep Indicator  (3)

| code | label |
|------|-------|
| `0` | Not Entered |
| `10` | Sweep |
| `15` | Overdraft Sweep |

### `timeZone` — Time Zone  (25)

| code | label |
|------|-------|
| `0` | Not entered |
| `1` | Greenwich Mean Time |
| `2` | British - Europe |
| `3` | Central - Europe |
| `4` | Eastern - Europe |
| `5` | Moskow - Europe |
| `6` | Coordinated Universal Time |
| `7` | Time Zone + 06 |
| `8` | Time Zone + 07 |
| `9` | Time Zone + 08 |
| `10` | Time Zone + 09 |
| `11` | Time Zone + 10 |
| `12` | Time Zone + 11 |
| `13` | Time Zone + 12 |
| `14` | Hawaii Aleutian - North America |
| `15` | Hawaii |
| `16` | Alaska - North America |
| `17` | Pacific - North America |
| `18` | Mountain - North America |
| `19` | Central - North America |
| `20` | Eastern - North America |
| `21` | Atlantic - North America |
| `22` | Newfoundland - North America |
| `23` | Time Zone - 02 |
| `24` | Time Zone - 05 |

### `type` — Type  (7)

| code | label |
|------|-------|
| `0` | 0 - Not Entered |
| `10` | 10 - Final Grade |
| `100` | 100 - Federal |
| `200` | 200 - State |
| `5` | 5 - Probability of Default |
| `6` | 6 - Loss Given Default |
| `99` | 99 - Conversion Default |

### `underwritingOfficer` — Officer 2  (14)

| code | label |
|------|-------|
| `0` | *Not Entered |
| `10111111` | Mary*Jones |
| `101111111` | Theresa*Apatow |
| `102222222` | Susan*Bartlett |
| `203333333` | Frieda*Cortez |
| `205555555` | Gary*Eugene |
| `310101010` | Howard*Juno |
| `312121212` | Debbie*Lyons |
| `415151515` | Paula*Opher |
| `415151516` | Tina *Curry |
| `520202020` | Fred*Terrace |
| `525252525` | Stanley*Yost |
| `626262626` | Adam*Zelinski |
| `789789789` | *Automation Officer |

### `waterRights` — Water Rights  (2)

| code | label |
|------|-------|
| `0` | No |
| `1` | Yes |

