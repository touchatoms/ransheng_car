# Used Car Static Site Design

## Goal

Build a low-cost, easy-to-maintain Chinese used-car dealership website for 冉升车行 and domestic customers. The site is static, reads vehicle inventory from JSON, supports many car images, and can be deployed for free on Cloudflare Pages.

The design references the information structure of Guazi used-car listings: dense filters, scannable vehicle cards, strong price display, vehicle tags, and detail pages with many photos. It must not copy Guazi branding, colors, layout pixels, or protected assets.

## Audience

Primary visitors are mainland China customers browsing available used cars. They expect:

- Chinese language.
- RMB prices.
- Quick comparison by brand, price, year, mileage, and vehicle type.
- Easy contact through WeChat and phone.
- Clear photos and trust signals before booking a viewing.

## Site Structure

### Home Page

The home page acts as a dealership storefront.

It includes:

- Header with the 冉升车行 name, navigation, phone, and WeChat call-to-action.
- First screen with a clear offer: local used cars, appointment viewing, and direct consultation.
- Quick search or filter entry points for price ranges, brands, and vehicle types.
- Featured vehicles.
- Recently added vehicles.
- Trust/service section covering inspection, transfer support, finance support, and after-sales communication.
- Contact strip with phone, WeChat, address, and business hours.

### Vehicle List Page

The list page is the main browsing experience.

It includes:

- Filter bar for brand, price range, vehicle type, vehicle age, mileage, fuel type, and transmission.
- Sort options for default, newest, lowest price, highest price, lowest mileage, and newest year.
- Vehicle cards with:
  - Main image.
  - Vehicle name.
  - Year, mileage, location, fuel or displacement, and transmission.
  - Status tags such as `已检测`, `准新车`, `急售`, `一手车`, `新能源`.
  - RMB price.
  - Optional original price or discount text.
- Empty state when no cars match filters.

Clicking a card opens the vehicle detail page using the vehicle `id`.

### Vehicle Detail Page

The detail page prioritizes photos, price, and contact.

It includes:

- Large image gallery with thumbnails.
- Vehicle title, price, tags, and consultation buttons.
- Key facts: registration year, mileage, location, fuel type, transmission, displacement, ownership count, and color.
- Vehicle highlights from JSON.
- Parameter/spec table.
- Configuration section.
- Inspection or service notes.
- Contact panel with phone, WeChat, address, and business hours.

The detail page must handle many images without changing the page layout. Images are displayed through a gallery and thumbnail strip.

### Company Page

The company page builds trust.

It includes:

- Dealership introduction.
- Service flow: choose car, book viewing, inspect car, sign contract, transfer ownership.
- Service promises.
- Store photos can be added later.
- Basic company details and address.

### Contact Page

The contact page is action oriented.

It includes:

- Phone.
- WeChat ID and a configurable QR image path, such as `assets/contact/wechat-qr.jpg`.
- LINE field can remain optional, but WeChat and phone are primary for domestic customers.
- Address.
- Business hours.
- External map link button instead of a map SDK.

## Data Model

All vehicles live in `data/cars.json`.

Each car should use this shape:

```json
{
  "id": "toyota-camry-2021-001",
  "status": "available",
  "featured": true,
  "name": "丰田 凯美瑞 2021款 2.5G 豪华版",
  "brand": "丰田",
  "series": "凯美瑞",
  "type": "轿车",
  "price": 128000,
  "originalPrice": 145000,
  "year": 2021,
  "mileage": 3.8,
  "location": "苏州",
  "fuel": "汽油",
  "transmission": "自动",
  "displacement": "2.5L",
  "color": "白色",
  "owners": "一手车",
  "emission": "国六",
  "tags": ["已检测", "一手车", "高保值"],
  "coverImage": "assets/cars/toyota-camry-2021-001/cover.jpg",
  "images": [
    "assets/cars/toyota-camry-2021-001/cover.jpg",
    "assets/cars/toyota-camry-2021-001/interior-1.jpg"
  ],
  "features": ["原版原漆", "全程4S店保养", "支持第三方检测"],
  "specs": {
    "上牌时间": "2021年6月",
    "表显里程": "3.8万公里",
    "排量": "2.5L",
    "变速箱": "自动",
    "车辆所在地": "苏州"
  },
  "description": "车况整洁，适合家庭通勤使用，可预约到店看车。"
}
```

The initial site will include fake sample vehicles and generated sample images. Real inventory can replace these later by editing the JSON and image files.

## Image Rules

Vehicle images are stored by vehicle id:

```text
assets/cars/<car-id>/cover.jpg
assets/cars/<car-id>/exterior-1.jpg
assets/cars/<car-id>/interior-1.jpg
assets/cars/<car-id>/detail-1.jpg
```

The `coverImage` field controls the list card image. The `images` array controls the detail gallery order.

Images should be compressed before deployment when possible. The site should use responsive image containers so missing or differently sized images do not break layout.

## Technical Architecture

Use a plain static site:

```text
index.html
styles.css
app.js
data/cars.json
assets/
```

No database, backend, build step, or paid service is required.

Routing can use query parameters:

- `index.html`
- `index.html?page=cars`
- `index.html?page=car&id=toyota-camry-2021-001`
- `index.html?page=about`
- `index.html?page=contact`

This keeps Cloudflare Pages deployment simple and avoids server rewrite configuration.

## Behavior

`app.js` loads `data/cars.json`, stores the vehicle list in memory, and renders the current page based on the query parameters.

Expected behavior:

- Home page shows featured and newest vehicles.
- List page supports filtering and sorting.
- Detail page finds a vehicle by `id`; if missing, shows a friendly not-found state.
- Gallery swaps the main image when a thumbnail is clicked.
- Contact buttons use configured phone and WeChat text.
- Layout works on desktop and mobile.

## Styling Direction

The interface should feel like a practical local car dealership site:

- Clean white/gray base for readability.
- Strong price color.
- Green or teal accent can imply trust and freshness, but should not imitate Guazi exactly.
- Dense but organized vehicle information.
- Cards with restrained borders and 8px or smaller radius.
- Sticky or prominent contact actions on mobile.

Avoid decorative landing-page styling. The first screen should show real inventory signals quickly.

## Deployment

Deploy through Cloudflare Pages:

1. Push the static site directory to a GitHub repository.
2. Create a Cloudflare Pages project.
3. Connect the repository.
4. Use no build command.
5. Set output directory to `/` or leave default for static root.
6. Deploy.

Future updates:

- Edit `data/cars.json`.
- Add or replace images under `assets/cars/<car-id>/`.
- Commit and push.
- Cloudflare Pages redeploys automatically.

## Verification

Before calling the implementation complete:

- Start a local static server.
- Open the site in a browser.
- Verify home page renders vehicles from JSON.
- Verify filters and sorting on the vehicle list.
- Verify clicking a car opens the detail page.
- Verify the gallery works with multiple images.
- Verify missing car id shows a not-found state.
- Verify mobile layout at a narrow viewport.
- Verify Cloudflare-compatible static paths.

## Out of Scope

The first version will not include:

- Admin login or CMS.
- Database.
- Online payment.
- User accounts.
- Real-time stock synchronization.
- Map SDK integration.
- Finance calculator.

These can be added later if the business needs them.
